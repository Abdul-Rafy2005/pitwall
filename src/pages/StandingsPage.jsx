import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { apiUrl } from '../config/api';
import driverRoster2026 from '../config/driverRoster2026';
import teamColors from '../config/teamColors';

const PLACE_COLORS = {
  1: '#FFD700',
  2: '#C0C0C0',
  3: '#CD7F32'
};

const pageVariants = {
  enter: (direction) => ({ x: direction > 0 ? 50 : -50, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction) => ({ x: direction > 0 ? -50 : 50, opacity: 0 })
};

const normalizeTeamKey = (teamKey) => {
  const map = {
    aston: 'astonmartin',
    racing_bulls: 'visa_rb'
  };
  return map[teamKey] || teamKey;
};

const getFlagFromNationality = (nationality = '') => {
  const parts = nationality.trim().split(' ');
  return parts.length > 0 ? parts[parts.length - 1] : '';
};

const getInitials = (fullName) => {
  if (!fullName) return '--';
  const parts = fullName.split(' ').filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0]).join('').toUpperCase();
};

const normalizeName = (value = '') => value.toLowerCase().replace(/[^a-z]/g, '');

const renderDriverPhoto = (driver, size, radius = '50%', fit = 'cover') => {
  if (driver.headshotUrl) {
    return (
      <img
        src={driver.headshotUrl}
        alt={driver.fullName}
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          objectFit: fit,
          objectPosition: 'center top',
          filter: 'none'
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.05))',
        border: `1px solid ${driver.teamColor}55`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontFamily: 'JetBrains Mono',
        fontWeight: 700,
        letterSpacing: '0.06em'
      }}
    >
      {getInitials(driver.fullName)}
    </div>
  );
};

const PodiumCard = ({ driver, rank }) => {
  const rankTheme = {
    1: {
      border: '1px solid rgba(255,215,0,0.3)',
      shadow: '0 0 40px rgba(255,215,0,0.1)',
      accent: '#FFD700',
      height: 420,
      icon: '1'
    },
    2: {
      border: '1px solid rgba(192,192,192,0.3)',
      shadow: '0 0 30px rgba(192,192,192,0.1)',
      accent: '#C0C0C0',
      height: 360,
      icon: '2'
    },
    3: {
      border: '1px solid rgba(205,127,50,0.3)',
      shadow: '0 0 28px rgba(205,127,50,0.1)',
      accent: '#CD7F32',
      height: 340,
      icon: '3'
    }
  }[rank];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      style={{
        background: `linear-gradient(to bottom, ${driver.teamColor}30 0%, #111111 60%)`,
        border: rankTheme.border,
        boxShadow: rankTheme.shadow,
        borderRadius: '16px',
        overflow: 'hidden',
        position: 'relative',
        height: `${rankTheme.height}px`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: rank === 1 ? '20px 20px 0' : '16px 16px 0'
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 10,
          right: 12,
          color: `${rankTheme.accent}22`,
          fontSize: rank === 1 ? '170px' : '140px',
          lineHeight: 0.9,
          fontWeight: 900,
          fontFamily: 'Titillium Web',
          userSelect: 'none'
        }}
      >
        #{driver.number}
      </div>

      <div style={{ position: 'relative', zIndex: 2 }}>
        <div
          style={{
            color: rankTheme.accent,
            fontFamily: 'JetBrains Mono',
            fontWeight: 900,
            fontSize: rank === 1 ? '34px' : '28px',
            textAlign: 'center',
            marginBottom: '8px'
          }}
        >
          {rank === 1 ? '🏆' : rankTheme.icon}
        </div>

        <div
          style={{
            height: rank === 1 ? '190px' : '160px',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            marginBottom: '10px'
          }}
        >
          {renderDriverPhoto(driver, rank === 1 ? '190px' : '150px', '14px', 'contain')}
        </div>

        <h3
          style={{
            margin: 0,
            textAlign: 'center',
            color: 'white',
            fontFamily: 'Titillium Web',
            fontWeight: 900,
            fontSize: rank === 1 ? '32px' : '24px',
            lineHeight: 1,
            textTransform: 'uppercase'
          }}
        >
          {driver.fullName}
        </h3>
        <p
          style={{
            margin: '6px 0 0',
            textAlign: 'center',
            color: driver.teamColor,
            fontWeight: 700,
            letterSpacing: '0.04em',
            fontSize: rank === 1 ? '13px' : '12px',
            textTransform: 'uppercase'
          }}
        >
          {driver.teamName}
        </p>
      </div>

      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', paddingBottom: '16px' }}>
        <div
          style={{
            color: 'white',
            fontFamily: 'Titillium Web',
            fontWeight: 900,
            fontSize: rank === 1 ? '48px' : '40px',
            lineHeight: 1
          }}
        >
          {driver.points}
        </div>
        <div
          style={{
            color: 'rgba(255,255,255,0.45)',
            letterSpacing: '0.14em',
            fontSize: '10px',
            fontFamily: 'JetBrains Mono'
          }}
        >
          POINTS
        </div>
      </div>

      <div
        style={{
          height: '4px',
          background: rankTheme.accent,
          boxShadow: `0 0 16px ${rankTheme.accent}66`
        }}
      />
    </motion.div>
  );
};

const StandingsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('drivers');
  const [tabDirection, setTabDirection] = useState(1);
  const [openF1DriverMap, setOpenF1DriverMap] = useState({});
  const [apiDriverStandings, setApiDriverStandings] = useState([]);
  const [apiConstructorStandings, setApiConstructorStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadStandingsSources = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch OpenF1 headshots, backend standings, and driver roster data in parallel
        const [latestResultsResponse, driverStandingsResponse, constructorStandingsResponse] = await Promise.all([
          fetch(apiUrl('/api/timing/results/latest')),
          fetch(apiUrl('/api/standings/drivers')),
          fetch(apiUrl('/api/standings/constructors'))
        ]);

        if (!latestResultsResponse.ok) {
          throw new Error(`OpenF1 results API error: ${latestResultsResponse.status}`);
        }

        if (!driverStandingsResponse.ok) {
          throw new Error(`Driver standings API error: ${driverStandingsResponse.status}`);
        }

        if (!constructorStandingsResponse.ok) {
          throw new Error(`Constructor standings API error: ${constructorStandingsResponse.status}`);
        }

        const latestResults = await latestResultsResponse.json();
        const driverStandingsData = await driverStandingsResponse.json();
        const constructorStandingsData = await constructorStandingsResponse.json();

        // Extract standings from API response
        const drivers = Array.isArray(driverStandingsData?.drivers) ? driverStandingsData.drivers : [];
        const constructors = Array.isArray(constructorStandingsData?.constructors) ? constructorStandingsData.constructors : [];

        if (isMounted) {
          setApiDriverStandings(drivers);
          setApiConstructorStandings(constructors);
        }

        // Process OpenF1 headshots and match with standing drivers
        const openF1Drivers = Array.isArray(latestResults?.drivers) ? latestResults.drivers : [];
        const driverMap = {};
        const driverNameMap = {};

        openF1Drivers.forEach((driver) => {
          if (driver?.driver_number !== undefined && driver?.driver_number !== null) {
            driverMap[String(driver.driver_number)] = driver;
          }
          const normalizedLastName = normalizeName((driver?.full_name || '').split(' ').slice(-1)[0] || '');
          if (normalizedLastName) {
            driverNameMap[normalizedLastName] = driver;
          }
        });

        driverRoster2026.forEach((rosterDriver) => {
          const key = String(rosterDriver.number);
          const byNumber = driverMap[key] || null;
          const rosterLastName = normalizeName(rosterDriver.lastName);
          const byNumberLastName = normalizeName((byNumber?.full_name || '').split(' ').slice(-1)[0] || '');
          const resolvedDriver = byNumber && byNumberLastName === rosterLastName
            ? byNumber
            : (driverNameMap[rosterLastName] || null);

          if (resolvedDriver) {
            driverMap[key] = resolvedDriver;
          }

          console.log(
            '[Standings headshot match]',
            key,
            rosterDriver.lastName,
            resolvedDriver?.full_name || 'NO_DRIVER_MATCH',
            resolvedDriver?.headshot_url || 'NO_HEADSHOT'
          );
        });

        if (isMounted) {
          setOpenF1DriverMap(driverMap);
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to load standings sources:', error);
        if (isMounted) {
          setError(error.message);
          setLoading(false);
        }
      }
    };

    loadStandingsSources();

    return () => {
      isMounted = false;
    };
  }, []);

  const driversStandings = useMemo(() => {
    // Create a map of standings by driver number from API data
    const standingsMap = {};
      const standingsNameMap = {};
    apiDriverStandings.forEach((standing) => {
      standingsMap[standing.driverNumber] = standing;
        const lastName = normalizeName(standing.familyName || '');
        if (lastName) {
          standingsNameMap[lastName] = standing;
        }
    });

    return driverRoster2026
      .map((rosterDriver) => {
        const teamKey = normalizeTeamKey(rosterDriver.team);
        const colorConfig = teamColors[teamKey];
        const openF1Driver = openF1DriverMap[String(rosterDriver.number)];
        // Match by number first, then fall back to last name
        let apiStanding = standingsMap[rosterDriver.number];
        if (!apiStanding) {
          const rosterLastName = normalizeName(rosterDriver.lastName);
          apiStanding = standingsNameMap[rosterLastName] || {};
        }
        const fullName = `${rosterDriver.firstName} ${rosterDriver.lastName}`;

        return {
          number: rosterDriver.number,
          fullName,
          firstName: rosterDriver.firstName,
          lastName: rosterDriver.lastName,
          flag: getFlagFromNationality(rosterDriver.nationality),
          teamKey,
          teamName: colorConfig?.name || rosterDriver.team,
          teamColor: colorConfig?.primary || '#A0A0A0',
          points: apiStanding.points || 0,
          position: apiStanding.position || 0,
          headshotUrl: openF1Driver?.headshot_url || null
        };
      })
      .sort((a, b) => {
        // If we have API standing positions, use them; otherwise sort by points descending
        if (a.position > 0 && b.position > 0) {
          return a.position - b.position;
        }
        return b.points - a.points;
      })
      .map((driver, index) => ({
        ...driver,
        position: driver.position || (index + 1)
      }));
  }, [openF1DriverMap, apiDriverStandings]);

  const leaderboardPoints = driversStandings[0]?.points || 0;
  const leader = driversStandings[0] || null;
  const podiumDrivers = driversStandings.slice(0, 3);
  const tableDrivers = driversStandings.slice(3);

  const constructors = useMemo(() => {
    return apiConstructorStandings.map((constructorData) => {
      // Find the constructor in teamColors to get display info
      let constructor = null;
      let teamKey = null;
      let shortName = constructorData.constructorName;

      // Match constructor by ID or name with teamColors
      for (const [key, config] of Object.entries(teamColors)) {
        if (config.name && config.name.toLowerCase() === constructorData.constructorName.toLowerCase()) {
          constructor = config;
          teamKey = key;
          shortName = config.shortName || config.name;
          break;
        }
      }

      if (!constructor) {
        constructor = { primary: '#A0A0A0', name: constructorData.constructorName };
        teamKey = constructorData.constructorId || constructorData.constructorName.toLowerCase();
      }

      // Find drivers from this constructor in the driver standings
      const constructorDrivers = apiDriverStandings.filter(
        (driver) => driver.constructorId === constructorData.constructorId || driver.constructorName === constructorData.constructorName
      );

      const driversLabel = constructorDrivers
        .slice(0, 2)
        .map((driver) => driver.familyName || driver.driverId)
        .join(' + ') || 'TBD';

      return {
        position: constructorData.position,
        points: constructorData.points,
        wins: constructorData.wins || 0,
        constructorId: constructorData.constructorId,
        constructorName: constructorData.constructorName,
        teamKey,
        shortName,
        teamColor: constructor.primary || '#A0A0A0',
        driversLabel
      };
    });
  }, [apiConstructorStandings, apiDriverStandings]);

  const constructorLeaderPoints = constructors[0]?.points || 0;

  const onTabSwitch = (tab) => {
    if (tab === activeTab) return;
    setTabDirection(tab === 'constructors' ? 1 : -1);
    setActiveTab(tab);
  };

  if (loading) {
    return (
      <div style={{ background: '#0a0a0a', minHeight: '100vh', paddingTop: '120px', color: 'white', textAlign: 'center' }}>
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          <div
            style={{
              height: '60px',
              background: 'linear-gradient(90deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05), rgba(255,255,255,0.1))',
              backgroundSize: '200% 100%',
              animation: 'shimmer 2s infinite',
              borderRadius: '8px',
              marginBottom: '16px'
            }}
          />
          <div
            style={{
              height: '40px',
              background: 'linear-gradient(90deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05), rgba(255,255,255,0.1))',
              backgroundSize: '200% 100%',
              animation: 'shimmer 2s infinite',
              borderRadius: '8px'
            }}
          />
          <style>{`
            @keyframes shimmer {
              0% { background-position: 200% 0; }
              100% { background-position: -200% 0; }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: '#0a0a0a', minHeight: '100vh', paddingTop: '120px', color: 'white', textAlign: 'center' }}>
        <h2>Failed to load standings</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', paddingBottom: '80px', paddingTop: '72px' }}>
      <section
        style={{
          width: '100%',
          background: '#090909',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'linear-gradient(rgba(232,0,45,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(232,0,45,0.08) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
            maskImage: 'radial-gradient(circle at center, black 20%, transparent 85%)'
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 50% 0%, rgba(232,0,45,0.22), transparent 60%)'
          }}
        />

        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '80px 5%', position: 'relative', zIndex: 2 }}>
          <div
            style={{
              borderLeft: `4px solid ${leader.teamColor}`,
              background: `${leader.teamColor}14`,
              borderRadius: '10px',
              padding: '10px 16px',
              marginBottom: '34px',
              display: 'flex',
              gap: '16px',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}
          >
            <p
              style={{
                margin: 0,
                color: 'white',
                fontFamily: 'JetBrains Mono',
                fontSize: '12px',
                letterSpacing: '0.08em'
              }}
            >
              CHAMPIONSHIP LEADER: {leader.fullName.toUpperCase()} - {leader.points} PTS - {leader.teamName.toUpperCase()}
            </p>
            <p
              style={{
                margin: 0,
                color: 'rgba(255,255,255,0.55)',
                fontFamily: 'JetBrains Mono',
                fontSize: '11px',
                letterSpacing: '0.08em'
              }}
            >
              AFTER ROUND 1 OF 24 - AUSTRALIAN GP
            </p>
          </div>

          <p
            style={{
              margin: 0,
              color: '#E8002D',
              letterSpacing: '0.2em',
              fontSize: '13px',
              fontWeight: 700,
              textTransform: 'uppercase'
            }}
          >
            2026 Season
          </p>
          <h1
            style={{
              margin: '12px 0 30px',
              color: 'white',
              fontFamily: 'Titillium Web',
              fontWeight: 900,
              fontSize: 'clamp(34px, 8vw, 78px)',
              lineHeight: 0.95,
              textTransform: 'uppercase'
            }}
          >
            World Championship Standings
          </h1>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => onTabSwitch('drivers')}
              style={{
                border: activeTab === 'drivers' ? 'none' : '1px solid rgba(255,255,255,0.16)',
                background: activeTab === 'drivers' ? '#E8002D' : 'rgba(20,20,20,0.72)',
                color: activeTab === 'drivers' ? '#fff' : 'rgba(255,255,255,0.64)',
                borderRadius: '999px',
                padding: '14px 30px',
                fontFamily: 'Titillium Web',
                fontWeight: 800,
                fontSize: '14px',
                letterSpacing: '0.12em',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              DRIVERS
            </button>
            <button
              onClick={() => onTabSwitch('constructors')}
              style={{
                border: activeTab === 'constructors' ? 'none' : '1px solid rgba(255,255,255,0.16)',
                background: activeTab === 'constructors' ? '#E8002D' : 'rgba(20,20,20,0.72)',
                color: activeTab === 'constructors' ? '#fff' : 'rgba(255,255,255,0.64)',
                borderRadius: '999px',
                padding: '14px 30px',
                fontFamily: 'Titillium Web',
                fontWeight: 800,
                fontSize: '14px',
                letterSpacing: '0.12em',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              CONSTRUCTORS
            </button>
          </div>
        </div>
      </section>

      <section style={{ maxWidth: '1400px', margin: '0 auto', padding: '80px 5% 0' }}>
        <AnimatePresence custom={tabDirection} mode="wait">
          {activeTab === 'drivers' ? (
            <motion.div
              key="drivers"
              custom={tabDirection}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  alignItems: 'end',
                  gap: '20px'
                }}
              >
                {podiumDrivers[1] && (
                  <div style={{ order: 1 }}>
                    <PodiumCard driver={podiumDrivers[1]} rank={2} />
                  </div>
                )}
                {podiumDrivers[0] && (
                  <div style={{ order: 2 }}>
                    <PodiumCard driver={podiumDrivers[0]} rank={1} />
                  </div>
                )}
                {podiumDrivers[2] && (
                  <div style={{ order: 3 }}>
                    <PodiumCard driver={podiumDrivers[2]} rank={3} />
                  </div>
                )}
              </div>

              <div
                style={{
                  marginTop: '14px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '20px',
                  alignItems: 'end'
                }}
              >
                <div
                  style={{
                    height: '74px',
                    background: 'linear-gradient(180deg, #212121, #141414)',
                    borderRadius: '10px 10px 0 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#C0C0C0',
                    fontFamily: 'JetBrains Mono',
                    fontWeight: 800,
                    fontSize: '30px'
                  }}
                >
                  2
                </div>
                <div
                  style={{
                    height: '96px',
                    background: 'linear-gradient(180deg, #242424, #131313)',
                    borderRadius: '10px 10px 0 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFD700',
                    fontFamily: 'JetBrains Mono',
                    fontWeight: 900,
                    fontSize: '38px'
                  }}
                >
                  1
                </div>
                <div
                  style={{
                    height: '60px',
                    background: 'linear-gradient(180deg, #1f1f1f, #131313)',
                    borderRadius: '10px 10px 0 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#CD7F32',
                    fontFamily: 'JetBrains Mono',
                    fontWeight: 800,
                    fontSize: '26px'
                  }}
                >
                  3
                </div>
              </div>

              <div
                style={{
                  marginTop: '50px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '16px',
                  overflowX: 'auto',
                  overflowY: 'hidden',
                  background: 'rgba(14,14,14,0.7)'
                }}
              >
                <div style={{ minWidth: '1080px' }}>
                  {tableDrivers.map((driver, index) => {
                    const pointsPercent = leaderboardPoints > 0 ? (driver.points / leaderboardPoints) * 100 : 0;
                    const gap = leaderboardPoints - driver.points;
                    const rowBg = index % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'rgba(255,255,255,0.03)';
                    const rankColor = PLACE_COLORS[driver.position] || 'rgba(255,255,255,0.75)';

                    return (
                      <motion.div
                        key={driver.number}
                        initial={{ opacity: 0, x: -24 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.1 }}
                        transition={{ delay: index * 0.025, duration: 0.45, ease: 'easeOut' }}
                        onClick={() => navigate(`/driver/${driver.number}`)}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '64px 6px 48px 62px minmax(220px, 1fr) 70px minmax(150px, 1.4fr) 90px 80px',
                          alignItems: 'center',
                          gap: '14px',
                          padding: '14px 16px',
                          background: rowBg,
                          borderBottom: '1px solid rgba(255,255,255,0.04)',
                          cursor: 'pointer',
                          transition: 'box-shadow 0.25s ease, transform 0.2s ease'
                        }}
                        onMouseEnter={(event) => {
                          event.currentTarget.style.boxShadow = `inset 4px 0 0 ${driver.teamColor}, 0 0 20px ${driver.teamColor}22`;
                          event.currentTarget.style.transform = 'translateX(3px)';
                        }}
                        onMouseLeave={(event) => {
                          event.currentTarget.style.boxShadow = 'none';
                          event.currentTarget.style.transform = 'translateX(0)';
                        }}
                      >
                        <div
                          style={{
                            color: rankColor,
                            fontSize: '24px',
                            fontWeight: 900,
                            fontFamily: 'Titillium Web',
                            textAlign: 'center'
                          }}
                        >
                          P{driver.position}
                        </div>

                        <div style={{ height: '32px', background: driver.teamColor, borderRadius: '4px' }} />

                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                          {renderDriverPhoto(driver, '36px')}
                        </div>

                        <div
                          style={{
                            color: 'rgba(255,255,255,0.85)',
                            fontFamily: 'JetBrains Mono',
                            fontWeight: 700,
                            textAlign: 'center',
                            fontSize: '15px'
                          }}
                        >
                          {driver.number}
                        </div>

                        <div>
                          <p
                            style={{
                              margin: 0,
                              color: 'white',
                              fontSize: '18px',
                              fontWeight: 800,
                              fontFamily: 'Titillium Web',
                              lineHeight: 1.1
                            }}
                          >
                            {driver.fullName}
                          </p>
                          <p
                            style={{
                              margin: '2px 0 0',
                              color: driver.teamColor,
                              fontSize: '12px',
                              fontWeight: 700,
                              letterSpacing: '0.06em'
                            }}
                          >
                            {driver.teamName.toUpperCase()}
                          </p>
                        </div>

                        <div style={{ fontSize: '24px', textAlign: 'center' }}>{driver.flag}</div>

                        <div
                          style={{
                            height: '14px',
                            borderRadius: '999px',
                            background: 'rgba(255,255,255,0.08)',
                            overflow: 'hidden',
                            position: 'relative'
                          }}
                        >
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${pointsPercent}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            style={{
                              height: '100%',
                              background: `linear-gradient(90deg, ${driver.teamColor}, ${driver.teamColor}CC)`,
                              boxShadow: `0 0 14px ${driver.teamColor}AA`
                            }}
                          />
                        </div>

                        <div
                          style={{
                            color: 'white',
                            textAlign: 'right',
                            fontFamily: 'JetBrains Mono',
                            fontWeight: 800,
                            fontSize: '24px'
                          }}
                        >
                          {driver.points}
                        </div>

                        <div
                          style={{
                            color: 'rgba(255,255,255,0.52)',
                            textAlign: 'right',
                            fontFamily: 'JetBrains Mono',
                            fontSize: '12px',
                            letterSpacing: '0.05em'
                          }}
                        >
                          +{gap}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="constructors"
              custom={tabDirection}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            >
              <div style={{ overflowX: 'auto' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: '760px' }}>
                  {constructors.map((constructor) => {
                    const percent = constructorLeaderPoints > 0
                      ? (constructor.points / constructorLeaderPoints) * 100
                      : 0;

                    return (
                      <motion.div
                        key={constructor.teamKey}
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.35, ease: 'easeOut' }}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '80px minmax(240px, 1fr) minmax(220px, 1.4fr) 100px',
                          alignItems: 'center',
                          gap: '16px',
                          padding: '18px 20px',
                          borderRadius: '14px',
                          border: '1px solid rgba(255,255,255,0.09)',
                          background: 'linear-gradient(100deg, rgba(20,20,20,0.92), rgba(10,10,10,0.92))'
                        }}
                      >
                        <div
                          style={{
                            color: 'rgba(255,255,255,0.35)',
                            fontFamily: 'Titillium Web',
                            fontWeight: 900,
                            fontSize: '38px',
                            textAlign: 'center'
                          }}
                        >
                          {constructor.position}
                        </div>

                        <div>
                          <p
                            style={{
                              margin: 0,
                              color: constructor.teamColor,
                              fontFamily: 'Titillium Web',
                              fontWeight: 900,
                              fontSize: '30px',
                              lineHeight: 1,
                              textTransform: 'uppercase'
                            }}
                          >
                            {constructor.shortName}
                          </p>
                          <p
                            style={{
                              margin: '8px 0 0',
                              color: 'rgba(255,255,255,0.46)',
                              fontFamily: 'JetBrains Mono',
                              fontSize: '12px',
                              letterSpacing: '0.04em'
                            }}
                          >
                            {constructor.driversLabel}
                          </p>
                        </div>

                        <div
                          style={{
                            height: '18px',
                            background: 'rgba(255,255,255,0.08)',
                            borderRadius: '999px',
                            overflow: 'hidden'
                          }}
                        >
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${percent}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            style={{
                              height: '100%',
                              background: `linear-gradient(90deg, ${constructor.teamColor}, ${constructor.teamColor}BB)`,
                              boxShadow: `10px 0 20px ${constructor.teamColor}`
                            }}
                          />
                        </div>

                        <div
                          style={{
                            textAlign: 'right',
                            color: 'white',
                            fontFamily: 'JetBrains Mono',
                            fontWeight: 800,
                            fontSize: '34px'
                          }}
                        >
                          {constructor.points}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
};

export default StandingsPage;
