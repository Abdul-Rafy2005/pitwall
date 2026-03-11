import React, { useEffect, useMemo, useState } from 'react';

const DRIVER_TEAM_COLORS = {
  '1': '#3671C6',
  '4': '#FF8000',
  '16': '#E8002D',
  '44': '#00D2BE',
  '63': '#00D2BE',
  '55': '#E8002D',
  '81': '#FF8000',
  '14': '#229971',
  '10': '#FF87BC',
  '23': '#64C4FF',
  '22': '#6692FF'
};

const TRACK_LIBRARY = {
  melbourne: {
    name: 'Albert Park Circuit',
    path: 'M 200 50 L 280 50 Q 320 50 340 80 L 360 130 Q 370 160 350 180 L 320 200 L 340 240 Q 355 270 340 300 L 300 340 Q 270 365 240 355 L 200 340 L 160 355 Q 130 365 100 340 L 60 300 Q 45 270 60 240 L 80 200 L 50 180 Q 30 160 40 130 L 60 80 Q 80 50 120 50 Z',
    placement: { cx: 200, cy: 200, rx: 155, ry: 145, offset: -Math.PI / 2 },
    sectors: [
      { x: 340, y: 130, label: 'S1', color: '#39FF14', tx: 350, ty: 125 },
      { x: 340, y: 270, label: 'S2', color: '#BF5FFF', tx: 350, ty: 265 },
      { x: 100, y: 270, label: 'S3', color: '#FF6B00', tx: 55, ty: 265 }
    ]
  },
  monza: {
    name: 'Monza Circuit',
    path: 'M 80 210 L 85 120 Q 90 80 130 70 L 280 60 Q 330 62 350 95 L 345 145 Q 340 165 320 176 L 250 186 L 335 220 Q 360 234 360 260 L 340 320 Q 325 350 290 350 L 160 348 Q 120 348 95 325 L 65 285 Q 45 260 50 235 Z',
    placement: { cx: 205, cy: 210, rx: 165, ry: 130, offset: -Math.PI / 3 },
    sectors: [
      { x: 338, y: 118, label: 'S1', color: '#39FF14', tx: 349, ty: 113 },
      { x: 338, y: 268, label: 'S2', color: '#BF5FFF', tx: 349, ty: 263 },
      { x: 98, y: 318, label: 'S3', color: '#FF6B00', tx: 58, ty: 313 }
    ]
  },
  silverstone: {
    name: 'Silverstone Circuit',
    path: 'M 70 220 L 80 140 Q 90 90 145 80 L 280 70 Q 330 72 350 110 L 345 170 Q 340 200 310 214 L 250 225 L 320 250 Q 352 266 350 300 L 320 336 Q 295 360 250 355 L 130 345 Q 85 338 70 300 L 60 250 Z',
    placement: { cx: 205, cy: 220, rx: 160, ry: 132, offset: -Math.PI / 2 },
    sectors: [
      { x: 340, y: 145, label: 'S1', color: '#39FF14', tx: 350, ty: 140 },
      { x: 340, y: 295, label: 'S2', color: '#BF5FFF', tx: 350, ty: 290 },
      { x: 120, y: 336, label: 'S3', color: '#FF6B00', tx: 80, ty: 332 }
    ]
  },
  default: {
    name: 'Grand Prix Circuit',
    path: 'M 72 220 L 82 140 Q 92 88 145 78 L 280 68 Q 332 72 350 112 L 346 170 Q 340 203 309 215 L 250 226 L 322 252 Q 352 266 350 298 L 321 336 Q 295 360 250 355 L 128 345 Q 86 338 70 302 L 62 252 Z',
    placement: { cx: 205, cy: 220, rx: 160, ry: 130, offset: -Math.PI / 2 },
    sectors: [
      { x: 338, y: 142, label: 'S1', color: '#39FF14', tx: 348, ty: 137 },
      { x: 338, y: 290, label: 'S2', color: '#BF5FFF', tx: 348, ty: 285 },
      { x: 116, y: 334, label: 'S3', color: '#FF6B00', tx: 76, ty: 329 }
    ]
  }
};

const normalizeCircuit = (sessionMeta) => {
  const value = (sessionMeta?.circuit_short_name || sessionMeta?.country_name || '').toLowerCase();
  if (value.includes('melbourne') || value.includes('australia')) return 'melbourne';
  if (value.includes('monza') || value.includes('italy')) return 'monza';
  if (value.includes('silverstone') || value.includes('britain')) return 'silverstone';
  return 'default';
};

const getTeamColor = (driverNumber) => DRIVER_TEAM_COLORS[String(driverNumber)] || '#9b9b9b';

