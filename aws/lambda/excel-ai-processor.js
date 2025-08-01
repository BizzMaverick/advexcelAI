const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'POST,OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    console.log('Event received:', JSON.stringify(event, null, 2));

    try {
        const { fileData, prompt, fileName } = JSON.parse(event.body);
        console.log('Parsed request:', { fileName, prompt, dataRows: fileData.length });
        
        const bedrockClient = new BedrockRuntimeClient({ 
            region: 'us-east-1'
        });

        const modelInput = {
            anthropic_version: "bedrock-2023-05-31",
            max_tokens: 1000,
            messages: [{
                role: "user",
                content: `You are an Excel AI assistant. Analyze this data and respond to the user's request.

File: ${fileName}
Request: ${prompt}
Data (first 10 rows): ${JSON.stringify(fileData.slice(0, 10))}
Total rows: ${fileData.length}

Please provide a helpful response about the data analysis.`
            }]
        };

        const command = new InvokeModelCommand({
            modelId: "anthropic.claude-3-sonnet-20240229-v1:0",
            contentType: "application/json",
            accept: "application/json",
            body: JSON.stringify(modelInput)
        });

        console.log('Calling Bedrock...');
        const response = await bedrockClient.send(command);
        
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));
        console.log('Bedrock response received');

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                response: responseBody.content[0].text,
                fileName: fileName
            })
        };

    } catch (error) {
        console.error('Lambda error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: error.message
            })
        };
    }
};