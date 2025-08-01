const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");
const { S3Client, GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");

const bedrockClient = new BedrockRuntimeClient({ region: process.env.AWS_REGION });
const s3Client = new S3Client({ region: process.env.AWS_REGION });

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'POST,OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    console.log('Event:', JSON.stringify(event, null, 2));

    try {
        const { fileData, prompt, fileName } = JSON.parse(event.body);
        
        // Prepare prompt for Claude
        const systemPrompt = `You are an Excel AI assistant. Analyze the provided Excel/CSV data and respond to user commands.
        
Data format: The data is provided as an array of arrays where the first row contains headers.
Your task: ${prompt}

Please provide a clear, actionable response. If the user asks for data manipulation, describe what changes should be made.`;

        const userPrompt = `File: ${fileName}
Data: ${JSON.stringify(fileData.slice(0, 50))} ${fileData.length > 50 ? '...(truncated)' : ''}

Command: ${prompt}`;

        // Call Bedrock Claude
        const input = {
            modelId: "amazon.nova-premier-v1:0:8k",
            contentType: "application/json",
            accept: "application/json",
            body: JSON.stringify({
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                text: `${systemPrompt}\n\n${userPrompt}`
                            }
                        ]
                    }
                ],
                inferenceConfig: {
                    max_new_tokens: 1000,
                    temperature: 0.7
                }
            })
        };

        const command = new InvokeModelCommand(input);
        const response = await bedrockClient.send(command);
        
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));
        const aiResponse = responseBody.output.message.content[0].text;

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                response: aiResponse,
                fileName: fileName
            })
        };

    } catch (error) {
        console.error('Error:', error);
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