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