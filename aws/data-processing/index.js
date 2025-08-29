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
        return {
            statusCode: 200,
            headers
        };
    }

    try {
        const body = JSON.parse(event.body);
        const { prompt, fileContent, csvContent } = body;

        let dataToAnalyze = '';
        
        if (csvContent) {
            dataToAnalyze = csvContent;
        } else if (fileContent) {
            dataToAnalyze = 'File data processed';
        } else {
            throw new Error('No data provided');
        }

        const bedrockPrompt = `Human: You are an expert data analyst. Analyze the following data and respond to this request: "${prompt}"

Data:
${dataToAnalyze.substring(0, 4000)}${dataToAnalyze.length > 4000 ? '...(truncated)' : ''}

Please provide:
1. A comprehensive analysis
2. Key insights and patterns  
3. Actionable recommendations
4. If applicable, create summary tables

Respond in a clear, professional manner with specific findings.