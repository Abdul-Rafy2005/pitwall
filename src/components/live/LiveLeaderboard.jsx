import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const fallbackTeamColor = '#9b9b9b';

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const formatBestLap = (seconds) => {
  if (!Number.isFinite(seconds)) {
    return '--:--.---';
  }
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(3).padStart(6, '0');
  return `${mins}:${secs}`;
};

const computeGap = (bestLap, leaderLap, index) => {
  if (index === 0) {
    return 'LEADER';
  }
  if (Number.isFinite(bestLap) && Number.isFinite(leaderLap)) {
    const gap = Math.max(0, bestLap - leaderLap);
    return `+${gap.toFixed(3)}s`;
  }
  return `+${(index * 0.28 + 0.12).toFixed(2)}s`;
};

const buildDriverMap = (drivers) => {
  const map = {};
  (drivers || []).forEach((d) => {
    map[String(d.driver_number)] = {
      fullName: d.full_name || d.name_acronym || `Driver #${d.driver_number}`,
      acronym: d.name_acronym || '',
      teamName: d.team_name || 'Unknown Team',
      teamColor: d.team_colour ? `#${d.team_colour}` : fallbackTeamColor,
      headshot: d.headshot_url || ''
    };
  });
  return map;
};

const LiveLeaderboard = ({ selectedDriver, onSelectDriver, onDriversUpdate, sessionMeta }) => {
  const [rows, setRows] = useState([]);
  const [driverMap, setDriverMap] = useState({});
  const [bestLapByDriver, setBestLapByDriver] = useState({});
  const [sessionKey, setSessionKey] = useState(null);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    let mounted = true;
    
    const fetchMetadata = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
        
        const res = await fetch('http://localhost:8080/api/timing/results/latest', {
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        const data = await res.json();
        if (!mounted) return;
        
        if (!res.ok || data.error) {
          setFetchError(data.message || 'Failed to fetch');
          return;
        }

        setDriverMap(buildDriverMap(data.drivers));
        if (data?.session?.session_key) {
          setSessionKey(data.session.session_key);
        }
        setFetchError(null);
        setIsLoadingInitial(false);
      } catch (error) {
        if (!mounted) return;
        console.error('Failed to fetch driver metadata:', error);
        setFetchError(error.name === 'AbortError' ? 'Request timeout' : error.message);
        setIsLoadingInitial(false);
      }
    };

    fetchMetadata();
    const interval = setInterval(fetchMetadata, 45000);
    
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!sessionKey) {
      return undefined;
    }

    const fetchLaps = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/timing/laps/${sessionKey}`);
        if (!res.ok) {
          return;
        }
        const laps = await res.json();
        const best = {};

        (laps || []).forEach((lap) => {
          const key = String(lap.driver_number);
          const lapDuration = toNumber(lap.lap_duration);
          if (!Number.isFinite(lapDuration) || lapDuration <= 0) {
            return;
          }
          if (!Number.isFinite(best[key]) || lapDuration < best[key]) {
            best[key] = lapDuration;
          }
        });

        setBestLapByDriver(best);
      } catch (error) {
        console.error('Failed to fetch lap data:', error);
      }
    };

    fetchLaps();
    const interval = setInterval(fetchLaps, 15000);
    return () => clearInterval(interval);
  }, [sessionKey]);

  useEffect(() => {
    const fetchTiming = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/timing/live');
        if (!res.ok) {
          throw new Error(`Timing API error: ${res.status}`);
        }

        const data = await res.json();
        const latestPositions = {};

        (data || []).forEach((entry) => {
          const dn = String(entry.driver_number);
          if (!latestPositions[dn] || new Date(entry.date) > new Date(latestPositions[dn].date)) {
            latestPositions[dn] = entry;
          }
        });

        const sorted = Object.values(latestPositions)
          .map((entry) => ({
            ...entry,
            position: toNumber(entry.position)
          }))
          .filter((entry) => Number.isFinite(entry.position))
          .sort((a, b) => a.position - b.position)
          .slice(0, 20)
          .map((entry, index, all) => {
            const key = String(entry.driver_number);
            const meta = driverMap[key] || {};
            const leaderKey = String(all[0]?.driver_number || '');
            const leaderLap = bestLapByDriver[leaderKey];
            const bestLap = bestLapByDriver[key];

            return {
              ...entry,
              full_name: meta.fullName || `Driver #${entry.driver_number}`,
              name_acronym: meta.acronym || '',
              team_name: meta.teamName || 'Unknown Team',
              team_color: meta.teamColor || fallbackTeamColor,
              headshot_url: meta.headshot || '',
              bestLap,
              bestLapText: formatBestLap(bestLap),
              gapText: computeGap(bestLap, leaderLap, index)
            };
          });

        setRows(sorted);
        onDriversUpdate(sorted);

        if (!selectedDriver && sorted.length > 0) {
          onSelectDriver(sorted[0]);
        }
      } catch (error) {
        console.error('Live timing fetch failed:', error);
      }
    };

    fetchTiming();
    const interval = setInterval(fetchTiming, 3000);
    return () => clearInterval(interval);
  }, [bestLapByDriver, driverMap, onDriversUpdate, onSelectDriver, selectedDriver]);

  const headerTitle = useMemo(() => {
    const sessionName = sessionMeta?.session_name ? sessionMeta.session_name.toUpperCase() : 'LIVE TIMING';
    const circuit = sessionMeta?.circuit_short_name || '';
    return circuit ? `${circuit} - ${sessionName}` : sessionName;
  }, [sessionMeta]);

  return (
    <div
      style={{
        background: '#0f1012',
        height: '100%',
        overflowY: 'auto',
        borderRight: '1px solid rgba(255,255,255,0.08)'
      }}
    >
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 5,
          padding: '14px 14px 10px',
          background: 'linear-gradient(180deg, #15171b 0%, #121318 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.09)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'white', fontWeight: 800, fontSize: '12px', letterSpacing: '0.1em' }}>{headerTitle}</span>
          <span
            style={{
              background: '#E8002D',
              color: 'white',
              fontSize: '10px',
              fontWeight: 800,
              padding: '3px 8px',
              borderRadius: '999px',
              animation: 'pulse 1.5s infinite'
            }}
          >
            LIVE
          </span>
        </div>

        <div
          style={{
            marginTop: '10px',
            display: 'grid',
            gridTemplateColumns: '40px 1fr 70px 64px',
            color: 'rgba(255,255,255,0.55)',
            fontSize: '10px',
            letterSpacing: '0.08em',
            fontFamily: 'JetBrains Mono'
          }}
        >
          <span>POS</span>
          <span>DRIVER</span>
          <span>BEST</span>
          <span style={{ textAlign: 'right' }}>GAP</span>
        </div>
      </div>
      {/* Loading State */}
      {isLoadingInitial && rows.length === 0 && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          color: 'rgba(255, 255, 255, 0.5)'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(232, 0, 45, 0.2)',
            borderTop: '3px solid #E8002D',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '16px'
          }} />
          <p style={{ fontSize: '11px', fontFamily: 'JetBrains Mono', letterSpacing: '0.1em' }}>
            LOADING TIMING DATA...
          </p>
          {fetchError && (
            <p style={{ fontSize: '10px', color: '#E8002D', marginTop: '8px' }}>
              {fetchError}
            </p>
          )}
        </div>
      )}

      {/* Driver Rows */}
      {!isLoadingInitial && rows.length === 0 && (
        <div style={{
          padding: '40px 20px',
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.4)',
          fontSize: '11px',
          fontFamily: 'JetBrains Mono'
        }}>
          NO TIMING DATA AVAILABLE
        </div>
      )}
      {rows.map((driver, index) => (
        <Link 
          key={driver.driver_number} 
          to={`/driver/${driver.driver_number}`}
          style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
        >
          <motion.div
            layout
            onClick={() => onSelectDriver(driver)}
            style={{
              display: 'grid',
              gridTemplateColumns: '40px 1fr 70px 64px',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 12px',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
              cursor: 'pointer',
              background: selectedDriver?.driver_number === driver.driver_number ? 'rgba(232,0,45,0.12)' : 'transparent'
            }}
            whileHover={{ background: 'rgba(255,255,255,0.04)' }}
          >
            <span
              style={{
                color: driver.position === 1 ? '#FFD700' : 'rgba(255,255,255,0.8)',
                fontSize: '15px',
                fontWeight: 900,
                fontFamily: 'JetBrains Mono'
              }}
            >
              P{driver.position}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <div style={{ width: '3px', height: '36px', borderRadius: '2px', background: driver.team_color || fallbackTeamColor }} />
              {driver.headshot_url ? (
                <img
                  src={driver.headshot_url}
                  alt={driver.full_name}
                  style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.2)' }}
                />
              ) : null}
              <div style={{ minWidth: 0 }}>
                <div style={{ color: 'white', fontWeight: 700, fontSize: '12px', lineHeight: 1.1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {driver.name_acronym || driver.full_name}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', fontFamily: 'JetBrains Mono', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  #{driver.driver_number} {driver.team_name}
                </div>
              </div>
            </div>

            <span style={{ color: index === 0 ? '#BF5FFF' : 'white', fontSize: '11px', fontFamily: 'JetBrains Mono', fontWeight: 700 }}>
              {driver.bestLapText}
            </span>

            <span style={{ color: 'rgba(255,255,255,0.62)', fontSize: '11px', fontFamily: 'JetBrains Mono', textAlign: 'right' }}>
              {driver.gapText}
            </span>
          </motion.div>
        </Link>
      ))}
    </div>
  );
};

export default LiveLeaderboard;
