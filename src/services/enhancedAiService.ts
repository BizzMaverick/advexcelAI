import { DataStructure } from './dataDetectionService';

export class EnhancedAiService {
  /**
   * Generate context-aware prompt based on data structure
   */
  static enhancePrompt(userPrompt: string, dataStructure: DataStructure): string {
    const { detectedFormat, columns } = dataStructure;
    
    let enhancedPrompt = userPrompt;
    
    // Add context about data structure
    const numberColumns = columns.filter(c => c.type === 'number');
    const textColumns = columns.filter(c => c.type === 'text');
    const dateColumns = columns.filter(c => c.type === 'date');
    
    const contextInfo = [
      `Data format: ${detectedFormat}`,
      `Columns: ${numberColumns.length} numeric, ${textColumns.length} text, ${dateColumns.length} date`,
      `Key columns: ${columns.slice(0, 3).map(c => `${c.name} (${c.type})`).join(', ')}`
    ].join('. ');
    
    // Add format-specific context
    let formatContext = '';
    switch (detectedFormat) {
      case 'financial':
        formatContext = 'This is financial data. Focus on monetary analysis, trends, and calculations.';
        break;
      case 'survey':
        formatContext = 'This is survey data. Focus on response analysis, ratings, and statistical summaries.';
        break;
      case 'inventory':
        formatContext = 'This is inventory data. Focus on stock levels, quantities, and supply chain metrics.';
        break;
      case 'analytics':
        formatContext = 'This is analytics data. Focus on performance metrics, trends, and KPI analysis.';
        break;
      default:
        formatContext = 'Analyze this general dataset appropriately.';
    }
    
    enhancedPrompt = `${formatContext} ${contextInfo} User request: ${userPrompt}. Provide focused analysis without raw data dumps.`;
    
    return enhancedPrompt;
  }

  /**
   * Generate smart follow-up questions based on data structure
   */
  static generateFollowUpQuestions(dataStructure: DataStructure): string[] {
    const { detectedFormat, columns } = dataStructure;
    const questions: string[] = [];
    
    const numberColumns = columns.filter(c => c.type === 'number');
    const textColumns = columns.filter(c => c.type === 'text');
    
    // Format-specific questions
    switch (detectedFormat) {
      case 'financial':
        questions.push('What are the top revenue generators?');
        questions.push('How do costs compare across categories?');
        questions.push('What are the profit margin trends?');
        break;
        
      case 'survey':
        questions.push('What is the overall satisfaction score?');
        questions.push('Which responses show the highest ratings?');
        questions.push('Are there any concerning feedback patterns?');
        break;
        
      case 'inventory':
        questions.push('Which items are running low on stock?');
        questions.push('What is the inventory turnover rate?');
        questions.push('Which products need reordering?');
        break;
        
      case 'analytics':
        questions.push('What are the key performance trends?');
        questions.push('Which metrics show the best growth?');
        questions.push('Are there any performance bottlenecks?');
        break;
    }
    
    // Column-specific questions
    if (numberColumns.length > 1) {
      const col1 = numberColumns[0].name;
      const col2 = numberColumns[1].name;
      questions.push(`How does ${col1} correlate with ${col2}?`);
    }
    
    if (textColumns.length > 0 && numberColumns.length > 0) {
      const textCol = textColumns[0].name;
      const numCol = numberColumns[0].name;
      questions.push(`Which ${textCol} has the highest ${numCol}?`);
    }
    
    return questions.slice(0, 5);
  }

