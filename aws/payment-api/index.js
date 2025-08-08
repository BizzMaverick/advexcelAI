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
        TableName: 'ExcelAIPayments',
        Item: {
            userEmail,
            paymentId: razorpay_payment_id,
            expiryDate: expiryDate.toISOString(),
            createdAt: new Date().toISOString()
        }
    }).promise();

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true })
    };
}

async function checkPaymentStatus(body, headers) {
    const { userEmail } = body;
    
    if (userEmail === 'katragadda225@gmail.com') {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ hasValidPayment: true })
        };
    }

    try {
        const result = await dynamodb.get({
            TableName: 'ExcelAIPayments',
            Key: { userEmail }
        }).promise();

        const hasValidPayment = result.Item && new Date(result.Item.expiryDate) > new Date();

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ hasValidPayment })
        };
    } catch (error) {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ hasValidPayment: false })
        };
    }
}