const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");

function sortData(data, column, order = 'asc') {
    if (!data || data.length < 2) return data;
    
    const headers = data[0];
    const rows = data.slice(1);
    const colIndex = headers.findIndex(h => h.toString().toLowerCase().includes(column.toLowerCase()));
    
    if (colIndex === -1) return data;
    
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
    
    if (colIndex === -1) {
        // Filter across all columns if specific column not found
        const filteredRows = rows.filter(row => 
            row.some(cell => String(cell).toLowerCase().includes(value.toLowerCase()))
        );
        return [headers, ...filteredRows];
    }
    
    const filteredRows = rows.filter(row => 
        String(row[colIndex]).toLowerCase().includes(value.toLowerCase())
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
        max: Math.max(...values),
        median: values.sort((a, b) => a - b)[Math.floor(values.length / 2)]
    };
}

function vlookup(data, searchValue, returnColumn) {
    const rows = data.slice(1);
    const found = rows.find(row => 
        String(row[0]).toLowerCase() === searchValue.toLowerCase()
    );
    return found ? found[returnColumn] || 'Not found' : 'Not found';
}

function createPivotTable(data, groupByCol, valueCol, operation = 'sum') {
    if (!data || data.length < 2) return data;
    
    const headers = data[0];
    const rows = data.slice(1);
    const groupIndex = headers.findIndex(h => h.toLowerCase().includes(groupByCol.toLowerCase()));
    const valueIndex = headers.findIndex(h => h.toLowerCase().includes(valueCol.toLowerCase()));
    
    if (groupIndex === -1) return data;
    
    const grouped = {};
    rows.forEach(row => {
        const key = row[groupIndex];
        if (!grouped[key]) grouped[key] = [];
        if (valueIndex !== -1) {
            const value = Number(row[valueIndex]);
            if (!isNaN(value)) grouped[key].push(value);
        } else {
            grouped[key].push(1); // Count
        }
    });
    
    const result = [['Group', operation === 'count' ? 'Count' : headers[valueIndex] || 'Value']];
    
    Object.entries(grouped).forEach(([key, values]) => {
        let aggregated;
        switch (operation) {
            case 'sum': aggregated = values.reduce((a, b) => a + b, 0); break;
            case 'average': aggregated = values.reduce((a, b) => a + b, 0) / values.length; break;
            case 'count': aggregated = values.length; break;
            case 'max': aggregated = Math.max(...values); break;
            case 'min': aggregated = Math.min(...values); break;
            default: aggregated = values.reduce((a, b) => a + b, 0);
        }
        result.push([key, aggregated]);
    });
    
    return result;
}

