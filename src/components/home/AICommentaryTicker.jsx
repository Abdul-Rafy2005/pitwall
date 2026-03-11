import React, { useEffect, useState } from 'react';
import { apiUrl } from '../../config/api';

const AICommentaryTicker = () => {
  const [insights, setInsights] = useState([
    "Loading AI race insights...",
  ]);

  useEffect(() => {
    const fetchCommentary = async () => {
      try {
        const res = await fetch(apiUrl('/api/commentary/live'), {
          mode: 'cors'
        });
        const data = await res.json();
        console.log('Groq raw response:', data);

        // Extract content from Groq response structure
        const content = data?.choices?.[0]?.message?.content;
        console.log('Groq content:', content);

        if (content) {
          try {
            // Try parsing as JSON array
            const parsed = JSON.parse(content);
            if (Array.isArray(parsed)) {
              setInsights(parsed);
            }
          } catch {
            // If not JSON, split by newline or comma
            const lines = content
              .replace(/[\[\]"]/g, '')
              .split(',')
              .map(s => s.trim())
              .filter(s => s.length > 5);
            setInsights(lines.length > 0 ? lines : [content]);
          }
        }
      } catch (err) {
        console.error('Commentary error:', err);
      }
    };

    fetchCommentary(); // fetch immediately
    const interval = setInterval(fetchCommentary, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ 
      background: '#0d0005', 
      borderTop: '1px solid rgba(232,0,45,0.3)', 
      borderBottom: '1px solid rgba(232,0,45,0.3)', 
      padding: '16px 0', 
      overflow: 'hidden', 
      display: 'flex', 
      alignItems: 'center' 
    }}>
      {/* Left label - fixed */}
      <div style={{ 
        minWidth: '200px', 
        padding: '0 24px', 
        borderRight: '1px solid rgba(255,255,255,0.15)', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px' 
      }}>
        <span style={{ color: '#E8002D', fontSize: '18px' }}>🤖</span>
        <span style={{ 
          color: '#E8002D', 
          fontFamily: 'Titillium Web', 
          fontWeight: 700, 
          fontSize: '13px', 
          letterSpacing: '0.1em' 
        }}>AI PITWALL</span>
      </div>
      {/* Scrolling ticker */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}
        onMouseEnter={e => e.currentTarget.querySelector('.ticker').style.animationPlayState = 'paused'}
        onMouseLeave={e => e.currentTarget.querySelector('.ticker').style.animationPlayState = 'running'}
      >
        <div className="ticker" style={{
          display: 'flex', 
          gap: '48px', 
          whiteSpace: 'nowrap',
          animation: 'tickerScroll 35s linear infinite',
          fontFamily: 'JetBrains Mono', 
          fontSize: '13px', 
          color: '#ffffff', 
          padding: '0 24px'
        }}>
          {insights.map((msg, i) => (
            <span key={i}>
              <span style={{ color: '#E8002D', marginRight: '48px' }}>•</span>
              {msg}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AICommentaryTicker;
