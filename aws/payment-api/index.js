const crypto = require('crypto');
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    // Handle OPTIONS preflight request
    if (event.requestContext.http.method === 'OPTIONS') {
        return {
            statusCode: 200,
            headers
        };
    }

    try {
        const body = JSON.parse(event.body);
        const { action } = body;

        if (action === 'verify-payment') {
            return await verifyPayment(body, headers);
        } else if (action === 'check-status') {
            return await checkPaymentStatus(body, headers);
        } else if (action === 'create-order') {
            return await createOrder(body, headers);
        } else if (action === 'start-trial') {
            return await startTrial(body, headers);
        } else if (action === 'use-prompt') {
            return await usePrompt(body, headers);
        }

        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Invalid action' })
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message })
        };
    }
};

async function createOrder(body, headers) {
    const { amount, userEmail } = body;
    
    const orderData = {
        amount: amount,
        currency: 'INR',
        receipt: 'receipt_' + Date.now(),
        notes: {
            userEmail: userEmail
        }
    };
    
    try {
        const auth = Buffer.from(process.env.RAZORPAY_KEY_ID + ':' + process.env.RAZORPAY_KEY_SECRET).toString('base64');
        
        const response = await fetch('https://api.razorpay.com/v1/orders', {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + auth,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });
        
        const order = await response.json();
        
        if (response.ok) {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ 
                    success: true, 
                    orderId: order.id,
                    amount: order.amount
                })
            };
        } else {
            throw new Error('Razorpay API error: ' + JSON.stringify(order));
        }
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ success: false, error: error.message })
        };
    }
}

async function verifyPayment(body, headers) {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, userEmail } = body;
    
    // Correct signature verification format
    const text = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(text.toString())
        .digest('hex');

    console.log('Expected:', expectedSignature);
    console.log('Received:', razorpay_signature);
    console.log('Text used:', text);

    if (expectedSignature !== razorpay_signature) {
        console.log('Signature verification failed');
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ success: false, error: 'Invalid signature' })
        };
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    await dynamodb.put({
        TableName: 'excel-ai-payments',
        Item: {
            userEmail,
            paymentId: razorpay_payment_id,
            expiryDate: expiryDate.toISOString(),
            createdAt: new Date().toISOString(),
            isPaid: true,
            trialExpired: true // Mark trial as expired since they paid
        }
    }).promise();

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true })
    };
}

async function startTrial(body, headers) {
    const { userEmail } = body;
    
    try {
        // Check if user already exists
        const existing = await dynamodb.get({
            TableName: 'excel-ai-payments',
            Key: { userEmail }
        }).promise();
        
        if (existing.Item) {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true, message: 'Trial already exists' })
            };
        }
        
        // Create new trial user
        const trialExpiryDate = new Date();
        trialExpiryDate.setDate(trialExpiryDate.getDate() + 3); // 3 days trial
        
        await dynamodb.put({
            TableName: 'excel-ai-payments',
            Item: {
                userEmail,
                trialStartDate: new Date().toISOString(),
                trialExpiryDate: trialExpiryDate.toISOString(),
                dailyPrompts: 0,
                lastPromptDate: new Date().toISOString().split('T')[0], // Today's date
                isPaid: false,
                trialExpired: false
            }
        }).promise();
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, message: 'Trial started' })
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ success: false, error: error.message })
        };
    }
}

async function usePrompt(body, headers) {
    const { userEmail } = body;
    const today = new Date().toISOString().split('T')[0];
    
    try {
        const result = await dynamodb.get({
            TableName: 'excel-ai-payments',
            Key: { userEmail }
        }).promise();
        
        if (!result.Item) {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ canUse: false, reason: 'No trial or payment found' })
            };
        }
        
        const user = result.Item;
        
        // If user has paid, allow unlimited usage
        if (user.isPaid) {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ canUse: true, reason: 'Paid user' })
            };
        }
        
        // Check if trial has expired
        if (new Date() > new Date(user.trialExpiryDate)) {
            await dynamodb.update({
                TableName: 'excel-ai-payments',
                Key: { userEmail },
                UpdateExpression: 'SET trialExpired = :expired',
                ExpressionAttributeValues: {
                    ':expired': true
                }
            }).promise();
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ canUse: false, reason: 'Trial expired' })
            };
        }
        
        // Reset daily prompts if it's a new day
        if (user.lastPromptDate !== today) {
            await dynamodb.update({
                TableName: 'excel-ai-payments',
                Key: { userEmail },
                UpdateExpression: 'SET dailyPrompts = :zero, lastPromptDate = :today',
                ExpressionAttributeValues: {
                    ':zero': 0,
                    ':today': today
                }
            }).promise();
            user.dailyPrompts = 0;
        }
        
        // Check daily limit
        if (user.dailyPrompts >= 25) {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ 
                    canUse: false, 
                    reason: 'Daily limit reached',
                    promptsUsed: user.dailyPrompts,
                    promptsRemaining: 0
                })
            };
        }
        
        // Increment prompt count
        await dynamodb.update({
            TableName: 'excel-ai-payments',
            Key: { userEmail },
            UpdateExpression: 'SET dailyPrompts = dailyPrompts + :inc',
            ExpressionAttributeValues: {
                ':inc': 1
            }
        }).promise();
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                canUse: true, 
                reason: 'Trial active',
                promptsUsed: user.dailyPrompts + 1,
                promptsRemaining: 24 - user.dailyPrompts
            })
        };
        
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ canUse: false, error: error.message })
        };
    }
}

async function checkPaymentStatus(body, headers) {
    const { userEmail } = body;
    
    console.log('Checking payment status for:', userEmail);
    
    // Admin access
    if (userEmail === 'katragadda225@gmail.com') {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                hasValidPayment: true,
                isAdmin: true,
                promptsRemaining: 999
            })
        };
    }

    try {
        console.log('Querying DynamoDB for:', userEmail);
        const result = await dynamodb.get({
            TableName: 'excel-ai-payments',
            Key: { userEmail }
        }).promise();

        console.log('DynamoDB result:', result);

        if (!result.Item) {
            console.log('No user found, needs trial');
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ 
                    hasValidPayment: false,
                    needsTrial: true
                })
            };
        }
        
        const user = result.Item;
        const today = new Date().toISOString().split('T')[0];
        
        // If user has paid subscription
        if (user.isPaid && user.expiryDate && new Date(user.expiryDate) > new Date()) {
            console.log('Has valid payment');
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ 
                    hasValidPayment: true,
                    promptsRemaining: 999
                })
            };
        }
        
        // Check trial status
        const trialActive = new Date() <= new Date(user.trialExpiryDate);
        
        if (!trialActive) {
            console.log('Trial expired');
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ 
                    hasValidPayment: false,
                    trialExpired: true
                })
            };
        }
        
        // Calculate remaining prompts for today
        let dailyPrompts = user.dailyPrompts || 0;
        if (user.lastPromptDate !== today) {
            dailyPrompts = 0; // Reset for new day
        }
        
        const promptsRemaining = Math.max(0, 25 - dailyPrompts);
        
        console.log('Trial active, prompts remaining:', promptsRemaining);
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                hasValidPayment: true, // Trial counts as valid access
                inTrial: true,
                trialExpiryDate: user.trialExpiryDate,
                promptsRemaining: promptsRemaining,
                promptsUsed: dailyPrompts
            })
        };

    } catch (error) {
        console.log('DynamoDB error:', error);
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                hasValidPayment: false,
                error: error.message
            })
        };
    }
}