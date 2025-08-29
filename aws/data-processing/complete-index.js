const AWS = require('aws-sdk');

const bedrock = new AWS.BedrockRuntime({
    region: 'us-east-1'
});

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.requestContext.http.method === 'OPTIONS') {
        return { statusCode: 200, headers };
    }

    try {
        const body = JSON.parse(event.body);
        const { prompt, csvContent } = body;

        if (!csvContent) {
            throw new Error('No data provided');
        }

        const bedrockPrompt = `Human: Analyze this data: "${prompt}"

Data:
${csvContent.substring(0, 4000)}

Provide comprehensive analysis with insights and recommendations.