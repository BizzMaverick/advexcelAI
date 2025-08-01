const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");

const MAX_DATA_SIZE = 100000;
const MAX_ROWS = 1000;
const TIMEOUT_MS = 25000;

// Data processing functions
function sortData(data, column, order = 'asc') {
    if (!data || data.length < 2) return data;
    
    const headers = data[0];
    const rows = data.slice(1);
    const colIndex = headers.findIndex(h => h.toString().toLowerCase().includes(column.toLowerCase()));
    
    if (colIndex === -1) return data;
    
    const sortedRows = rows.sort((a, b) => {
        const aVal = isNaN(a[colIndex]) ? a[colIndex] : Number(a[colIndex]);
        const bVal = isNaN(b[colIndex]) ? b[colIndex] : Number(b[colIndex]);
        
        if (order === 'desc') return bVal > aVal ? 1 : -1;
        return aVal > bVal ? 1 : -1;
    });
    
    return [headers, ...sortedRows];
}

function filterData(data, column, value) {
    if (!data || data.length < 2) return data;
    
    const headers = data[0];
    const rows = data.slice(1);
    const colIndex = headers.findIndex(h => h.toString().toLowerCase().includes(column.toLowerCase()));
    
    if (colIndex === -1) return data;
    
    const filteredRows = rows.filter(row => 
        row[colIndex].toString().toLowerCase().includes(value.toLowerCase())
    );
    
    return [headers, ...filteredRows];
}

function calculateStats(data, column) {
    if (!data || data.length < 2) return null;
    
    const headers = data[0];
    const rows = data.slice(1);
    const colIndex = headers.findIndex(h => h.toString().toLowerCase().includes(column.toLowerCase()));
    
    if (colIndex === -1) return null;
    
    const values = rows.map(row => Number(row[colIndex])).filter(v => !isNaN(v));
    if (values.length === 0) return null;
    
    return {
        count: values.length,
        sum: values.reduce((a, b) => a + b, 0),
        average: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values)
    };
}

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || 'https://www.advexcel.online',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'POST,OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        if (!event.body) throw new Error('Request body is required');

        const { fileData, prompt, fileName } = JSON.parse(event.body);

        // Validation
        if (!fileData || !Array.isArray(fileData)) throw new Error('fileData must be a valid array');
        if (!prompt || typeof prompt !== 'string') throw new Error('prompt is required');
        if (!fileName || typeof fileName !== 'string') throw new Error('fileName is required');

        const dataSize = JSON.stringify(fileData).length;
        if (dataSize > MAX_DATA_SIZE) throw new Error(`Data too large. Maximum size: ${MAX_DATA_SIZE} bytes`);
        if (fileData.length > MAX_ROWS) throw new Error(`Too many rows. Maximum: ${MAX_ROWS} rows`);

        const sanitizedPrompt = prompt.trim().toLowerCase();
        const sanitizedFileName = fileName.replace(/[<>:"/\\|?*]/g, '').substring(0, 100);

        // Process data based on prompt
        let processedData = fileData;
        let operation = 'other';
        let explanation = 'Data processed';

        if (sanitizedPrompt.includes('sort')) {
            operation = 'sort';
            if (sanitizedPrompt.includes('age')) {
                processedData = sortData(fileData, 'age');
                explanation = 'Data sorted by age';
            } else if (sanitizedPrompt.includes('name') || sanitizedPrompt.includes('country')) {
                processedData = sortData(fileData, 'country');
                explanation = 'Data sorted by country name';
            } else if (sanitizedPrompt.includes('rank')) {
                processedData = sortData(fileData, 'rank');
                explanation = 'Data sorted by rank';
            } else {
                // Try to find column to sort by
                const words = sanitizedPrompt.split(' ');
                const headers = fileData[0] || [];
                for (const word of words) {
                    const matchingHeader = headers.find(h => h.toString().toLowerCase().includes(word));
                    if (matchingHeader) {
                        processedData = sortData(fileData, word);
                        explanation = `Data sorted by ${matchingHeader}`;
                        break;
                    }
                }
            }
        } else if (sanitizedPrompt.includes('filter')) {
            operation = 'filter';
            // Simple filter implementation
            const words = sanitizedPrompt.split(' ');
            const filterValue = words[words.length - 1];
            processedData = filterData(fileData, words[1] || 'name', filterValue);
            explanation = `Data filtered by ${filterValue}`;
        } else if (sanitizedPrompt.includes('calculate') || sanitizedPrompt.includes('average') || sanitizedPrompt.includes('sum')) {
            operation = 'analytics';
            const stats = calculateStats(fileData, 'age') || calculateStats(fileData, fileData[0]?.[1]);
            if (stats) {
                explanation = `Statistics calculated: Average: ${stats.average.toFixed(2)}, Sum: ${stats.sum}, Count: ${stats.count}`;
            }
        } else {
            // Use AI for complex requests
            const bedrockClient = new BedrockRuntimeClient({ region: 'us-east-1' });
            
            const command = new InvokeModelCommand({
                modelId: "anthropic.claude-3-sonnet-20240229-v1:0",
                contentType: "application/json",
                accept: "application/json",
                body: JSON.stringify({
                    anthropic_version: "bedrock-2023-05-31",
                    max_tokens: 1000,
                    messages: [{
                        role: "user",
                        content: `Analyze this Excel data and provide insights for: "${prompt}"\n\nData: ${JSON.stringify(fileData.slice(0, 10))}\n\nProvide a brief analysis or answer.`
                    }]
                })
            });

            const response = await bedrockClient.send(command);
            const responseBody = JSON.parse(new TextDecoder().decode(response.body));
            explanation = responseBody.content[0].text.substring(0, 500);
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                response: explanation,
                structured: {
                    operation,
                    result: processedData,
                    explanation,
                    success: true
                },
                fileName: sanitizedFileName
            })
        };

    } catch (error) {
        console.error('Lambda error:', error);
        
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