const TrackMapPanel = ({ drivers = [], sessionMeta }) => {
  const [locationData, setLocationData] = useState([]);
  const trackKey = normalizeCircuit(sessionMeta);
  const track = TRACK_LIBRARY[trackKey] || TRACK_LIBRARY.default;
  const sessionKey = useMemo(() => (drivers[0]?.session_key ? String(drivers[0].session_key) : null), [drivers]);

  useEffect(() => {
    if (!sessionKey) {
      return undefined;
    }

    const fetchLocations = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/timing/location/${sessionKey}`);
        if (!res.ok) {
          return;
        }
        const rows = await res.json();
        if (Array.isArray(rows)) {
          // Limit payload for rendering performance.
          setLocationData(rows.slice(-3000));
        }
      } catch (error) {
        console.error('Failed to fetch location data:', error);
      }
    };

    fetchLocations();
    const interval = setInterval(fetchLocations, 8000);
    return () => clearInterval(interval);
  }, [sessionKey]);

  const locationByDriver = useMemo(() => {
    const latest = {};
    locationData.forEach((row) => {
      const key = String(row.driver_number);
      if (!latest[key] || new Date(row.date) > new Date(latest[key].date)) {
        latest[key] = row;
      }
    });
    return latest;
  }, [locationData]);

  const bounds = useMemo(() => {
    if (!locationData.length) {
      return null;
    }
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    locationData.forEach((row) => {
      if (typeof row.x !== 'number' || typeof row.y !== 'number') {
        return;
      }
      minX = Math.min(minX, row.x);
      maxX = Math.max(maxX, row.x);
      minY = Math.min(minY, row.y);
      maxY = Math.max(maxY, row.y);
    });
    if (!Number.isFinite(minX) || !Number.isFinite(maxX) || !Number.isFinite(minY) || !Number.isFinite(maxY)) {
      return null;
    }
    return { minX, maxX, minY, maxY };
  }, [locationData]);

  const normalizePoint = (x, y) => {
    if (!bounds) {
      return null;
    }
    const width = Math.max(1, bounds.maxX - bounds.minX);
    const height = Math.max(1, bounds.maxY - bounds.minY);
    const nx = 40 + ((x - bounds.minX) / width) * 320;
    const ny = 40 + ((y - bounds.minY) / height) * 320;
    return { x: nx, y: ny };
  };

  const plottedDrivers = useMemo(() => {
    if (locationData.length > 0 && bounds) {
      return drivers.slice(0, 20).map((driver) => {
        const latest = locationByDriver[String(driver.driver_number)];
        if (latest && typeof latest.x === 'number' && typeof latest.y === 'number') {
          const point = normalizePoint(latest.x, latest.y);
          if (point) {
            return { ...driver, x: point.x, y: point.y };
          }
        }
        return { ...driver, x: null, y: null };
      });
    }

    const placement = track.placement;
    return drivers.slice(0, 20).map((driver, i) => {
      const angle = (i / 20) * 2 * Math.PI + placement.offset;
      const x = placement.cx + placement.rx * Math.cos(angle);
      const y = placement.cy + placement.ry * Math.sin(angle);
      return { ...driver, x, y };
    });
  }, [bounds, drivers, locationByDriver, locationData.length, track]);

  const realTrackPath = useMemo(() => {
    if (!locationData.length || !bounds || !drivers.length) {
      return null;
    }
    const leaderNumber = String(drivers[0].driver_number);
    const leaderPoints = locationData
      .filter((row) => String(row.driver_number) === leaderNumber && typeof row.x === 'number' && typeof row.y === 'number')
      .slice(-800)
      .filter((_, idx) => idx % 8 === 0)
      .map((row) => normalizePoint(row.x, row.y))
      .filter(Boolean);

    if (leaderPoints.length < 12) {
      return null;
    }

    return `M ${leaderPoints.map((p) => `${p.x} ${p.y}`).join(' L ')}`;
  }, [bounds, drivers, locationData]);

  return (
    <div
      style={{
        position: 'relative',
        background: 'radial-gradient(circle at 50% 40%, #151922 0%, #0d0d0d 65%)',
        height: '100%',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        borderLeft: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '14px',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center'
        }}
      >
        <div style={{ color: 'rgba(255,255,255,0.95)', fontFamily: 'JetBrains Mono', fontSize: '13px', letterSpacing: '0.08em' }}>
          {track.name.toUpperCase()}
        </div>
        <div style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'JetBrains Mono', fontSize: '11px', marginTop: '4px' }}>
          {sessionMeta?.session_name || 'LIVE SESSION'}
        </div>
      </div>

      <svg viewBox="0 0 400 400" style={{ width: '100%', height: '100%', maxHeight: '560px' }}>
        <path
          d={realTrackPath || track.path}
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="20"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={realTrackPath || track.path}
          fill="none"
          stroke="rgba(255,255,255,0.45)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {track.sectors.map((sector) => (
          <g key={sector.label}>
            <circle cx={sector.x} cy={sector.y} r="4" fill={sector.color} opacity="0.85" />
            <text x={sector.tx} y={sector.ty} fill={sector.color} fontSize="9" fontFamily="JetBrains Mono">{sector.label}</text>
          </g>
        ))}

        {plottedDrivers.filter((driver) => Number.isFinite(driver.x) && Number.isFinite(driver.y)).map((driver) => (
          <g key={driver.driver_number}>
            <circle
              cx={driver.x}
              cy={driver.y}
              r={driver.position === 1 ? 7 : 5}
              fill={driver.position === 1 ? '#39FF14' : getTeamColor(driver.driver_number)}
              stroke={driver.position === 1 ? '#39FF14' : 'transparent'}
              strokeWidth="2"
              opacity="0.92"
              style={{ filter: driver.position === 1 ? 'drop-shadow(0 0 5px #39FF14)' : 'none' }}
            />
            <text
              x={driver.x}
              y={driver.y - 9}
              textAnchor="middle"
              fill="white"
              fontSize="7"
              fontFamily="JetBrains Mono"
              fontWeight="bold"
            >
              {driver.driver_number}
            </text>
          </g>
        ))}
      </svg>

      <div
        style={{
          position: 'absolute',
          bottom: '14px',
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'rgba(255,255,255,0.72)',
          fontSize: '12px',
          fontFamily: 'Titillium Web',
          letterSpacing: '0.03em'
        }}
      >
        {sessionMeta?.country_name || 'Race Weekend'} - Track map synced to latest session
      </div>
    </div>
  );
};

export default TrackMapPanel;
