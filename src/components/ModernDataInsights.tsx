import { useState } from 'react';
import { DataStructure, DataDetectionService } from '../services/dataDetectionService';
import { EnhancedAiService } from '../services/enhancedAiService';

interface ModernDataInsightsProps {
  data: (string | number | boolean | null | undefined)[][];
  onPromptSelect: (prompt: string) => void;
}

export default function ModernDataInsights({ data, onPromptSelect }: ModernDataInsightsProps) {
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
    if (score >= 0.8) return '#4ecdc4';
    if (score >= 0.6) return '#ff9f43';
    return '#ff6b6b';
  };

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '24px',
      padding: '32px',
      fontFamily: '"Poppins", -apple-system, BlinkMacSystemFont, sans-serif',
      color: 'white'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px'
      }}>
        <h3 style={{
          margin: 0,
          fontSize: '18px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          🧠 Smart Data Insights
        </h3>
        
        {!structure && (
          <button
            onClick={analyzeData}
            disabled={isAnalyzing}
            style={{
              padding: '12px 20px',
              background: isAnalyzing ? 'rgba(255, 255, 255, 0.2)' : 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: isAnalyzing ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
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
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '16px',
              borderRadius: '12px',
              textAlign: 'center',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>📊</div>
              <div style={{ fontSize: '20px', fontWeight: '600', marginBottom: '4px' }}>
                {structure.rowCount}
              </div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>Rows</div>
            </div>
            
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '16px',
              borderRadius: '12px',
              textAlign: 'center',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>📋</div>
              <div style={{ fontSize: '20px', fontWeight: '600', marginBottom: '4px' }}>
                {structure.columnCount}
              </div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>Columns</div>
            </div>
            
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '16px',
              borderRadius: '12px',
              textAlign: 'center',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                {getFormatIcon(structure.detectedFormat)}
              </div>
              <div style={{ fontSize: '12px', fontWeight: '500', marginBottom: '4px', textTransform: 'capitalize' }}>
                {structure.detectedFormat}
              </div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>Format</div>
            </div>
            
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '16px',
              borderRadius: '12px',
              textAlign: 'center',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>✨</div>
              <div style={{ 
                fontSize: '12px', 
                fontWeight: '500', 
                color: getQualityColor(structure.dataQuality.completeness),
                marginBottom: '4px'
              }}>
                {Math.round(structure.dataQuality.completeness * 100)}%
              </div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>Quality</div>
            </div>
          </div>

          {/* Smart Suggestions */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{
              margin: '0 0 16px 0',
              fontSize: '16px',
              fontWeight: '600'
            }}>
              💡 Smart Suggestions
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '12px'
            }}>
              {EnhancedAiService.generateFollowUpQuestions(structure).slice(0, 4).map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => onPromptSelect(prompt)}
                  style={{
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '13px',
                    textAlign: 'left',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
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
              padding: '8px 16px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {showDetails ? '▼' : '▶'} {showDetails ? 'Hide' : 'Show'} Details
          </button>

          {/* Detailed Analysis */}
          {showDetails && (
            <div style={{ marginTop: '24px' }}>
              {/* Quality Insights */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{
                  margin: '0 0 16px 0',
                  fontSize: '16px',
                  fontWeight: '600'
                }}>
                  🔍 Quality Insights
                </h4>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  padding: '16px'
                }}>
                  {EnhancedAiService.generateQualityInsights(structure).map((insight, index) => (
                    <div
                      key={index}
                      style={{
                        fontSize: '13px',
                        marginBottom: index < EnhancedAiService.generateQualityInsights(structure).length - 1 ? '8px' : 0,
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px'
                      }}
                    >
                      {insight}
                    </div>
                  ))}
                </div>
              </div>

              {/* Column Analysis */}
              <div>
                <h4 style={{
                  margin: '0 0 16px 0',
                  fontSize: '16px',
                  fontWeight: '600'
                }}>
                  📋 Column Analysis
                </h4>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  overflow: 'hidden'
                }}>
                  {structure.columns.slice(0, 5).map((column, index) => (
                    <div
                      key={index}
                      style={{
                        padding: '12px 16px',
                        borderBottom: index < Math.min(structure.columns.length, 5) - 1 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '16px' }}>{getTypeIcon(column.type)}</span>
                        <span style={{ fontWeight: '500', fontSize: '14px' }}>{column.name}</span>
                        <span style={{ 
                          fontSize: '11px', 
                          opacity: 0.8,
                          background: 'rgba(255, 255, 255, 0.1)',
                          padding: '2px 8px',
                          borderRadius: '10px'
                        }}>
                          {column.type}
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', opacity: 0.7 }}>
                        {column.uniqueCount} unique • {column.nullCount} empty
                      </div>
                    </div>
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