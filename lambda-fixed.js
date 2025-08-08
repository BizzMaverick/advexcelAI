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
    const { amount } = body;
    const orderId = 'order_' + Date.now() + Math.random().toString(36).substr(2, 9);
    
    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
            success: true, 
            orderId: orderId,
            amount: amount
        })
    };
}

async function verifyPayment(body, headers) {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, userEmail } = body;
    
    const text = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(text)
        .digest('hex');

    if (expectedSignature !== razorpay_signature) {
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