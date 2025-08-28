import { useState } from 'react';
import { DataStructure, DataDetectionService } from '../services/dataDetectionService';
import { EnhancedAiService } from '../services/enhancedAiService';

interface DataInsightsProps {
  data: (string | number | boolean | null | undefined)[][];
  onPromptSelect: (prompt: string) => void;
}

export default function DataInsights({ data, onPromptSelect }: DataInsightsProps) {
  const [structure, setStructure] = useState<DataStructure | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const analyzeData = async () => {
    if (!data || data.length === 0) return;
    
    setIsAnalyzing(true);
    try {
      const analysis = DataDetectionService.analyzeData(data);
      setStructure(analysis);
    } catch (error) {
      console.error('Data analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'number': return '🔢';
      case 'text': return '📝';
      case 'date': return '📅';
      case 'boolean': return '✅';
      case 'mixed': return '🔀';
      default: return '❓';
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'financial': return '💰';
      case 'survey': return '📊';
      case 'inventory': return '📦';
      case 'analytics': return '📈';
      default: return '📋';
    }
  };

  const getQualityColor = (score: number) => {
    if (score >= 0.8) return '#107c10';
    if (score >= 0.6) return '#ff8c00';
    return '#d83b01';
  };

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div style={{
      background: '#f9f9f9',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '20px',
      fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px'
      }}>
        <h3 style={{
          margin: 0,
          fontSize: '16px',
          fontWeight: '500',
          color: '#252525',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          🧠 Smart Data Insights
        </h3>
        
        {!structure && (
          <button
            onClick={analyzeData}
            disabled={isAnalyzing}
            style={{
              padding: '8px 16px',
              background: '#0078d4',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isAnalyzing ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {isAnalyzing ? '🔄 Analyzing...' : '🔍 Analyze Data'}
          </button>
        )}
      </div>

      {structure && (
        <div>
          {/* Quick Overview */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <div style={{
              background: 'white',
              padding: '12px',
              borderRadius: '6px',
              textAlign: 'center',
              border: '1px solid #e0e0e0'
            }}>
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>📊</div>
              <div style={{ fontSize: '18px', fontWeight: '500', color: '#252525' }}>
                {structure.rowCount}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>Rows</div>
            </div>
            
            <div style={{
              background: 'white',
              padding: '12px',
              borderRadius: '6px',
              textAlign: 'center',
              border: '1px solid #e0e0e0'
            }}>
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>📋</div>
              <div style={{ fontSize: '18px', fontWeight: '500', color: '#252525' }}>
                {structure.columnCount}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>Columns</div>
            </div>
            
            <div style={{
              background: 'white',
              padding: '12px',
              borderRadius: '6px',
              textAlign: 'center',
              border: '1px solid #e0e0e0'
            }}>
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>
                {getFormatIcon(structure.detectedFormat)}
              </div>
              <div style={{ fontSize: '12px', fontWeight: '500', color: '#252525', textTransform: 'capitalize' }}>
                {structure.detectedFormat}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>Format</div>
            </div>
            
            <div style={{
              background: 'white',
              padding: '12px',
              borderRadius: '6px',
              textAlign: 'center',
              border: '1px solid #e0e0e0'
            }}>
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>✨</div>
              <div style={{ 
                fontSize: '12px', 
                fontWeight: '500', 
                color: getQualityColor(structure.dataQuality.completeness) 
              }}>
                {Math.round(structure.dataQuality.completeness * 100)}%
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>Quality</div>
            </div>
          </div>

          {/* Smart Suggestions */}
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{
              margin: '0 0 8px 0',
              fontSize: '14px',
              fontWeight: '500',
              color: '#252525'
            }}>
              💡 Smart Suggestions
            </h4>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              {EnhancedAiService.generateFollowUpQuestions(structure).slice(0, 4).map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => onPromptSelect(prompt)}
                  style={{
                    padding: '6px 12px',
                    background: 'white',
                    border: '1px solid #0078d4',
                    borderRadius: '16px',
                    color: '#0078d4',
                    cursor: 'pointer',
                    fontSize: '12px',
                    transition: 'all 0.2s',
                    ':hover': {
                      background: '#0078d4',
                      color: 'white'
                    }
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#0078d4';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.color = '#0078d4';
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Toggle Details */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            style={{
              padding: '6px 12px',
              background: 'transparent',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              color: '#666',
              cursor: 'pointer',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {showDetails ? '▼' : '▶'} {showDetails ? 'Hide' : 'Show'} Details
          </button>

          {/* Detailed Analysis */}
          {showDetails && (
            <div style={{ marginTop: '16px' }}>
              {/* Column Analysis */}
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{
                  margin: '0 0 8px 0',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#252525'
                }}>
                  📋 Column Analysis
                </h4>
                <div style={{
                  background: 'white',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  overflow: 'hidden'
                }}>
                  {structure.columns.map((column, index) => (
                    <div
                      key={index}
                      style={{
                        padding: '8px 12px',
                        borderBottom: index < structure.columns.length - 1 ? '1px solid #f0f0f0' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '16px' }}>{getTypeIcon(column.type)}</span>
                        <span style={{ fontWeight: '500', fontSize: '13px' }}>{column.name}</span>
                        <span style={{ 
                          fontSize: '11px', 
                          color: '#666',
                          background: '#f0f0f0',
                          padding: '2px 6px',
                          borderRadius: '10px'
                        }}>
                          {column.type}
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#666' }}>
                        {column.uniqueCount} unique • {column.nullCount} empty
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Quality */}
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{
                  margin: '0 0 8px 0',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#252525'
                }}>
                  📊 Data Quality
                </h4>
                <div style={{
                  background: 'white',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  padding: '12px'
                }}>
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12px' }}>Completeness</span>
                      <span style={{ fontSize: '12px', fontWeight: '500' }}>
                        {Math.round(structure.dataQuality.completeness * 100)}%
                      </span>
                    </div>
                    <div style={{
                      height: '4px',
                      background: '#f0f0f0',
                      borderRadius: '2px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${structure.dataQuality.completeness * 100}%`,
                        background: getQualityColor(structure.dataQuality.completeness),
                        transition: 'width 0.3s'
                      }} />
                    </div>
                  </div>
                  
                  {structure.dataQuality.duplicateRows > 0 && (
                    <div style={{
                      fontSize: '12px',
                      color: '#d83b01',
                      background: '#fef2f2',
                      padding: '6px 8px',
                      borderRadius: '4px',
                      border: '1px solid #fecaca'
                    }}>
                      ⚠️ {structure.dataQuality.duplicateRows} duplicate rows found
                    </div>
                  )}
                </div>
              </div>

              {/* Data Quality Insights */}
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{
                  margin: '0 0 8px 0',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#252525'
                }}>
                  🔍 Quality Insights
                </h4>
                <div style={{
                  background: 'white',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  padding: '12px'
                }}>
                  {EnhancedAiService.generateQualityInsights(structure).map((insight, index) => (
                    <div
                      key={index}
                      style={{
                        fontSize: '12px',
                        color: '#252525',
                        marginBottom: index < EnhancedAiService.generateQualityInsights(structure).length - 1 ? '6px' : 0,
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '6px'
                      }}
                    >
                      {insight}
                    </div>
                  ))}
                </div>
              </div>

              {/* Chart Suggestions */}
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{
                  margin: '0 0 8px 0',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#252525'
                }}>
                  📊 Recommended Charts
                </h4>
                <div style={{
                  background: 'white',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  padding: '12px'
                }}>
                  {EnhancedAiService.suggestChartTypes(structure).map((suggestion, index) => (
                    <div
                      key={index}
                      style={{
                        fontSize: '12px',
                        color: '#252525',
                        marginBottom: index < EnhancedAiService.suggestChartTypes(structure).length - 1 ? '8px' : 0,
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                        padding: '6px',
                        background: '#f9f9f9',
                        borderRadius: '4px'
                      }}
                    >
                      <span style={{ fontWeight: '500', textTransform: 'capitalize' }}>{suggestion.type}:</span>
                      <span>{suggestion.reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transformation Suggestions */}
              <div>
                <h4 style={{
                  margin: '0 0 8px 0',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#252525'
                }}>
                  🔧 Smart Transformations
                </h4>
                <div style={{
                  background: 'white',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  padding: '12px'
                }}>
                  {EnhancedAiService.generateTransformationSuggestions(structure).map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => onPromptSelect(suggestion)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        fontSize: '12px',
                        color: '#252525',
                        marginBottom: index < EnhancedAiService.generateTransformationSuggestions(structure).length - 1 ? '4px' : 0,
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '6px',
                        padding: '6px 8px',
                        background: 'transparent',
                        border: '1px solid transparent',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f0f8ff';
                        e.currentTarget.style.borderColor = '#0078d4';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.borderColor = 'transparent';
                      }}
                    >
                      <span style={{ color: '#0078d4' }}>▶</span>
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}