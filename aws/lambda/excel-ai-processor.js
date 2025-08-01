const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");

const MAX_DATA_SIZE = 100000; // 100KB limit
const MAX_ROWS = 1000; // Max rows to process
const TIMEOUT_MS = 25000; // 25 second timeout

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || 'https://www.advexcel.online',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'POST,OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    console.log('Request received:', { 
        httpMethod: event.httpMethod, 
        origin: event.headers?.origin,
        userAgent: event.headers?.['user-agent']
    });

    try {
        // Input validation
        if (!event.body) {
            throw new Error('Request body is required');
        }

        let requestData;
        try {
            requestData = JSON.parse(event.body);
        } catch (e) {
            throw new Error('Invalid JSON in request body');
        }

        const { fileData, prompt, fileName } = requestData;

        // Validate required fields
        if (!fileData || !Array.isArray(fileData)) {
            throw new Error('fileData must be a valid array');
        }
        if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
            throw new Error('prompt is required and must be a non-empty string');
        }
        if (!fileName || typeof fileName !== 'string') {
            throw new Error('fileName is required');
        }

        // Size and safety limits
        const dataSize = JSON.stringify(fileData).length;
        if (dataSize > MAX_DATA_SIZE) {
            throw new Error(`Data too large. Maximum size: ${MAX_DATA_SIZE} bytes`);
        }
        if (fileData.length > MAX_ROWS) {
            throw new Error(`Too many rows. Maximum: ${MAX_ROWS} rows`);
        }

        // Sanitize inputs
        const sanitizedPrompt = prompt.trim().substring(0, 500);
        const sanitizedFileName = fileName.replace(/[<>:"/\\|?*]/g, '').substring(0, 100);
        
        // Limit data for AI processing (first 50 rows for analysis)
        const limitedData = fileData.slice(0, 50);

        console.log('Processing request:', { 
            fileName: sanitizedFileName, 
            prompt: sanitizedPrompt.substring(0, 100),
            dataRows: fileData.length,
            limitedRows: limitedData.length
        });

        const bedrockClient = new BedrockRuntimeClient({ 
            region: process.env.AWS_REGION || 'us-east-1',
            maxAttempts: 2
        });

        const command = new InvokeModelCommand({
            modelId: "anthropic.claude-3-sonnet-20240229-v1:0",
            contentType: "application/json",
            accept: "application/json",
            body: JSON.stringify({
                anthropic_version: "bedrock-2023-05-31",
                max_tokens: 1500,
                messages: [
                    {
                        role: "user",
                        content: `You are a data processor. You must ACTUALLY PROCESS the data, not give instructions.

DATA: ${JSON.stringify(fileData)}
TASK: ${sanitizedPrompt}

You MUST return ONLY this JSON format with the PROCESSED data:
{
  "operation": "sort",
  "result": [ACTUAL_PROCESSED_DATA_ARRAY_HERE],
  "explanation": "brief description",
  "success": true
}

DO NOT give steps or instructions. PROCESS the data and return the result.
For "sort by age": return the actual sorted array.
For "filter": return the actual filtered array.
For "calculate": return the data with calculations.

PROCESS THE DATA NOW:`
                    }
                ]
            })
        });

        // Set timeout for Bedrock call
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Bedrock request timeout')), TIMEOUT_MS)
        );

        const response = await Promise.race([
            bedrockClient.send(command),
            timeoutPromise
        ]);

        const responseBody = JSON.parse(new TextDecoder().decode(response.body));
        const aiResponse = responseBody.content[0].text;

        console.log('Bedrock response received, length:', aiResponse.length);

        // Parse structured response safely
        let structuredResponse = null;
        try {
            // Extract JSON from response if wrapped in text
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
            const jsonStr = jsonMatch ? jsonMatch[0] : aiResponse;
            structuredResponse = JSON.parse(jsonStr);
        } catch (e) {
            console.log('Failed to parse structured response:', e.message);
            structuredResponse = {
                operation: "other",
                result: aiResponse.substring(0, 1000), // Limit response size
                explanation: "AI response",
                success: true
            };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                response: aiResponse.substring(0, 2000), // Limit response size
                structured: structuredResponse,
                fileName: sanitizedFileName
            })
        };

    } catch (error) {
        console.error('Lambda error:', error);
        
        // Don't expose internal errors to client
        const clientError = error.message.includes('Data too large') || 
                           error.message.includes('Too many rows') ||
                           error.message.includes('required') ||
                           error.message.includes('Invalid JSON')
                           ? error.message 
                           : 'Internal server error';

        return {
            statusCode: error.message.includes('required') || error.message.includes('Invalid') ? 400 : 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: clientError
            })
        };
    }
};