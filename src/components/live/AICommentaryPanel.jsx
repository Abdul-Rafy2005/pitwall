import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { apiUrl } from '../../config/api';

const AICommentaryPanel = () => {
  const [isLive, setIsLive] = useState(null); // null=checking, true=live, false=not live
  const [showFarewell, setShowFarewell] = useState(false);
  const [insights, setInsights] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [secondsAgo, setSecondsAgo] = useState(0);

  const wasLiveRef = useRef(false);
  const farewellFiredRef = useRef(false);

  const checkLive = async () => {
    try {
      const res = await fetch(apiUrl('/api/commentary/is-live'));
      const data = await res.json();

      if (!data.isLive && wasLiveRef.current && !farewellFiredRef.current) {
        // Session just ended — show farewell then hide
        farewellFiredRef.current = true;
        wasLiveRef.current = false;
        setShowFarewell(true);
        setTimeout(() => {
          setShowFarewell(false);
          setIsLive(false);
        }, 3000);
      } else {
        wasLiveRef.current = data.isLive;
        setIsLive(data.isLive);
      }
    } catch {
      // silent fail — keep existing state
    }
  };

  const fetchInsights = async () => {
    try {
      const res = await fetch(apiUrl('/api/commentary/live'));
      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content;
      if (content) {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setInsights(parsed);
          setCurrentIndex(0);
          setLastUpdated(Date.now());
          setSecondsAgo(0);
        }
      }
    } catch {
      // silent fail — keep existing insights
    }
  };

  // Initial live check on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { checkLive(); }, []);

  // Start fetching commentary and periodic live checks once confirmed live
  useEffect(() => {
    if (!isLive) return;

    fetchInsights();
    const commentaryTimer = setInterval(fetchInsights, 30000);
    const liveCheckTimer = setInterval(checkLive, 60000);

    return () => {
      clearInterval(commentaryTimer);
      clearInterval(liveCheckTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLive]);

  // Cycle through the 3 insights every 8 seconds
  useEffect(() => {
    if (insights.length === 0 || !isLive) return;
    const cycleTimer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % insights.length);
    }, 8000);
    return () => clearInterval(cycleTimer);
  }, [insights, isLive]);

  // Keep the "Updated X seconds ago" counter ticking
  useEffect(() => {
    if (!lastUpdated) return;
    const tickTimer = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - lastUpdated) / 1000));
    }, 1000);
    return () => clearInterval(tickTimer);
  }, [lastUpdated]);

  // Not yet checked, or confirmed not live and farewell is done
  if (isLive === null || (isLive === false && !showFarewell)) return null;

  const currentInsight = insights[currentIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: showFarewell ? [1, 1, 0] : 1, y: 0 }}
      transition={showFarewell ? { duration: 3, times: [0, 0.7, 1] } : { duration: 0.4 }}
      style={{
        background: 'rgba(255,255,255,0.03)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        minHeight: '60px',
        flexShrink: 0,
      }}
    >
      {/* Pulsing AI LIVE badge */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
        <div
          style={{
            background: '#E8002D',
            color: '#ffffff',
            padding: '5px 11px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.1em',
            fontFamily: 'Titillium Web, sans-serif',
            whiteSpace: 'nowrap',
            animation: 'pulse 2s ease-in-out infinite',
          }}
        >
          🎙️ AI LIVE
        </div>
      </div>

      {/* Thin vertical divider */}
      <div
        style={{
          width: '1px',
          height: '32px',
          background: 'rgba(255,255,255,0.15)',
          flexShrink: 0,
        }}
      />

      {/* Commentary text area — fixed height so the panel doesn't grow */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative', height: '24px' }}>
        <AnimatePresence mode="wait">
          {showFarewell ? (
            <motion.div
              key="farewell"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                color: '#ffffff',
                fontSize: '15px',
                fontFamily: 'Inter, Titillium Web, sans-serif',
              }}
            >
              🏁 Session ended — see you next time!
            </motion.div>
          ) : currentInsight ? (
            <motion.div
              key={`${currentIndex}-${currentInsight.slice(0, 20)}`}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.35 }}
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#ffffff',
                fontSize: '15px',
                fontFamily: 'Inter, Titillium Web, sans-serif',
              }}
            >
              <span style={{ flexShrink: 0 }}>🤖</span>
              <span>{currentInsight}</span>
            </motion.div>
          ) : (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                color: 'rgba(255,255,255,0.4)',
                fontSize: '14px',
                fontFamily: 'Inter, Titillium Web, sans-serif',
              }}
            >
              Fetching live insights…
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Updated X seconds ago — far right */}
      {lastUpdated && !showFarewell && (
        <div
          style={{
            color: 'rgba(255,255,255,0.35)',
            fontSize: '12px',
            fontFamily: 'JetBrains Mono, monospace',
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
        >
          Updated {secondsAgo}s ago
        </div>
      )}
    </motion.div>
  );
};

export default AICommentaryPanel;
