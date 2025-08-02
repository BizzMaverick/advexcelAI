const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");

const MAX_DATA_SIZE = 100000;
const MAX_ROWS = 1000;
const TIMEOUT_MS = 25000;

// Data processing functions
function sortData(data, column, order = 'asc') {
    if (!data || data.length < 2) return data;
    
    const headers = data[0];
    const rows = data.slice(1);
    console.log('Sorting by column:', column);
    console.log('Headers:', headers);
    const colIndex = headers.findIndex(h => h.toString().toLowerCase().includes(column.toLowerCase()));
    console.log('Column index found:', colIndex);
    
    if (colIndex === -1) {
        console.log('Column not found, returning original data');
        return data;
    }
    
    const sortedRows = rows.sort((a, b) => {
        const aVal = String(a[colIndex] || '').toLowerCase();
        const bVal = String(b[colIndex] || '').toLowerCase();
        
        if (order === 'desc') return bVal.localeCompare(aVal);
        return aVal.localeCompare(bVal);
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
            const words = sanitizedPrompt.split(' ');
            const headers = fileData[0] || [];
            
            // Find column to sort by
            let sortColumn = null;
            for (const word of words) {
                const matchingHeader = headers.find(h => h.toString().toLowerCase().includes(word.toLowerCase()));
                if (matchingHeader) {
                    sortColumn = word;
                    break;
                }
            }
            
            if (sortColumn) {
                const order = sanitizedPrompt.includes('desc') || sanitizedPrompt.includes('descending') ? 'desc' : 'asc';
                processedData = sortData(fileData, sortColumn, order);
                explanation = `Data sorted by ${sortColumn} (${order}ending)`;
            } else {
                explanation = 'Column not found for sorting';
            }
        } else if (sanitizedPrompt.includes('filter')) {
            operation = 'filter';
            const words = sanitizedPrompt.split(' ');
            let filterValue = words[words.length - 1];
            let filterColumn = 'country'; // default
            
            // Find column to filter by
            const headers = fileData[0] || [];
            for (let i = 0; i < words.length - 1; i++) {
                const matchingHeader = headers.find(h => h.toString().toLowerCase().includes(words[i].toLowerCase()));
                if (matchingHeader) {
                    filterColumn = words[i];
                    break;
                }
            }
            
            processedData = filterData(fileData, filterColumn, filterValue);
            explanation = `Data filtered by ${filterColumn} containing '${filterValue}'`;
        } else if (sanitizedPrompt.includes('calculate') || sanitizedPrompt.includes('average') || sanitizedPrompt.includes('sum') || sanitizedPrompt.includes('count') || sanitizedPrompt.includes('min') || sanitizedPrompt.includes('max')) {
            operation = 'analytics';
            const headers = fileData[0] || [];
            let targetColumn = 'total';
            
            // Find numeric column
            const words = sanitizedPrompt.split(' ');
            for (const word of words) {
                const matchingHeader = headers.find(h => h.toString().toLowerCase().includes(word.toLowerCase()));
                if (matchingHeader) {
                    targetColumn = word;
                    break;
                }
            }
            
            const stats = calculateStats(fileData, targetColumn);
            if (stats) {
                processedData = [['Statistic', 'Value'], 
                    ['Count', stats.count],
                    ['Sum', stats.sum.toFixed(2)],
                    ['Average', stats.average.toFixed(2)],
                    ['Minimum', stats.min],
                    ['Maximum', stats.max]];
                explanation = `Statistical analysis of ${targetColumn}`;
            } else {
                explanation = `No numeric data found in ${targetColumn} column`;
            }
        } else if (sanitizedPrompt.includes('pivot') || sanitizedPrompt.includes('group')) {
            operation = 'pivot';
            // Simple pivot: group by first text column, sum numeric columns
            const headers = fileData[0] || [];
            const rows = fileData.slice(1);
            const groupBy = headers[0]; // First column
            
            const grouped = {};
            rows.forEach(row => {
                const key = row[0];
                if (!grouped[key]) grouped[key] = [];
                grouped[key].push(row);
            });
            
            processedData = [['Group', 'Count', 'First Total']];
            Object.entries(grouped).forEach(([key, group]) => {
                const count = group.length;
                const firstTotal = group[0][3] || 0; // Assuming total is in 4th column
                processedData.push([key, count, firstTotal]);
            });
            
            explanation = `Pivot table grouped by ${groupBy}`;
        } else if (sanitizedPrompt.includes('lookup') || sanitizedPrompt.includes('vlookup') || sanitizedPrompt.includes('find')) {
            operation = 'lookup';
            const words = sanitizedPrompt.split(' ');
            const searchValue = words[words.length - 1];
            
            const results = fileData.filter((row, i) => 
                i === 0 || row.some(cell => 
                    String(cell).toLowerCase().includes(searchValue.toLowerCase())
                )
            );
            
            processedData = results;
            explanation = `Lookup results for '${searchValue}'`;
        } else if (sanitizedPrompt.includes('top') || sanitizedPrompt.includes('bottom') || sanitizedPrompt.includes('highest') || sanitizedPrompt.includes('lowest')) {
            operation = 'filter';
            const isTop = sanitizedPrompt.includes('top') || sanitizedPrompt.includes('highest');
            const num = parseInt(sanitizedPrompt.match(/\d+/)?.[0] || '10');
            
            // Sort by total column and take top/bottom N
            const sorted = sortData(fileData, 'total', isTop ? 'desc' : 'asc');
            processedData = [sorted[0], ...sorted.slice(1, num + 1)];
            explanation = `${isTop ? 'Top' : 'Bottom'} ${num} entries by total score`;
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