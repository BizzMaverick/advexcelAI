const crypto = require('crypto');
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, X-Razorpay-Signature',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    try {
        // Verify webhook signature
        const webhookSignature = event.headers['x-razorpay-signature'];
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
        
        const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(event.body)
            .digest('hex');

        if (expectedSignature !== webhookSignature) {
            console.log('Webhook signature verification failed');
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid signature' })
            };
        }

        const payload = JSON.parse(event.body);
        
        // Handle payment.captured event
        if (payload.event === 'payment.captured') {
            const payment = payload.payload.payment.entity;
            
            // Extract user email from notes
            const userEmail = payment.notes?.userEmail;
            
            if (!userEmail) {
                console.log('No user email found in payment notes');
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'No user email' })
                };
            }

            // Set expiry date (30 days from now)
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 30);

            // Store payment in DynamoDB
            await dynamodb.put({
                TableName: 'ExcelAIPayments',
                Item: {
                    userEmail: userEmail,
                    paymentId: payment.id,
                    amount: payment.amount,
                    currency: payment.currency,
                    status: payment.status,
                    expiryDate: expiryDate.toISOString(),
                    createdAt: new Date().toISOString(),
                    webhookProcessed: true
                }
            }).promise();

            console.log(`Payment processed for user: ${userEmail}, payment ID: ${payment.id}`);
            
            // Send alert email (optional - can be implemented with SES)
            // TODO: Send email to contact@advexcel.online about new payment
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true, message: 'Payment processed' })
            };
        }

        // For other events, just acknowledge
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, message: 'Event received' })
        };

    } catch (error) {
        console.error('Webhook processing error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message })
        };
    }
};