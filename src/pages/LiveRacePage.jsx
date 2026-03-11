import React, { useEffect, useMemo, useState } from 'react';
import LiveLeaderboard from '../components/live/LiveLeaderboard';
import TrackMapPanel from '../components/live/TrackMap';
import DriverDetailPanel from '../components/live/DriverDetailPanel';
import LastResultsPanel from '../components/live/LastResultsPanel';
import AICommentaryPanel from '../components/live/AICommentaryPanel';
import { apiUrl } from '../config/api';

const fallbackSessionWindow = () => {
  const now = new Date();
  const sessions = [
    { start: new Date('2026-03-07T06:00:00Z'), end: new Date('2026-03-07T08:00:00Z'), type: 'QUALIFYING' },
    { start: new Date('2026-03-08T05:00:00Z'), end: new Date('2026-03-08T07:30:00Z'), type: 'RACE' }
  ];
  return sessions.find((s) => now >= s.start && now <= s.end) || null;
};

const getLiveSessionFromApi = (session) => {
  if (!session) {
    return null;
  }

  const now = new Date();
  const start = session.date_start ? new Date(session.date_start) : null;
  const end = session.date_end ? new Date(session.date_end) : null;

  if (!start || Number.isNaN(start.getTime())) {
    return null;
  }

  // OpenF1 can occasionally omit date_end for ongoing sessions.
  if (!end || Number.isNaN(end.getTime())) {
    return now >= start
      ? {
          type: session.session_name || 'LIVE',
          country: session.country_name || ''
        }
      : null;
  }

  return now >= start && now <= end
    ? {
        type: session.session_name || 'LIVE',
        country: session.country_name || ''
      }
    : null;
};

const LiveRacePage = () => {
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [liveSession, setLiveSession] = useState(fallbackSessionWindow());
  const [sessionMeta, setSessionMeta] = useState(null);

  useEffect(() => {
    const checkSessionStatus = async () => {
      try {
        const res = await fetch(apiUrl('/api/timing/session/latest'));
        if (!res.ok) {
          throw new Error(`Session API error: ${res.status}`);
        }

        const sessions = await res.json();
        const latest = Array.isArray(sessions) && sessions.length > 0 ? sessions[0] : null;
        setSessionMeta(latest || null);
        const liveFromApi = getLiveSessionFromApi(latest);
        setLiveSession(liveFromApi || fallbackSessionWindow());
      } catch (error) {
        console.error('Failed to check live session status:', error);
        setSessionMeta(null);
        setLiveSession(fallbackSessionWindow());
      }
    };

    checkSessionStatus();
    const interval = setInterval(checkSessionStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const activeDriver = useMemo(() => {
    if (selectedDriver) {
      return selectedDriver;
    }
    return drivers[0] || null;
  }, [drivers, selectedDriver]);

  if (!liveSession) {
    return <LastResultsPanel />;
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateRows: '1fr auto',
        height: 'calc(100vh - 60px)',
        background: '#0a0a0a',
        overflow: 'hidden',
      }}
    >
      {/* Three-column racing panels */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '280px 1fr 300px',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 5,
            background: 'rgba(232,0,45,0.2)',
            border: '1px solid rgba(232,0,45,0.35)',
            color: 'white',
            borderRadius: '999px',
            padding: '5px 12px',
            fontSize: '11px',
            letterSpacing: '0.08em',
            fontWeight: 700
          }}
        >
          {(liveSession.country ? `${liveSession.country} ` : '') + liveSession.type + ' LIVE'}
        </div>

        <LiveLeaderboard
          selectedDriver={activeDriver}
          onSelectDriver={setSelectedDriver}
          onDriversUpdate={setDrivers}
          sessionMeta={sessionMeta}
        />
        <TrackMapPanel drivers={drivers} sessionMeta={sessionMeta} />
        <DriverDetailPanel driver={activeDriver} />
      </div>

      {/* AI commentary bar — only mounts/shows when a session is live */}
      <AICommentaryPanel />
    </div>
  );
};

export default LiveRacePage;
