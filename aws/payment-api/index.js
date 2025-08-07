const AWS = require('aws-sdk');
const crypto = require('crypto');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = 'excel-ai-payments';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers };
    }

    try {
        const { action } = JSON.parse(event.body || '{}');

        if (action === 'verify-payment') {
            return await verifyPayment(event, headers);
        } else if (action === 'check-status') {
            return await checkPaymentStatus(event, headers);
        }

        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Invalid action' })
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};

async function verifyPayment(event, headers) {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, userEmail } = JSON.parse(event.body);

    // Verify Razorpay signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

    if (expectedSignature !== razorpay_signature) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Invalid payment signature' })
        };
    }

    // Store verified payment in DynamoDB
    const paymentRecord = {
        userEmail,
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        status: 'verified',
        amount: 24900,
        currency: 'INR',
        timestamp: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
    };

    await dynamodb.put({
        TableName: TABLE_NAME,
        Item: paymentRecord
    }).promise();

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
            success: true, 
            message: 'Payment verified successfully',
            expiryDate: paymentRecord.expiryDate
        })
    };
}

async function checkPaymentStatus(event, headers) {
    const { userEmail } = JSON.parse(event.body);

    const result = await dynamodb.get({
        TableName: TABLE_NAME,
        Key: { userEmail }
    }).promise();

    if (!result.Item) {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ hasValidPayment: false })
        };
    }

    const payment = result.Item;
    const isValid = payment.status === 'verified' && new Date(payment.expiryDate) > new Date();

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
            hasValidPayment: isValid,
            expiryDate: payment.expiryDate
        })
    };
}