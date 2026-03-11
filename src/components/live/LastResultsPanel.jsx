import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const formatBestLap = (seconds) => {
  if (!Number.isFinite(seconds)) {
    return null;
  }
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(3).padStart(6, '0');
  return `${mins}:${secs}`;
};

const formatGap = (driverLap, leaderLap) => {
  if (!Number.isFinite(driverLap) || !Number.isFinite(leaderLap)) {
    return null;
  }
  const gap = driverLap - leaderLap;
  if (gap <= 0) {
    return 'LEADER';
  }
  return `+${gap.toFixed(3)}s`;
};

const getSectionForPosition = (pos) => {
  if (!Number.isFinite(pos)) {
    return 'OUT';
  }
  if (pos <= 10) {
    return 'Q3';
  }
  if (pos <= 15) {
    return 'Q2';
  }
  return 'Q1';
};

const LastResultsPanel = () => {
  const [results, setResults] = useState([]);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [warning, setWarning] = useState('');

  useEffect(() => {
    const fetchSessionFallback = async () => {
      try {
        const sessionRes = await fetch('http://localhost:8080/api/timing/session/latest');
        if (sessionRes.ok) {
          const sessions = await sessionRes.json();
          if (Array.isArray(sessions) && sessions.length > 0) {
            setSession(sessions[0]);
            return;
          }
        }
      } catch (error) {
        console.error('Session fallback fetch failed:', error);
      }

      // Last-resort UI fallback to avoid empty heading.
      setSession({ country_name: 'Australia', session_name: 'Qualifying' });
    };

    const buildFallbackRowsFromLive = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/timing/live');
        if (!res.ok) {
          return [];
        }
        const data = await res.json();
        const latestPositions = {};
        (data || []).forEach((entry) => {
          const key = String(entry.driver_number);
          if (!latestPositions[key] || new Date(entry.date) > new Date(latestPositions[key].date)) {
            latestPositions[key] = entry;
          }
        });

        return Object.values(latestPositions)
          .map((p) => ({
            pos: Number(p.position),
            number: p.driver_number,
            name: `Driver #${p.driver_number}`,
            team: 'Unknown Team',
            teamColor: '#777777',
            headshot: '',
            bestLap: null,
            bestLapText: '--:--.---',
            gapText: Number(p.position) === 1 ? 'LEADER' : '--',
            status: null
          }))
          .filter((row) => Number.isFinite(row.pos))
          .sort((a, b) => a.pos - b.pos);
      } catch (error) {
        console.error('Live position fallback failed:', error);
        return [];
      }
    };

    const fetchLatestResults = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/timing/results/latest');
        const data = await res.json();

        // Only set warning if we have successfully loaded data
        // Don't show warning during error cases (those will be silently handled by fallback)
        if (!res.ok || data.error) {
          await fetchSessionFallback();
          throw new Error(data.message || 'Failed to load latest results');
        }

        // If we get here, we have a successful response
        if (data.warning) {
          setWarning(data.warning);
        }

        setSession(data.session || null);

        const sessionKey = data.session?.session_key;
        let laps = [];
        if (sessionKey) {
          const lapsRes = await fetch(`http://localhost:8080/api/timing/laps/${sessionKey}`);
          if (lapsRes.ok) {
            laps = await lapsRes.json();
          }
        }

        const driverMap = {};
        (data.drivers || []).forEach((d) => {
          driverMap[String(d.driver_number)] = {
            number: d.driver_number,
            name: d.full_name || d.name_acronym || `Driver #${d.driver_number}`,
            team: d.team_name || 'Unknown Team',
            teamColor: d.team_colour ? `#${d.team_colour}` : '#777777',
            headshot: d.headshot_url || '',
            acronym: d.name_acronym || ''
          };
        });

        const latestPositions = {};
        (data.positions || []).forEach((p) => {
          const key = String(p.driver_number);
          if (!latestPositions[key] || new Date(p.date) > new Date(latestPositions[key].date)) {
            latestPositions[key] = p;
          }
        });

        const bestLapByDriver = {};
        laps.forEach((lap) => {
          const key = String(lap.driver_number);
          const lapDuration = toNumber(lap.lap_duration);
          if (!Number.isFinite(lapDuration) || lapDuration <= 0) {
            return;
          }
          if (!Number.isFinite(bestLapByDriver[key]) || lapDuration < bestLapByDriver[key]) {
            bestLapByDriver[key] = lapDuration;
          }
        });

        const leaderLap = Object.values(bestLapByDriver).reduce((min, lap) => {
          if (!Number.isFinite(min) || lap < min) {
            return lap;
          }
          return min;
        }, null);

        const positioned = Object.values(latestPositions).map((p) => {
          const key = String(p.driver_number);
          const driver = driverMap[key] || {
            number: p.driver_number,
            name: `Driver #${p.driver_number}`,
            team: 'Unknown Team',
            teamColor: '#777777',
            headshot: ''
          };
          const bestLap = bestLapByDriver[key] ?? null;
          return {
            pos: toNumber(p.position),
            number: p.driver_number,
            ...driver,
            bestLap,
            bestLapText: formatBestLap(bestLap),
            gapText: formatGap(bestLap, leaderLap),
            status: bestLap ? null : 'DNQ'
          };
        });

        const positionedDriverKeys = new Set(positioned.map((d) => String(d.number)));
        const dnsRows = Object.values(driverMap)
          .filter((driver) => !positionedDriverKeys.has(String(driver.number)))
          .map((driver) => ({
            pos: null,
            number: driver.number,
            ...driver,
            bestLap: null,
            bestLapText: null,
            gapText: null,
            status: 'DNS'
          }));

        const combined = [...positioned, ...dnsRows].sort((a, b) => {
          if (!Number.isFinite(a.pos)) return 1;
          if (!Number.isFinite(b.pos)) return -1;
          return a.pos - b.pos;
        });

        if (combined.length > 0) {
          setResults(combined);
        } else {
          const fallbackRows = await buildFallbackRowsFromLive();
          setResults(fallbackRows);
        }
      } catch (err) {
        console.error('Results fetch failed:', err);
        // Silently try fallback - don't show error message to user
        await fetchSessionFallback();
        const fallbackRows = await buildFallbackRowsFromLive();
        setResults(fallbackRows);
        setWarning(''); // Clear any warning when using fallback
      } finally {
        setLoading(false);
      }
    };

    fetchLatestResults();
  }, []);

  const rowsWithSections = useMemo(() => {
    let prevSection = null;
    return results.map((driver) => {
      const section = getSectionForPosition(driver.pos);
      const showSection = section !== prevSection;
      prevSection = section;
      return { driver, section, showSection };
    });
  }, [results]);

  if (loading) {
    return (
      <div style={{ padding: '40px 5%' }}>
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            style={{
              height: '64px',
              marginBottom: '8px',
              borderRadius: '8px',
              background: 'linear-gradient(90deg, #1a1a1a 25%, #222 50%, #1a1a1a 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite'
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 5%', background: '#0a0a0a', minHeight: '100vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
        <div style={{ width: '4px', height: '40px', background: '#E8002D', borderRadius: '2px' }} />
        <div>
          <p style={{ color: '#E8002D', fontSize: '11px', letterSpacing: '0.15em', fontWeight: 700 }}>LAST SESSION</p>
          <h2 style={{ color: 'white', fontSize: '24px', fontWeight: 900, fontFamily: 'Titillium Web' }}>
            {session?.country_name || 'LATEST'} GP - {(session?.session_name || 'SESSION').toUpperCase()}
          </h2>
        </div>
      </div>

      {warning ? (
        <div
          style={{
            marginBottom: '14px',
            background: 'rgba(255,180,0,0.08)',
            border: '1px solid rgba(255,180,0,0.24)',
            color: 'rgba(255,220,140,0.95)',
            borderRadius: '8px',
            padding: '10px 12px',
            fontSize: '12px'
          }}
        >
          {warning}
        </div>
      ) : null}

      <div style={{ background: '#111', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
        {rowsWithSections.map(({ driver, section, showSection }, i) => (
          <React.Fragment key={`${driver.number}-${section}`}>
            {showSection && (
              <div
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  padding: '8px 24px',
                  color: '#BF5FFF',
                  fontSize: '12px',
                  letterSpacing: '0.12em',
                  fontWeight: 700,
                  fontFamily: 'JetBrains Mono'
                }}
              >
                {section}
              </div>
            )}

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              style={{
                display: 'grid',
                gridTemplateColumns: '54px 70px 4px 78px 1fr 150px 130px',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 20px',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                background: driver.pos === 1 ? 'rgba(255,215,0,0.05)' : 'transparent'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                {driver.headshot ? (
                  <img src={driver.headshot} alt={driver.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#2a2a2a' }} />
                )}
              </div>

              <span
                style={{
                  fontSize: '20px',
                  fontWeight: 900,
                  fontFamily: 'Titillium Web',
                  color:
                    driver.pos === 1
                      ? '#FFD700'
                      : driver.pos === 2
                      ? '#C0C0C0'
                      : driver.pos === 3
                      ? '#CD7F32'
                      : 'rgba(255,255,255,0.7)'
                }}
              >
                {Number.isFinite(driver.pos) ? `P${driver.pos}` : '--'}
              </span>

              <div style={{ height: '40px', borderRadius: '2px', background: driver.teamColor || '#666' }} />

              <span style={{ color: 'white', fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: '18px' }}>
                #{driver.number}
              </span>

              <div>
                <p style={{ color: 'white', fontWeight: 700, fontSize: '16px', fontFamily: 'Titillium Web' }}>
                  {driver.name}
                </p>
                <p style={{ color: driver.teamColor || '#888', fontSize: '12px', marginTop: '2px' }}>
                  {driver.team}
                </p>
              </div>

              <div style={{ color: 'white', fontFamily: 'JetBrains Mono', fontSize: '14px', fontWeight: 700 }}>
                {driver.bestLapText || '--:--.---'}
              </div>

              <div style={{ textAlign: 'right' }}>
                {driver.status ? (
                  <span
                    style={{
                      background: 'rgba(255,58,58,0.2)',
                      border: '1px solid rgba(255,58,58,0.4)',
                      color: '#FF6B6B',
                      borderRadius: '999px',
                      padding: '4px 10px',
                      fontSize: '11px',
                      fontWeight: 700,
                      fontFamily: 'JetBrains Mono'
                    }}
                  >
                    {driver.status}
                  </span>
                ) : (
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'JetBrains Mono', fontSize: '13px' }}>
                    {driver.gapText || '--'}
                  </span>
                )}
              </div>
            </motion.div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default LastResultsPanel;
