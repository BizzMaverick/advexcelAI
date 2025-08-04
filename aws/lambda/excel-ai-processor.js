const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");

// Utility functions for Excel operations
function sortData(data, column, order = 'asc') {
    if (!data || data.length < 2) return data;
    
    const headers = data[0];
    const rows = data.slice(1);
    const colIndex = headers.findIndex(h => h.toString().toLowerCase().includes(column.toLowerCase()));
    
    if (colIndex === -1) return data;
    
    // Check for ordinal suffixes in rank data and suggest cleanup
    if (column.toLowerCase().includes('rank')) {
        const hasOrdinals = rows.some(row => {
            const cellValue = String(row[colIndex]).toLowerCase();
            return /(\d+)(st|nd|rd|th)$/.test(cellValue);
        });
        
        if (hasOrdinals) {
            // Return original data with suggestion
            return {
                data: data,
                suggestion: `Your rank data contains ordinal suffixes (1st, 2nd, 3rd, etc.). For proper numerical sorting, please remove the suffixes (st, nd, rd, th) and keep only numbers (1, 2, 3, etc.), then try sorting again.`
            };
        }
    }
    
    const sortedRows = rows.sort((a, b) => {
        let aVal = a[colIndex];
        let bVal = b[colIndex];
        
        // Handle numeric sorting
        const aNum = Number(aVal);
        const bNum = Number(bVal);
        if (!isNaN(aNum) && !isNaN(bNum)) {
            return order === 'desc' ? bNum - aNum : aNum - bNum;
        }
        
        // Handle string sorting
        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();
        return order === 'desc' ? bStr.localeCompare(aStr) : aStr.localeCompare(bStr);
    });
    
    return [headers, ...sortedRows];
}

function filterData(data, column, value) {
    if (!data || data.length < 2) return data;
    
    const headers = data[0];
    const rows = data.slice(1);
    
    if (column === 'all') {
        const filteredRows = rows.filter(row => 
            row.some(cell => String(cell).toLowerCase().includes(value.toLowerCase()))
        );
        return [headers, ...filteredRows];
    }
    
    const colIndex = headers.findIndex(h => h.toString().toLowerCase().includes(column.toLowerCase()));
    if (colIndex === -1) return data;
    
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
    
    const sorted = [...values].sort((a, b) => a - b);
    
    return {
        count: values.length,
        sum: values.reduce((a, b) => a + b, 0),
        average: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        median: sorted[Math.floor(sorted.length / 2)]
    };
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
            grouped[key].push(1);
        }
    });
    
    const result = [['Group', operation.charAt(0).toUpperCase() + operation.slice(1)]];
    
    Object.entries(grouped).forEach(([key, values]) => {
        let aggregated;
        switch (operation) {
            case 'sum': aggregated = values.reduce((a, b) => a + b, 0); break;
            case 'average': aggregated = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2); break;
            case 'count': aggregated = values.length; break;
            case 'max': aggregated = Math.max(...values); break;
            case 'min': aggregated = Math.min(...values); break;
            default: aggregated = values.reduce((a, b) => a + b, 0);
        }
        result.push([key, aggregated]);
    });
    
    return result;
}

function highlightData(data, target, color) {
    let processedData = [...data];
    
    // Handle first row highlighting
    if (target.includes('first row') || target.includes('header')) {
        processedData = processedData.map((row, i) => {
            if (i === 0) {
                return row.map(cell => `<span style="background-color: ${color}; color: white; font-weight: bold; padding: 4px;">${cell}</span>`);
            }
            return row;
        });
    }
    
    // Handle first column highlighting
    if (target.includes('first column')) {
        processedData = processedData.map((row, i) => {
            return row.map((cell, j) => {
                if (j === 0 && i > 0) {
                    return `<span style="background-color: ${color}; color: white; font-weight: bold; padding: 4px;">${cell}</span>`;
                }
                return cell;
            });
        });
    }
    
    return processedData;
}

