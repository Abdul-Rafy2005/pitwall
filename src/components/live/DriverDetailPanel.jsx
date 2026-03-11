import React, { useEffect, useMemo, useState } from 'react';

const DRIVER_INFO = {
  '1': { name: 'Max Verstappen', team: 'Red Bull Racing', teamColor: '#3671C6' },
  '4': { name: 'Lando Norris', team: 'McLaren', teamColor: '#FF8000' },
  '16': { name: 'Charles Leclerc', team: 'Ferrari', teamColor: '#E8002D' },
  '44': { name: 'Lewis Hamilton', team: 'Ferrari', teamColor: '#E8002D' },
  '63': { name: 'George Russell', team: 'Mercedes', teamColor: '#00D2BE' },
  '81': { name: 'Oscar Piastri', team: 'McLaren', teamColor: '#FF8000' },
  '14': { name: 'Fernando Alonso', team: 'Aston Martin', teamColor: '#006F62' }
};

const getTempColor = (temp) => {
  if (temp < 80) {
    return '#39FF14';
  }
  if (temp <= 100) {
    return '#FF8C00';
  }
  return '#FF3333';
};

const DriverDetailPanel = ({ driver }) => {
  const [activeTab, setActiveTab] = useState('TYRES');
  const [driverLaps, setDriverLaps] = useState([]);
  const [driverStints, setDriverStints] = useState([]);

  const driverInfo = useMemo(() => {
    if (!driver) {
      return {
        number: '--',
        name: 'No Driver Selected',
        team: 'Unknown Team',
        teamColor: '#888',
        headshot: '',
        bestLapText: '--:--.---',
        gapText: '--',
        position: '--'
      };
    }

    const info = DRIVER_INFO[String(driver.driver_number)] || {
      name: `Driver #${driver.driver_number}`,
      team: 'Formula 1 Team',
      teamColor: '#E8002D'
    };

    return {
      number: driver.driver_number,
      name: driver.full_name || info.name,
      team: driver.team_name || info.team,
      teamColor: driver.team_color || info.teamColor,
      headshot: driver.headshot_url || '',
      bestLapText: driver.bestLapText || '--:--.---',
      gapText: driver.gapText || '--',
      position: driver.position || '--'
    };
  }, [driver]);

  const tyreData = [
    { label: 'FL', temp: 78 },
    { label: 'FR', temp: 96 },
    { label: 'RL', temp: 102 },
    { label: 'RR', temp: 92 }
  ];

  useEffect(() => {
    if (!driver?.session_key || !driver?.driver_number) {
      setDriverLaps([]);
      setDriverStints([]);
      return;
    }

    const sessionKey = String(driver.session_key);
    const driverNumber = Number(driver.driver_number);

    const fetchDetails = async () => {
      try {
        const [lapsRes, stintsRes] = await Promise.all([
          fetch(`http://localhost:8080/api/timing/laps/${sessionKey}`),
          fetch(`http://localhost:8080/api/timing/tyres/${sessionKey}`)
        ]);

        if (lapsRes.ok) {
          const laps = await lapsRes.json();
          const filteredLaps = (laps || [])
            .filter((lap) => Number(lap.driver_number) === driverNumber)
            .sort((a, b) => Number(a.lap_number || 0) - Number(b.lap_number || 0));
          setDriverLaps(filteredLaps);
        }

        if (stintsRes.ok) {
          const stints = await stintsRes.json();
          const filteredStints = (stints || [])
            .filter((stint) => Number(stint.driver_number) === driverNumber)
            .sort((a, b) => Number(a.stint_number || 0) - Number(b.stint_number || 0));
          setDriverStints(filteredStints);
        }
      } catch (error) {
        console.error('Failed to fetch driver detail data:', error);
      }
    };

    fetchDetails();
  }, [driver?.driver_number, driver?.session_key]);

  const bestLap = useMemo(() => {
    if (!driverLaps.length) return null;
    const valid = driverLaps
      .map((lap) => Number(lap.lap_duration))
      .filter((value) => Number.isFinite(value) && value > 0);
    if (!valid.length) return null;
    return Math.min(...valid);
  }, [driverLaps]);

  const lastLap = useMemo(() => {
    if (!driverLaps.length) return null;
    const last = driverLaps[driverLaps.length - 1];
    const duration = Number(last.lap_duration);
    return Number.isFinite(duration) && duration > 0 ? duration : null;
  }, [driverLaps]);

  const formatLap = (seconds) => {
    if (!Number.isFinite(seconds)) return '--:--.---';
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(3).padStart(6, '0');
    return `${mins}:${secs}`;
  };

  const latestStint = driverStints.length ? driverStints[driverStints.length - 1] : null;
  const compoundLabel = latestStint?.compound || 'UNKNOWN';
  const stintAge = latestStint && latestStint.lap_start != null && latestStint.lap_end != null
    ? Math.max(0, Number(latestStint.lap_end) - Number(latestStint.lap_start) + 1)
    : null;

  return (
    <div
      style={{
        background: '#111',
        height: '100%',
        padding: '18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}
    >
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '14px' }}>
        {driverInfo.headshot ? (
          <img
            src={driverInfo.headshot}
            alt={driverInfo.name}
            style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.2)', marginBottom: '10px' }}
          />
        ) : null}
        <div style={{ fontSize: '32px', fontWeight: 900, fontFamily: 'JetBrains Mono', color: 'white' }}>
          P{driverInfo.position} #{driverInfo.number}
        </div>
        <div style={{ color: 'white', fontSize: '24px', fontWeight: 800, lineHeight: 1.2 }}>
          {driverInfo.name}
        </div>
        <div style={{ color: driverInfo.teamColor, fontSize: '14px', fontWeight: 700, marginTop: '4px' }}>
          {driverInfo.team}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
        {['TIMES', 'LAPS', 'TYRES'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: activeTab === tab ? 'rgba(232,0,45,0.18)' : 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'white',
              borderRadius: '8px',
              padding: '8px 0',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '0.08em'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'TIMES' ? (
        <div style={{ display: 'grid', gap: '10px' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px' }}>
            <div style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'JetBrains Mono', fontSize: '11px' }}>BEST LAP</div>
            <div style={{ color: '#BF5FFF', fontFamily: 'JetBrains Mono', fontWeight: 800, fontSize: '20px', marginTop: '4px' }}>
              {formatLap(bestLap)}
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px' }}>
            <div style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'JetBrains Mono', fontSize: '11px' }}>LAST LAP</div>
            <div style={{ color: 'white', fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: '18px', marginTop: '4px' }}>
              {formatLap(lastLap)}
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'rgba(255,255,255,0.65)', fontFamily: 'JetBrains Mono', fontSize: '12px' }}>GAP</span>
            <span style={{ color: 'white', fontFamily: 'JetBrains Mono', fontWeight: 700 }}>{driverInfo.gapText}</span>
          </div>
        </div>
      ) : activeTab === 'LAPS' ? (
        <div style={{ display: 'grid', gap: '8px', maxHeight: '340px', overflowY: 'auto', paddingRight: '4px' }}>
          {driverLaps.slice(-12).reverse().map((lap) => (
            <div
              key={`${lap.driver_number}-${lap.lap_number}`}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px',
                padding: '10px 12px',
                display: 'grid',
                gridTemplateColumns: '48px 1fr',
                gap: '10px'
              }}
            >
              <span style={{ color: 'rgba(255,255,255,0.75)', fontFamily: 'JetBrains Mono', fontSize: '12px' }}>
                L{lap.lap_number}
              </span>
              <div>
                <div style={{ color: 'white', fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: '12px' }}>
                  {formatLap(Number(lap.lap_duration))}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'JetBrains Mono', fontSize: '10px', marginTop: '2px' }}>
                  S1 {formatLap(Number(lap.duration_sector_1))} · S2 {formatLap(Number(lap.duration_sector_2))} · S3 {formatLap(Number(lap.duration_sector_3))}
                </div>
              </div>
            </div>
          ))}
          {!driverLaps.length ? (
            <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px' }}>No lap data available yet.</div>
          ) : null}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {tyreData.map((tyre) => (
              <div
                key={tyre.label}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px',
                  padding: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ color: 'rgba(255,255,255,0.75)', fontFamily: 'JetBrains Mono', fontSize: '12px' }}>
                  {tyre.label}
                </div>
                <div
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    background: getTempColor(tyre.temp),
                    boxShadow: `0 0 14px ${getTempColor(tyre.temp)}`
                  }}
                />
                <div style={{ color: 'white', fontFamily: 'JetBrains Mono', fontSize: '12px' }}>
                  {tyre.temp}°C
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span
              style={{
                background: '#E8002D',
                color: 'white',
                borderRadius: '999px',
                padding: '6px 12px',
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.08em'
              }}
            >
              {compoundLabel.toUpperCase()}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'JetBrains Mono', fontSize: '12px' }}>
              Tire Age: {stintAge != null ? `${stintAge} laps` : '--'}
            </span>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px', display: 'grid', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.75)', fontFamily: 'JetBrains Mono', fontSize: '12px' }}>
              <span>BEST LAP</span>
              <span style={{ color: 'white', fontWeight: 700 }}>{driverInfo.bestLapText}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.75)', fontFamily: 'JetBrains Mono', fontSize: '12px' }}>
              <span>GAP</span>
              <span style={{ color: 'white', fontWeight: 700 }}>{driverInfo.gapText}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverDetailPanel;
