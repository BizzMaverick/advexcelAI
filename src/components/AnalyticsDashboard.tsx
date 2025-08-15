import { useState, useEffect } from 'react';
import analyticsService from '../services/analyticsService';

export default function AnalyticsDashboard() {
  const [painPoints, setPainPoints] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = () => {
      const data = analyticsService.getPainPoints();
      setPainPoints(data);
      setLoading(false);
    };

    loadAnalytics();
    // Refresh every 30 seconds
    const interval = setInterval(loadAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div>Loading analytics...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      <h2 style={{ marginBottom: '20px', color: '#333' }}>Analytics Dashboard</h2>
      
      <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        {/* Pain Points */}
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #e1e5e9'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#e53e3e' }}>Pain Points</h3>
          <div style={{ marginBottom: '10px' }}>
            <strong>Total Errors:</strong> {painPoints?.errors || 0}
          </div>
          <div style={{ marginBottom: '15px' }}>
            <strong>Page Abandonments:</strong> {painPoints?.abandonments || 0}
          </div>
          
          {painPoints?.commonErrors && Object.keys(painPoints.commonErrors).length > 0 && (
            <div>
              <strong>Common Errors:</strong>
              <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                {Object.entries(painPoints.commonErrors).map(([error, count]) => (
                  <li key={error} style={{ margin: '5px 0' }}>
                    {error}: {count as number} times
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* User Engagement */}
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #e1e5e9'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#0078d4' }}>User Engagement</h3>
          <div style={{ marginBottom: '10px' }}>
            <strong>Active Users:</strong> Real-time tracking enabled
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>Feature Usage:</strong> Tracked per interaction
          </div>
          <div style={{ color: '#666', fontSize: '14px' }}>
            Data updates every 30 seconds
          </div>
        </div>

        {/* AI Performance */}
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #e1e5e9'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#10b981' }}>AI Performance</h3>
          <div style={{ marginBottom: '10px' }}>
            <strong>Response Tracking:</strong> ✅ Active
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>Feedback Collection:</strong> ✅ Active
          </div>
          <div style={{ color: '#666', fontSize: '14px' }}>
            User ratings and feedback are being collected
          </div>
        </div>
      </div>

      <div style={{ marginTop: '30px', padding: '15px', background: '#f8f9fa', borderRadius: '6px' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Implementation Status</h4>
        <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
          <div>✅ User behavior tracking</div>
          <div>✅ In-app feedback collection</div>
          <div>✅ AI response accuracy monitoring</div>
          <div>✅ Error tracking and pain point analysis</div>
        </div>
      </div>
    </div>
  );
}