function conditionalFormat(data, condition, column, color) {
    if (!data || data.length < 2) return data;
    
    const headers = data[0];
    const colIndex = headers.findIndex(h => h.toLowerCase().includes(column.toLowerCase()));
    
    if (colIndex === -1) return data;
    
    return data.map((row, i) => {
        if (i === 0) return row;
        
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
        'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || 'https://www.advexcel.online',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'POST,OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        const { fileData, prompt, fileName } = JSON.parse(event.body);
        
        if (!fileData || !Array.isArray(fileData) || !prompt || !fileName) {
            throw new Error('Invalid request data');
        }
        
        let processedData = fileData;
        let explanation = 'Data processed';
        let operation = 'other';
        
        const sanitizedPrompt = prompt.trim().toLowerCase();
        console.log('Processing prompt:', sanitizedPrompt);
        
        // Handle empty prompts
        if (!sanitizedPrompt) {
            explanation = 'Please enter a command. Examples: "sort by country", "filter by Somalia", "calculate average total", "highlight first row in red"';
            operation = 'help';
        }
        
        // SORTING OPERATIONS
        else if (sanitizedPrompt.includes('sort')) {
            operation = 'sort';
            console.log('Sort operation detected');
            
            let sortColumn = null;
            const order = sanitizedPrompt.includes('desc') || sanitizedPrompt.includes('descending') ? 'desc' : 'asc';
            
            // Map common terms to actual columns
            if (sanitizedPrompt.includes('name') || sanitizedPrompt.includes('country')) {
                sortColumn = 'country';
            } else if (sanitizedPrompt.includes('rank')) {
                sortColumn = 'rank';
            } else if (sanitizedPrompt.includes('total') || sanitizedPrompt.includes('score')) {
                sortColumn = 'total';
            } else {
                // Try to find matching column from headers
                const words = sanitizedPrompt.split(' ');
                const dataHeaders = fileData[0] || [];
                for (const word of words) {
                    const matchingHeader = dataHeaders.find(h => h.toString().toLowerCase().includes(word.toLowerCase()));
                    if (matchingHeader) {
                        sortColumn = word;
                        break;
                    }
                }
            }
            
            if (sortColumn) {
                const sortResult = sortData(fileData, sortColumn, order);
                
                // Check if sortData returned a suggestion instead of sorted data
                if (sortResult && typeof sortResult === 'object' && sortResult.suggestion) {
                    processedData = sortResult.data;
                    explanation = `⚠️ **Sorting Issue Detected**\n\n${sortResult.suggestion}`;
                } else {
                    processedData = sortResult;
                    explanation = `Data sorted by ${sortColumn} (${order}ending)`;
                }
            } else {
                explanation = 'Could not identify column to sort by. Available columns: ' + (fileData[0] || []).join(', ');
            }
        }
        
        // FILTERING OPERATIONS
        else if (sanitizedPrompt.includes('filter') || sanitizedPrompt.includes('show only') || sanitizedPrompt.includes('where')) {
            operation = 'filter';
            console.log('Filter operation detected');
            
            const words = sanitizedPrompt.split(' ');
            let filterValue = words[words.length - 1];
            let filterColumn = 'all';
            
            // Try to identify column
            const dataHeaders = fileData[0] || [];
            for (let i = 0; i < words.length - 1; i++) {
                const matchingHeader = dataHeaders.find(h => h.toString().toLowerCase().includes(words[i].toLowerCase()));
                if (matchingHeader) {
                    filterColumn = words[i];
                    break;
                }
            }
            
            processedData = filterData(fileData, filterColumn, filterValue);
            explanation = `Data filtered for '${filterValue}' ${filterColumn !== 'all' ? 'in ' + filterColumn : 'across all columns'}`;
        }
        
        // STATISTICAL CALCULATIONS
        else if (sanitizedPrompt.includes('calculate') || sanitizedPrompt.includes('average') || sanitizedPrompt.includes('sum') || 
                 sanitizedPrompt.includes('count') || sanitizedPrompt.includes('min') || sanitizedPrompt.includes('max') || 
                 sanitizedPrompt.includes('median') || sanitizedPrompt.includes('statistics')) {
            operation = 'analytics';
            console.log('Analytics operation detected');
            
            let targetColumn = 'total';
            const words = sanitizedPrompt.split(' ');
            const dataHeaders = fileData[0] || [];
            
            for (const word of words) {
                const matchingHeader = dataHeaders.find(h => h.toString().toLowerCase().includes(word.toLowerCase()));
                if (matchingHeader) {
                    targetColumn = word;
                    break;
                }
            }
            
            const stats = calculateStats(fileData, targetColumn);
            if (stats) {
                processedData = [
                    ['Statistic', 'Value'],
                    ['Count', stats.count],
                    ['Sum', stats.sum.toFixed(2)],
                    ['Average', stats.average.toFixed(2)],
                    ['Median', stats.median.toFixed(2)],
                    ['Minimum', stats.min],
                    ['Maximum', stats.max]
                ];
                explanation = `Statistical analysis of ${targetColumn}`;
            } else {
                explanation = `No numeric data found in ${targetColumn} column`;
            }
        }
        
        // PIVOT TABLE OPERATIONS
        else if (sanitizedPrompt.includes('pivot') || sanitizedPrompt.includes('group by') || sanitizedPrompt.includes('summarize')) {
            operation = 'pivot';
            console.log('Pivot operation detected');
            
            let groupBy = 'country';
            let valueCol = 'total';
            let pivotOperation = 'sum';
            
            if (sanitizedPrompt.includes('count')) pivotOperation = 'count';
            else if (sanitizedPrompt.includes('average')) pivotOperation = 'average';
            else if (sanitizedPrompt.includes('max')) pivotOperation = 'max';
            else if (sanitizedPrompt.includes('min')) pivotOperation = 'min';
            
            processedData = createPivotTable(fileData, groupBy, valueCol, pivotOperation);
            explanation = `Pivot table: ${pivotOperation} of ${valueCol} grouped by ${groupBy}`;
        }
        
        // LOOKUP OPERATIONS
        else if (sanitizedPrompt.includes('lookup') || sanitizedPrompt.includes('vlookup') || sanitizedPrompt.includes('find') || sanitizedPrompt.includes('search')) {
            operation = 'lookup';
            console.log('Lookup operation detected');
            
            const words = sanitizedPrompt.split(' ');
            const searchValue = words[words.length - 1];
            
            const results = fileData.filter((row, i) => 
                i === 0 || row.some(cell => 
                    String(cell).toLowerCase().includes(searchValue.toLowerCase())
                )
            );
            
            processedData = results;
            explanation = `Lookup results for '${searchValue}' - Found ${results.length - 1} matches`;
        }
        
        // HIGHLIGHTING & FORMATTING
        else if (sanitizedPrompt.includes('highlight') || sanitizedPrompt.includes('color') || sanitizedPrompt.includes('format')) {
            operation = 'format';
            console.log('Formatting operation detected');
            
            // Extract color from prompt
            let color = 'red'; // default
            const colors = ['red', 'green', 'blue', 'yellow', 'orange', 'purple', 'pink', 'cyan', 'lime', 'brown', 'gray', 'black'];
            for (const c of colors) {
                if (sanitizedPrompt.includes(c)) {
                    color = c;
                    break;
                }
            }
            
            // Check for conditional formatting
            if (sanitizedPrompt.includes('>') || sanitizedPrompt.includes('<') || sanitizedPrompt.includes('=')) {
                const condition = sanitizedPrompt.match(/[><=]\s*\d+/)?.[0] || '>100';
                processedData = conditionalFormat(fileData, condition, 'total', color);
                explanation = `Conditional formatting applied: values ${condition} highlighted in ${color}`;
            } else {
                processedData = highlightData(fileData, sanitizedPrompt, color);
                let target = 'data';
                if (sanitizedPrompt.includes('first row')) target = 'first row';
                else if (sanitizedPrompt.includes('first column')) target = 'first column';
                explanation = `${target.charAt(0).toUpperCase() + target.slice(1)} highlighted in ${color}`;
            }
        }
        
        // TOP/BOTTOM ANALYSIS
        else if (sanitizedPrompt.includes('top') || sanitizedPrompt.includes('bottom') || sanitizedPrompt.includes('highest') || sanitizedPrompt.includes('lowest')) {
            operation = 'filter';
            console.log('Top/Bottom operation detected');
            
            const isTop = sanitizedPrompt.includes('top') || sanitizedPrompt.includes('highest');
            const num = parseInt(sanitizedPrompt.match(/\d+/)?.[0] || '10');
            
            const sorted = sortData(fileData, 'total', isTop ? 'desc' : 'asc');
            processedData = [sorted[0], ...sorted.slice(1, num + 1)];
            explanation = `${isTop ? 'Top' : 'Bottom'} ${num} entries by total score`;
        }
        
        // PERCENTAGE CALCULATIONS
        else if (sanitizedPrompt.includes('percentage') || sanitizedPrompt.includes('percent')) {
            operation = 'calculate';
            console.log('Percentage operation detected');
            
            const dataHeaders = fileData[0] || [];
            const totalColIndex = dataHeaders.findIndex(h => h.toLowerCase().includes('total'));
            
            if (totalColIndex !== -1) {
                const total = fileData.slice(1).reduce((sum, row) => sum + (Number(row[totalColIndex]) || 0), 0);
                
                processedData = [['Country', 'Total', 'Percentage']];
                fileData.slice(1).forEach(row => {
                    const value = Number(row[totalColIndex]) || 0;
                    const percentage = ((value / total) * 100).toFixed(2);
                    processedData.push([row[0], value, `${percentage}%`]);
                });
                
                explanation = 'Percentage distribution calculated';
            } else {
                explanation = 'No total column found for percentage calculation';
            }
        }
        
        // CHART DATA PREPARATION
        else if (sanitizedPrompt.includes('chart') || sanitizedPrompt.includes('graph') || sanitizedPrompt.includes('plot')) {
            operation = 'chart';
            console.log('Chart operation detected');
            
            if (sanitizedPrompt.includes('bar') || sanitizedPrompt.includes('column')) {
                processedData = [['Category', 'Value']];
                fileData.slice(1, 11).forEach(row => {
                    processedData.push([row[0], Number(row[3]) || 0]);
                });
                explanation = 'Bar chart data prepared (top 10 entries)';
            } else if (sanitizedPrompt.includes('pie')) {
                const total = fileData.slice(1).reduce((sum, row) => sum + (Number(row[3]) || 0), 0);
                processedData = [['Category', 'Percentage']];
                fileData.slice(1, 6).forEach(row => {
                    const value = Number(row[3]) || 0;
                    const percentage = ((value / total) * 100).toFixed(1);
                    processedData.push([row[0], `${percentage}%`]);
                });
                explanation = 'Pie chart data prepared (top 5 entries)';
            } else {
                processedData = [['Category', 'Value']];
                fileData.slice(1, 11).forEach(row => {
                    processedData.push([row[0], Number(row[3]) || 0]);
                });
                explanation = 'Chart data prepared';
            }
        }
        
        // AI FALLBACK FOR COMPLEX REQUESTS
        else {
            console.log('Using AI fallback for complex request');
            const bedrockClient = new BedrockRuntimeClient({ region: process.env.AWS_REGION || 'us-east-1' });
            
            const command = new InvokeModelCommand({
                modelId: "anthropic.claude-3-sonnet-20240229-v1:0",
                contentType: "application/json",
                accept: "application/json",
                body: JSON.stringify({
                    anthropic_version: "bedrock-2023-05-31",
                    max_tokens: 1000,
                    messages: [{
                        role: "user",
                        content: `Analyze this Excel data and provide insights for: "${prompt}"\n\nData sample: ${JSON.stringify(fileData.slice(0, 5))}\n\nTotal rows: ${fileData.length}\n\nProvide a brief analysis or answer.`
                    }]
                })
            });

            try {
                const response = await bedrockClient.send(command);
                const responseBody = JSON.parse(new TextDecoder().decode(response.body));
                explanation = responseBody.content[0].text.substring(0, 800);
            } catch (error) {
                console.error('Bedrock error:', error);
                explanation = 'AI analysis temporarily unavailable. Please try a specific command like "sort by country" or "calculate average total".';
            }
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
                fileName: fileName.replace(/[<>:"/\\|?*]/g, '').substring(0, 100)
            })
        };

    } catch (error) {
        console.error('Lambda error:', error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: 'Processing error occurred. Please check your data and try again.'
            })
        };
    }
};