function conditionalFormat(data, condition, column, color = 'red') {
    if (!data || data.length < 2) return data;
    
    const headers = data[0];
    const colIndex = headers.findIndex(h => h.toLowerCase().includes(column.toLowerCase()));
    
    if (colIndex === -1) return data;
    
    return data.map((row, i) => {
        if (i === 0) return row; // Skip header
        
        return row.map((cell, j) => {
            if (j === colIndex) {
                const value = Number(cell);
                let shouldHighlight = false;
                
                if (condition.includes('>')) {
                    const threshold = Number(condition.split('>')[1]);
                    shouldHighlight = value > threshold;
                } else if (condition.includes('<')) {
                    const threshold = Number(condition.split('<')[1]);
                    shouldHighlight = value < threshold;
                } else if (condition.includes('=')) {
                    const threshold = Number(condition.split('=')[1]);
                    shouldHighlight = value === threshold;
                }
                
                if (shouldHighlight) {
                    return `<span style="background-color: ${color}; color: white; padding: 2px 4px; border-radius: 2px;">${cell}</span>`;
                }
            }
            return cell;
        });
    });
}

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': 'https://www.advexcel.online',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'POST,OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        const { fileData, prompt, fileName } = JSON.parse(event.body);
        
        let processedData = fileData;
        let explanation = 'Data processed';
        let operation = 'other';
        
        const sanitizedPrompt = prompt.trim().toLowerCase();
        console.log('Processing prompt:', sanitizedPrompt);
        
        // SORTING
        if (sanitizedPrompt.includes('sort')) {
            operation = 'sort';
            const words = sanitizedPrompt.split(' ');
            const headers = fileData[0] || [];
            
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
            }
        }
        
        // FILTERING
        else if (sanitizedPrompt.includes('filter') || sanitizedPrompt.includes('show only') || sanitizedPrompt.includes('where')) {
            operation = 'filter';
            const words = sanitizedPrompt.split(' ');
            let filterValue = words[words.length - 1];
            let filterColumn = 'country';
            
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
        }
        
        // CALCULATIONS & STATISTICS
        else if (sanitizedPrompt.includes('calculate') || sanitizedPrompt.includes('average') || sanitizedPrompt.includes('sum') || sanitizedPrompt.includes('count') || sanitizedPrompt.includes('min') || sanitizedPrompt.includes('max') || sanitizedPrompt.includes('median')) {
            operation = 'analytics';
            const headers = fileData[0] || [];
            let targetColumn = 'total';
            
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
                    ['Median', stats.median.toFixed(2)],
                    ['Minimum', stats.min],
                    ['Maximum', stats.max]];
                explanation = `Statistical analysis of ${targetColumn}`;
            }
        }
        
        // PIVOT TABLES
        else if (sanitizedPrompt.includes('pivot') || sanitizedPrompt.includes('group by') || sanitizedPrompt.includes('summarize')) {
            operation = 'pivot';
            const words = sanitizedPrompt.split(' ');
            let groupBy = 'country';
            let valueCol = 'total';
            let pivotOperation = 'sum';
            
            if (sanitizedPrompt.includes('count')) pivotOperation = 'count';
            else if (sanitizedPrompt.includes('average')) pivotOperation = 'average';
            else if (sanitizedPrompt.includes('max')) pivotOperation = 'max';
            else if (sanitizedPrompt.includes('min')) pivotOperation = 'min';
            
            const headers = fileData[0] || [];
            for (const word of words) {
                const matchingHeader = headers.find(h => h.toString().toLowerCase().includes(word.toLowerCase()));
                if (matchingHeader && word !== 'by') {
                    if (headers.indexOf(matchingHeader) === 0) groupBy = word;
                    else valueCol = word;
                }
            }
            
            processedData = createPivotTable(fileData, groupBy, valueCol, pivotOperation);
            explanation = `Pivot table: ${pivotOperation} of ${valueCol} grouped by ${groupBy}`;
        }
        
        // VLOOKUP
        else if (sanitizedPrompt.includes('lookup') || sanitizedPrompt.includes('vlookup') || sanitizedPrompt.includes('find')) {
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
        }
        
        // HIGHLIGHTING & FORMATTING
        else if (sanitizedPrompt.includes('highlight') || sanitizedPrompt.includes('color') || sanitizedPrompt.includes('format')) {
            operation = 'format';
            console.log('Highlighting detected');
            processedData = [...fileData];
            
            if (sanitizedPrompt.includes('first row') || sanitizedPrompt.includes('header')) {
                console.log('Highlighting first row');
                processedData = fileData.map((row, i) => {
                    if (i === 0) {
                        return row.map(cell => `<span style="background-color: red; color: white; font-weight: bold; padding: 4px;">${cell}</span>`);
                    }
                    return row;
                });
            }
            
            if (sanitizedPrompt.includes('first column')) {
                console.log('Highlighting first column');
                processedData = processedData.map((row, i) => {
                    return row.map((cell, j) => {
                        if (j === 0 && i > 0) {
                            return `<span style="background-color: red; color: white; font-weight: bold; padding: 4px;">${cell}</span>`;
                        }
                        return cell;
                    });
                });
            }
            
            explanation = 'Data formatted with highlighting';
        }
        
        // CONDITIONAL FORMATTING
        else if (sanitizedPrompt.includes('conditional') || (sanitizedPrompt.includes('highlight') && (sanitizedPrompt.includes('>') || sanitizedPrompt.includes('<') || sanitizedPrompt.includes('=')))) {
            operation = 'format';
            const condition = sanitizedPrompt.match(/[><=]\s*\d+/)?.[0] || '>100';
            const column = 'total';
            const color = sanitizedPrompt.includes('red') ? 'red' : sanitizedPrompt.includes('green') ? 'green' : sanitizedPrompt.includes('blue') ? 'blue' : 'yellow';
            
            processedData = conditionalFormat(fileData, condition, column, color);
            explanation = `Conditional formatting applied: ${column} ${condition}`;
        }
        
        // CORRELATION ANALYSIS
        else if (sanitizedPrompt.includes('correlation') || sanitizedPrompt.includes('relationship')) {
            operation = 'analytics';
            const headers = fileData[0] || [];
            const numericCols = [];
            
            for (let i = 0; i < headers.length; i++) {
                const values = fileData.slice(1).map(row => Number(row[i])).filter(v => !isNaN(v));
                if (values.length > 0) numericCols.push({index: i, name: headers[i], values});
            }
            
            if (numericCols.length >= 2) {
                const col1 = numericCols[0];
                const col2 = numericCols[1];
                
                const n = Math.min(col1.values.length, col2.values.length);
                const mean1 = col1.values.reduce((a, b) => a + b, 0) / n;
                const mean2 = col2.values.reduce((a, b) => a + b, 0) / n;
                
                let numerator = 0, denom1 = 0, denom2 = 0;
                for (let i = 0; i < n; i++) {
                    const diff1 = col1.values[i] - mean1;
                    const diff2 = col2.values[i] - mean2;
                    numerator += diff1 * diff2;
                    denom1 += diff1 * diff1;
                    denom2 += diff2 * diff2;
                }
                
                const correlation = numerator / Math.sqrt(denom1 * denom2);
                
                processedData = [['Analysis', 'Value'],
                    ['Correlation Coefficient', correlation.toFixed(4)],
                    ['Relationship Strength', Math.abs(correlation) > 0.7 ? 'Strong' : Math.abs(correlation) > 0.3 ? 'Moderate' : 'Weak'],
                    ['Direction', correlation > 0 ? 'Positive' : 'Negative']];
                
                explanation = `Correlation analysis between ${col1.name} and ${col2.name}`;
            }
        }
        
        // PERCENTAGE CALCULATIONS
        else if (sanitizedPrompt.includes('percentage') || sanitizedPrompt.includes('percent')) {
            operation = 'calculate';
            const headers = fileData[0] || [];
            const totalColIndex = headers.findIndex(h => h.toLowerCase().includes('total'));
            
            if (totalColIndex !== -1) {
                const total = fileData.slice(1).reduce((sum, row) => sum + (Number(row[totalColIndex]) || 0), 0);
                
                processedData = [['Country', 'Total', 'Percentage']];
                fileData.slice(1).forEach(row => {
                    const value = Number(row[totalColIndex]) || 0;
                    const percentage = ((value / total) * 100).toFixed(2);
                    processedData.push([row[0], value, `${percentage}%`]);
                });
                
                explanation = 'Percentage distribution calculated';
            }
        }
        
        // TOP/BOTTOM ANALYSIS
        else if (sanitizedPrompt.includes('top') || sanitizedPrompt.includes('bottom') || sanitizedPrompt.includes('highest') || sanitizedPrompt.includes('lowest')) {
            operation = 'filter';
            const isTop = sanitizedPrompt.includes('top') || sanitizedPrompt.includes('highest');
            const num = parseInt(sanitizedPrompt.match(/\d+/)?.[0] || '10');
            
            const sorted = sortData(fileData, 'total', isTop ? 'desc' : 'asc');
            processedData = [sorted[0], ...sorted.slice(1, num + 1)];
            explanation = `${isTop ? 'Top' : 'Bottom'} ${num} entries by total score`;
        }
        
        // CHART DATA PREPARATION
        else if (sanitizedPrompt.includes('chart') || sanitizedPrompt.includes('graph') || sanitizedPrompt.includes('plot')) {
            operation = 'chart';
            const headers = fileData[0] || [];
            
            if (sanitizedPrompt.includes('bar') || sanitizedPrompt.includes('column')) {
                processedData = [['Category', 'Value']];
                fileData.slice(1, 11).forEach(row => { // Top 10 for chart
                    processedData.push([row[0], Number(row[3]) || 0]);
                });
                explanation = 'Bar chart data prepared (top 10 entries)';
            } else if (sanitizedPrompt.includes('pie')) {
                const total = fileData.slice(1).reduce((sum, row) => sum + (Number(row[3]) || 0), 0);
                processedData = [['Category', 'Percentage']];
                fileData.slice(1, 6).forEach(row => { // Top 5 for pie
                    const value = Number(row[3]) || 0;
                    const percentage = ((value / total) * 100).toFixed(1);
                    processedData.push([row[0], `${percentage}%`]);
                });
                explanation = 'Pie chart data prepared (top 5 entries)';
            }
        }
        
        // AI FALLBACK FOR COMPLEX REQUESTS
        else {
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
                fileName
            })
        };

    } catch (error) {
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