  /**
   * Suggest optimal chart types based on data structure
   */
  static suggestChartTypes(dataStructure: DataStructure): Array<{type: string, reason: string}> {
    const { columns, detectedFormat } = dataStructure;
    const suggestions: Array<{type: string, reason: string}> = [];
    
    const numberColumns = columns.filter(c => c.type === 'number');
    const textColumns = columns.filter(c => c.type === 'text');
    const dateColumns = columns.filter(c => c.type === 'date');
    
    // Time series data
    if (dateColumns.length > 0 && numberColumns.length > 0) {
      suggestions.push({
        type: 'line',
        reason: 'Perfect for showing trends over time'
      });
    }
    
    // Categorical comparisons
    if (textColumns.length > 0 && numberColumns.length > 0) {
      suggestions.push({
        type: 'bar',
        reason: 'Great for comparing values across categories'
      });
    }
    
    // Part-to-whole relationships
    if (numberColumns.length > 0 && textColumns.length > 0) {
      suggestions.push({
        type: 'pie',
        reason: 'Shows proportional breakdown of categories'
      });
    }
    
    // Format-specific suggestions
    switch (detectedFormat) {
      case 'financial':
        suggestions.push({
          type: 'bar',
          reason: 'Ideal for financial comparisons and budgets'
        });
        break;
        
      case 'survey':
        suggestions.push({
          type: 'bar',
          reason: 'Perfect for rating distributions and responses'
        });
        break;
        
      case 'analytics':
        suggestions.push({
          type: 'line',
          reason: 'Best for tracking performance metrics over time'
        });
        break;
    }
    
    return suggestions.slice(0, 3);
  }

  /**
   * Generate data quality insights
   */
  static generateQualityInsights(dataStructure: DataStructure): string[] {
    const { dataQuality, columns } = dataStructure;
    const insights: string[] = [];
    
    // Completeness insights
    if (dataQuality.completeness < 0.7) {
      insights.push(`⚠️ Data is only ${Math.round(dataQuality.completeness * 100)}% complete - consider cleaning missing values`);
    } else if (dataQuality.completeness > 0.95) {
      insights.push(`✅ Excellent data completeness (${Math.round(dataQuality.completeness * 100)}%)`);
    }
    
    // Duplicate insights
    if (dataQuality.duplicateRows > 0) {
      insights.push(`🔄 Found ${dataQuality.duplicateRows} duplicate rows - consider removing for cleaner analysis`);
    }
    
    // Column-specific insights
    const emptyColumns = columns.filter(c => c.nullCount > dataStructure.rowCount * 0.5);
    if (emptyColumns.length > 0) {
      insights.push(`📊 ${emptyColumns.length} columns are mostly empty - consider removing or investigating`);
    }
    
    const uniqueColumns = columns.filter(c => c.uniqueCount === dataStructure.rowCount);
    if (uniqueColumns.length > 0) {
      insights.push(`🔑 ${uniqueColumns.length} columns contain unique identifiers`);
    }
    
    return insights;
  }

  /**
   * Generate smart data transformation suggestions
   */
  static generateTransformationSuggestions(dataStructure: DataStructure): string[] {
    const { columns, detectedFormat } = dataStructure;
    const suggestions: string[] = [];
    
    // Text cleaning suggestions
    const textColumns = columns.filter(c => c.type === 'text');
    if (textColumns.some(c => c.pattern === 'email')) {
      suggestions.push('Extract domain names from email addresses');
    }
    
    // Numeric transformations
    const numberColumns = columns.filter(c => c.type === 'number');
    if (numberColumns.length > 1) {
      suggestions.push('Calculate ratios and percentages between numeric columns');
      suggestions.push('Create summary statistics (min, max, average, median)');
    }
    
    // Date transformations
    const dateColumns = columns.filter(c => c.type === 'date');
    if (dateColumns.length > 0) {
      suggestions.push('Extract year, month, quarter from dates');
      suggestions.push('Calculate time differences and durations');
    }
    
    // Format-specific transformations
    switch (detectedFormat) {
      case 'financial':
        suggestions.push('Calculate profit margins and growth rates');
        suggestions.push('Create budget variance analysis');
        break;
        
      case 'survey':
        suggestions.push('Calculate satisfaction scores and Net Promoter Score');
        suggestions.push('Group responses into satisfaction categories');
        break;
        
      case 'inventory':
        suggestions.push('Calculate inventory turnover and reorder points');
        suggestions.push('Identify fast and slow-moving items');
        break;
        
      case 'analytics':
        suggestions.push('Calculate conversion rates and performance ratios');
        suggestions.push('Create performance benchmarks and targets');
        break;
    }
    
    return suggestions.slice(0, 6);
  }
}