import { DataStructure } from './dataDetectionService';

export class EnhancedAiService {
  /**
   * Generate industry-specific KPIs based on detected format
   */
  static generateIndustryKPIs(dataStructure: DataStructure): Array<{name: string, description: string, calculation: string}> {
    const { detectedFormat } = dataStructure;
    const kpis: Array<{name: string, description: string, calculation: string}> = [];
    
    switch (detectedFormat) {
      case 'restaurant':
        kpis.push(
          { name: 'Average Order Value', description: 'Average revenue per transaction', calculation: 'Total Revenue / Number of Orders' },
          { name: 'Table Turnover Rate', description: 'How quickly tables are turned over', calculation: 'Total Covers / Available Tables / Hours' },
          { name: 'Food Cost Percentage', description: 'Cost of ingredients as % of revenue', calculation: 'Food Costs / Total Revenue * 100' },
          { name: 'Server Efficiency', description: 'Average orders handled per server', calculation: 'Total Orders / Number of Servers' }
        );
        break;
        
      case 'healthcare':
        kpis.push(
          { name: 'Patient Satisfaction Score', description: 'Average patient satisfaction rating', calculation: 'Sum of Ratings / Number of Patients' },
          { name: 'Treatment Success Rate', description: 'Percentage of successful treatments', calculation: 'Successful Treatments / Total Treatments * 100' },
          { name: 'Appointment Utilization', description: 'Percentage of scheduled appointments kept', calculation: 'Kept Appointments / Scheduled Appointments * 100' },
          { name: 'Average Treatment Duration', description: 'Average time per treatment', calculation: 'Total Treatment Time / Number of Treatments' }
        );
        break;
        
      case 'financial':
        kpis.push(
          { name: 'Cash Flow Ratio', description: 'Ratio of cash inflows to outflows', calculation: 'Cash Inflows / Cash Outflows' },
          { name: 'Accounts Receivable Turnover', description: 'How quickly receivables are collected', calculation: 'Total Revenue / Average Receivables' },
          { name: 'Payment Method Distribution', description: 'Breakdown of payment methods used', calculation: 'Each Method Count / Total Transactions * 100' },
          { name: 'Average Transaction Value', description: 'Average value per transaction', calculation: 'Total Transaction Value / Number of Transactions' }
        );
        break;
        
      case 'sports':
        kpis.push(
          { name: 'Win Rate', description: 'Percentage of games won', calculation: 'Games Won / Total Games * 100' },
          { name: 'Player Efficiency Rating', description: 'Overall player performance score', calculation: '(Points + Assists + Rebounds) / Minutes Played' },
          { name: 'Team Average Score', description: 'Average points scored per game', calculation: 'Total Points / Number of Games' },
          { name: 'Goal Conversion Rate', description: 'Percentage of attempts that result in goals', calculation: 'Goals Scored / Total Attempts * 100' }
        );
        break;
        
      case 'education':
        kpis.push(
          { name: 'Class Average GPA', description: 'Average grade point average', calculation: 'Sum of All GPAs / Number of Students' },
          { name: 'Subject Pass Rate', description: 'Percentage of students passing each subject', calculation: 'Students Passed / Total Students * 100' },
          { name: 'Attendance Rate', description: 'Percentage of classes attended', calculation: 'Classes Attended / Total Classes * 100' },
          { name: 'Improvement Rate', description: 'Percentage of students showing improvement', calculation: 'Students Improved / Total Students * 100' }
        );
        break;
        
      default:
        kpis.push(
          { name: 'Data Completeness', description: 'Percentage of complete records', calculation: 'Complete Records / Total Records * 100' },
          { name: 'Average Value', description: 'Average of numeric columns', calculation: 'Sum of Values / Count of Values' },
          { name: 'Unique Records', description: 'Number of unique entries', calculation: 'Count of Distinct Values' }
        );
    }
    
    return kpis;
  }
  /**
   * Generate industry benchmarks for comparison
   */
  static generateIndustryBenchmarks(dataStructure: DataStructure): Array<{metric: string, benchmark: string, status: 'good' | 'average' | 'needs_improvement'}> {
    const { detectedFormat } = dataStructure;
    const benchmarks: Array<{metric: string, benchmark: string, status: 'good' | 'average' | 'needs_improvement'}> = [];
    
    switch (detectedFormat) {
      case 'restaurant':
        benchmarks.push(
          { metric: 'Food Cost %', benchmark: '28-35% of revenue', status: 'good' },
          { metric: 'Labor Cost %', benchmark: '25-35% of revenue', status: 'average' },
          { metric: 'Table Turnover', benchmark: '1.5-3 times per meal period', status: 'good' },
          { metric: 'Average Order Value', benchmark: 'Varies by restaurant type', status: 'average' }
        );
        break;
        
      case 'healthcare':
        benchmarks.push(
          { metric: 'Patient Satisfaction', benchmark: '85%+ satisfaction rate', status: 'good' },
          { metric: 'Appointment Show Rate', benchmark: '85-90% show rate', status: 'average' },
          { metric: 'Treatment Success', benchmark: '90%+ success rate', status: 'good' },
          { metric: 'Wait Time', benchmark: '<15 minutes average', status: 'needs_improvement' }
        );
        break;
        
      case 'financial':
        benchmarks.push(
          { metric: 'Current Ratio', benchmark: '1.5-3.0 is healthy', status: 'good' },
          { metric: 'Debt-to-Equity', benchmark: '<0.5 is conservative', status: 'average' },
          { metric: 'Cash Flow', benchmark: 'Positive monthly trend', status: 'good' },
          { metric: 'Collection Period', benchmark: '<30 days average', status: 'needs_improvement' }
        );
        break;
        
      default:
        benchmarks.push(
          { metric: 'Data Quality', benchmark: '95%+ completeness', status: 'good' },
          { metric: 'Processing Time', benchmark: '<5 seconds response', status: 'average' }
        );
    }
    
    return benchmarks;
  }
  
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
      `Industry: ${detectedFormat}`,
      `Data structure: ${numberColumns.length} numeric, ${textColumns.length} text, ${dateColumns.length} date columns`,
      `Key fields: ${columns.slice(0, 3).map(c => `${c.name} (${c.type})`).join(', ')}`,
      `Records: ${dataStructure.rowCount} entries`
    ].join('. ');
    
    // Add industry-specific context
    let formatContext = '';
    switch (detectedFormat) {
      case 'restaurant':
        formatContext = 'This is restaurant/hospitality data. Focus on sales analysis, menu performance, server efficiency, and customer satisfaction metrics.';
        break;
      case 'healthcare':
        formatContext = 'This is healthcare/medical data. Focus on patient outcomes, treatment effectiveness, resource utilization, and medical compliance.';
        break;
      case 'financial':
        formatContext = 'This is financial/accounting data. Focus on cash flow, balance analysis, payment patterns, and financial health metrics.';
        break;
      case 'sports':
        formatContext = 'This is sports/athletics data. Focus on player performance, team statistics, game analysis, and competitive metrics.';
        break;
      case 'education':
        formatContext = 'This is educational/academic data. Focus on student performance, grade analysis, subject trends, and academic progress.';
        break;
      case 'hr':
        formatContext = 'This is HR/employee data. Focus on workforce analytics, performance management, attendance patterns, and employee satisfaction.';
        break;
      case 'ecommerce':
        formatContext = 'This is e-commerce/retail data. Focus on product performance, customer behavior, inventory management, and sales optimization.';
        break;
      case 'survey':
        formatContext = 'This is survey/research data. Focus on response analysis, satisfaction scores, feedback patterns, and statistical summaries.';
        break;
      case 'analytics':
        formatContext = 'This is digital analytics data. Focus on performance metrics, conversion rates, user behavior, and ROI analysis.';
        break;
      case 'banking':
        formatContext = 'This is banking/financial services data. Focus on loan performance, customer analytics, risk assessment, and portfolio management.';
        break;
      default:
        formatContext = 'Analyze this dataset with appropriate business context and industry best practices.';
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
    
    // Industry-specific questions
    switch (detectedFormat) {
      case 'restaurant':
        questions.push('Which menu items are most profitable?');
        questions.push('What are the peak dining hours?');
        questions.push('How is server performance trending?');
        questions.push('Which tables have the highest turnover?');
        break;
        
      case 'healthcare':
        questions.push('What are the patient outcome trends?');
        questions.push('Which treatments show best results?');
        questions.push('How efficient is appointment scheduling?');
        questions.push('What are the common diagnosis patterns?');
        break;
        
      case 'financial':
        questions.push('What is the cash flow pattern?');
        questions.push('Which accounts have pending receivables?');
        questions.push('How are payment methods distributed?');
        questions.push('What are the major expense categories?');
        break;
        
      case 'sports':
        questions.push('Who are the top performing players?');
        questions.push('What are the winning game strategies?');
        questions.push('How do teams compare this season?');
        questions.push('Which statistics correlate with wins?');
        break;
        
      case 'education':
        questions.push('Which students need academic support?');
        questions.push('What are the subject-wise performance trends?');
        questions.push('How do class averages compare?');
        questions.push('Which teaching methods show best results?');
        break;
        
      case 'hr':
        questions.push('What are the employee satisfaction levels?');
        questions.push('Which departments have highest turnover?');
        questions.push('How do performance ratings distribute?');
        questions.push('What are the attendance patterns?');
        break;
        
      case 'ecommerce':
        questions.push('Which products drive most revenue?');
        questions.push('What are the customer buying patterns?');
        questions.push('How is inventory turnover performing?');
        questions.push('Which categories need restocking?');
        break;
        
      case 'survey':
        questions.push('What is the overall satisfaction score?');
        questions.push('Which responses show the highest ratings?');
        questions.push('Are there any concerning feedback patterns?');
        questions.push('How do demographics affect responses?');
        break;
        
      case 'analytics':
        questions.push('What are the key performance trends?');
        questions.push('Which metrics show the best growth?');
        questions.push('Are there any performance bottlenecks?');
        questions.push('How do conversion rates compare?');
        break;
        
      case 'banking':
        questions.push('What is the loan portfolio health?');
        questions.push('Which branches perform best?');
        questions.push('How are customer deposits trending?');
        questions.push('What are the risk indicators?');
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