const Razorpay = require('razorpay');
const AWS = require('aws-sdk');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { amount, currency = 'INR', userEmail, planName } = JSON.parse(event.body);
    
    // Create order with Razorpay
    const order = await razorpay.orders.create({
      amount: amount, // amount in paise
      currency: currency,
      receipt: `receipt_${Date.now()}`,
    });
    
    // Store order in DynamoDB
    await dynamodb.put({
      TableName: process.env.ORDERS_TABLE,
      Item: {
        orderId: order.id,
        amount: amount,
        currency: currency,
        userEmail: userEmail,
        planName: planName,
        status: 'created',
        createdAt: new Date().toISOString(),
      }
    }).promise();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(order),
    };
  } catch (error) {
    console.error('Error creating order:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to create order' }),
    };
  }
};