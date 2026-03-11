import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { apiUrl } from '../config/api';

const SchedulePage = () => {
  const [filter, setFilter] = useState('ALL');
  const nextRaceRef = useRef(null);
  const navigate = useNavigate();
  const [raceResults, setRaceResults] = useState(null);
  const [loadingResults, setLoadingResults] = useState(true);

  // Calculate race status dynamically based on current time
  const getRaceStatus = (raceUTC) => {
    const now = new Date();
    const raceTime = new Date(raceUTC);
    // Add 2 hours to race start time to account for race duration
    const raceEndTime = new Date(raceTime.getTime() + (2 * 60 * 60 * 1000));
    
    if (now >= raceEndTime) {
      return 'completed';
    }
    return 'upcoming';
  };

  // Check if a session has passed
  const isSessionPast = (sessionUTC) => {
    const now = new Date();
    const sessionTime = new Date(sessionUTC);
    // Add 2 hours buffer for session duration
    const sessionEndTime = new Date(sessionTime.getTime() + (2 * 60 * 60 * 1000));
    return now >= sessionEndTime;
  };

  // Check if race is truly next (hasn't started yet)
  const isRaceNext = (raceUTC) => {
    const now = new Date();
    const raceTime = new Date(raceUTC);
    return now < raceTime;
  };

  // Complete 2026 season calendar
  const races = [
    {
      round: 1,
      country: 'Australia',
      flag: '🇦🇺',
      raceName: 'Australian Grand Prix',
      circuit: 'Albert Park Circuit',
      city: 'Melbourne',
      qualifyingUTC: '2026-03-07T06:00:00Z',
      raceUTC: '2026-03-08T05:00:00Z',
      sprint: false,
      circuitLength: '5.278 km',
      lapRecord: '1:20.235',
      topThree: [
        { position: 1, driver: 'Russell', team: 'Mercedes', color: '#27F4D2' },
        { position: 2, driver: 'Antonelli', team: 'Mercedes', color: '#27F4D2' },
        { position: 3, driver: 'Hadjar', team: 'Red Bull', color: '#3671C6' }
      ]
    },
    {
      round: 2,
      country: 'China',
      flag: '🇨🇳',
      raceName: 'Chinese Grand Prix',
      circuit: 'Shanghai International Circuit',
      city: 'Shanghai',
      qualifyingUTC: '2026-03-22T09:00:00Z',
      raceUTC: '2026-03-23T09:00:00Z',
      sprint: true,
      circuitLength: '5.451 km'
    },
    {
      round: 3,
      country: 'Japan',
      flag: '🇯🇵',
      raceName: 'Japanese Grand Prix',
      circuit: 'Suzuka Circuit',
      city: 'Suzuka',
      qualifyingUTC: '2026-04-04T07:00:00Z',
      raceUTC: '2026-04-05T06:00:00Z',
      sprint: false,
      circuitLength: '5.807 km'
    },
    {
      round: 4,
      country: 'Bahrain',
      flag: '🇧🇭',
      raceName: 'Bahrain Grand Prix',
      circuit: 'Bahrain International Circuit',
      city: 'Sakhir',
      qualifyingUTC: '2026-04-11T15:00:00Z',
      raceUTC: '2026-04-12T15:00:00Z',
      sprint: false,
      circuitLength: '5.412 km'
    },
    {
      round: 5,
      country: 'Saudi Arabia',
      flag: '🇸🇦',
      raceName: 'Saudi Arabian Grand Prix',
      circuit: 'Jeddah Corniche Circuit',
      city: 'Jeddah',
      qualifyingUTC: '2026-04-18T17:00:00Z',
      raceUTC: '2026-04-19T17:00:00Z',
      sprint: false,
      circuitLength: '6.174 km'
    },
    {
      round: 6,
      country: 'USA',
      flag: '🇺🇸',
      raceName: 'Miami Grand Prix',
      circuit: 'Miami International Autodrome',
      city: 'Miami',
      qualifyingUTC: '2026-05-02T23:30:00Z',
      raceUTC: '2026-05-03T19:00:00Z',
      sprint: true,
      circuitLength: '5.412 km'
    },
    {
      round: 7,
      country: 'Canada',
      flag: '🇨🇦',
      raceName: 'Canadian Grand Prix',
      circuit: 'Circuit Gilles Villeneuve',
      city: 'Montreal',
      qualifyingUTC: '2026-05-23T20:00:00Z',
      raceUTC: '2026-05-24T18:00:00Z',
      sprint: true,
      circuitLength: '4.361 km'
    },
    {
      round: 8,
      country: 'Monaco',
      flag: '🇲🇨',
      raceName: 'Monaco Grand Prix',
      circuit: 'Circuit de Monaco',
      city: 'Monte Carlo',
      qualifyingUTC: '2026-06-06T14:00:00Z',
      raceUTC: '2026-06-07T13:00:00Z',
      sprint: false,
      circuitLength: '3.337 km'
    },
    {
      round: 9,
      country: 'Spain',
      flag: '🇪🇸',
      raceName: 'Spanish Grand Prix',
      circuit: 'Circuit de Barcelona-Catalunya',
      city: 'Barcelona',
      qualifyingUTC: '2026-06-13T14:00:00Z',
      raceUTC: '2026-06-14T13:00:00Z',
      sprint: false,
      circuitLength: '4.675 km'
    },
    {
      round: 10,
      country: 'Austria',
      flag: '🇦🇹',
      raceName: 'Austrian Grand Prix',
      circuit: 'Red Bull Ring',
      city: 'Spielberg',
      qualifyingUTC: '2026-06-27T14:00:00Z',
      raceUTC: '2026-06-28T13:00:00Z',
      sprint: false,
      circuitLength: '4.318 km'
    },
    {
      round: 11,
      country: 'Great Britain',
      flag: '🇬🇧',
      raceName: 'British Grand Prix',
      circuit: 'Silverstone Circuit',
      city: 'Silverstone',
      qualifyingUTC: '2026-07-04T14:00:00Z',
      raceUTC: '2026-07-05T14:00:00Z',
      sprint: true,
      circuitLength: '5.891 km'
    },
    {
      round: 12,
      country: 'Belgium',
      flag: '🇧🇪',
      raceName: 'Belgian Grand Prix',
      circuit: 'Circuit de Spa-Francorchamps',
      city: 'Spa',
      qualifyingUTC: '2026-07-18T14:00:00Z',
      raceUTC: '2026-07-19T13:00:00Z',
      sprint: false,
      circuitLength: '7.004 km'
    },
    {
      round: 13,
      country: 'Hungary',
      flag: '🇭🇺',
      raceName: 'Hungarian Grand Prix',
      circuit: 'Hungaroring',
      city: 'Budapest',
      qualifyingUTC: '2026-07-25T14:00:00Z',
      raceUTC: '2026-07-26T13:00:00Z',
      sprint: false,
      circuitLength: '4.381 km'
    },
    {
      round: 14,
      country: 'Netherlands',
      flag: '🇳🇱',
      raceName: 'Dutch Grand Prix',
      circuit: 'Circuit Zandvoort',
      city: 'Zandvoort',
      qualifyingUTC: '2026-08-22T14:00:00Z',
      raceUTC: '2026-08-23T13:00:00Z',
      sprint: true,
      circuitLength: '4.259 km'
    },
    {
      round: 15,
      country: 'Italy',
      flag: '🇮🇹',
      raceName: 'Italian Grand Prix',
      circuit: 'Autodromo Nazionale Monza',
      city: 'Monza',
      qualifyingUTC: '2026-09-05T14:00:00Z',
      raceUTC: '2026-09-06T13:00:00Z',
      sprint: false,
      circuitLength: '5.793 km'
    },
    {
      round: 16,
      country: 'Spain',
      flag: '🇪🇸',
      raceName: 'Madrid Grand Prix',
      circuit: 'Circuito de Madrid',
      city: 'Madrid',
      qualifyingUTC: '2026-09-12T14:00:00Z',
      raceUTC: '2026-09-13T13:00:00Z',
      sprint: false,
      circuitLength: '5.470 km'
    },
    {
      round: 17,
      country: 'Azerbaijan',
      flag: '🇦🇿',
      raceName: 'Azerbaijan Grand Prix',
      circuit: 'Baku City Circuit',
      city: 'Baku',
      qualifyingUTC: '2026-09-25T11:00:00Z',
      raceUTC: '2026-09-26T11:00:00Z',
      sprint: false,
      circuitLength: '6.003 km'
    },
    {
      round: 18,
      country: 'Singapore',
      flag: '🇸🇬',
      raceName: 'Singapore Grand Prix',
      circuit: 'Marina Bay Street Circuit',
      city: 'Singapore',
      qualifyingUTC: '2026-10-10T13:00:00Z',
      raceUTC: '2026-10-11T12:00:00Z',
      sprint: true,
      circuitLength: '4.940 km'
    },
    {
      round: 19,
      country: 'USA',
      flag: '🇺🇸',
      raceName: 'United States Grand Prix',
      circuit: 'Circuit of the Americas',
      city: 'Austin',
      qualifyingUTC: '2026-10-24T22:00:00Z',
      raceUTC: '2026-10-25T19:00:00Z',
      sprint: false,
      circuitLength: '5.513 km'
    },
    {
      round: 20,
      country: 'Mexico',
      flag: '🇲🇽',
      raceName: 'Mexico City Grand Prix',
      circuit: 'Autodromo Hermanos Rodriguez',
      city: 'Mexico City',
      qualifyingUTC: '2026-10-31T22:00:00Z',
      raceUTC: '2026-11-01T20:00:00Z',
      sprint: false,
      circuitLength: '4.304 km'
    },
    {
      round: 21,
      country: 'Brazil',
      flag: '🇧🇷',
      raceName: 'São Paulo Grand Prix',
      circuit: 'Autodromo Jose Carlos Pace',
      city: 'São Paulo',
      qualifyingUTC: '2026-11-07T18:00:00Z',
      raceUTC: '2026-11-08T17:00:00Z',
      sprint: false,
      circuitLength: '4.309 km'
    },
    {
      round: 22,
      country: 'USA',
      flag: '🇺🇸',
      raceName: 'Las Vegas Grand Prix',
      circuit: 'Las Vegas Strip Circuit',
      city: 'Las Vegas',
      qualifyingUTC: '2026-11-21T06:00:00Z',
      raceUTC: '2026-11-22T06:00:00Z',
      sprint: false,
      circuitLength: '6.120 km'
    },
    {
      round: 23,
      country: 'Qatar',
      flag: '🇶🇦',
      raceName: 'Qatar Grand Prix',
      circuit: 'Lusail International Circuit',
      city: 'Lusail',
      qualifyingUTC: '2026-11-28T14:00:00Z',
      raceUTC: '2026-11-29T13:00:00Z',
      sprint: false,
      circuitLength: '5.380 km'
    },
    {
      round: 24,
      country: 'UAE',
      flag: '🇦🇪',
      raceName: 'Abu Dhabi Grand Prix',
      circuit: 'Yas Marina Circuit',
      city: 'Abu Dhabi',
      qualifyingUTC: '2026-12-05T13:00:00Z',
      raceUTC: '2026-12-06T13:00:00Z',
      sprint: false,
      circuitLength: '5.281 km'
    }
  ];

  // Convert UTC to PKT (UTC+5)
  const convertToPKT = (utcString) => {
    const date = new Date(utcString);
    date.setHours(date.getHours() + 5);
    return date;
  };

  // Format date for display
  const formatDateTime = (date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return { date: `${day} ${month}`, time: `${hours}:${minutes}` };
  };

  // Add status to each race dynamically
  const racesWithStatus = races.map(race => ({
    ...race,
    status: getRaceStatus(race.raceUTC)
  }));

  // Fetch latest race results from backend
  useEffect(() => {
    const fetchRaceResults = async () => {
      try {
        setLoadingResults(true);
        const response = await fetch(apiUrl('/api/timing/results/latest'));
        if (!response.ok) {
          throw new Error('Failed to fetch race results');
        }
        const data = await response.json();
        
        // Process the results - ONLY if it's a Race session
        if (data && data.session && data.positions && data.drivers) {
          const positions = data.positions;
          const drivers = data.drivers;
          const sessionData = data.session;
          
          // Only process if this is a Race session (not qualifying, practice, etc.)
          const isRaceSession = sessionData.session_name && 
            sessionData.session_name.toLowerCase().includes('race');
          
          if (!isRaceSession) {
            console.log('⚠️ Latest session is not a race, skipping:', sessionData.session_name);
            setLoadingResults(false);
            return;
          }
          
          console.log('✅ Fetched race results:', {
            sessionName: sessionData.session_name,
            country: sessionData.country_name,
            sessionKey: sessionData.session_key,
            totalPositions: positions.length,
            totalDrivers: drivers.length
          });
          
          // Filter positions to get only the final lap positions
          const driversMap = new Map();
          
          // Group positions by driver and get their last/highest position
          positions.forEach(pos => {
            if (!driversMap.has(pos.driver_number) || 
                new Date(pos.date) > new Date(driversMap.get(pos.driver_number).date)) {
              driversMap.set(pos.driver_number, pos);
            }
          });
          
          // Get final positions and sort them
          const finalPositions = Array.from(driversMap.values())
            .filter(pos => pos.position !== null && pos.position !== undefined)
            .sort((a, b) => a.position - b.position);
          
          const top3Positions = finalPositions.slice(0, 3);
          
          // Map to driver details
          const topThree = top3Positions.map(pos => {
            const driver = drivers.find(d => d.driver_number === pos.driver_number);
            if (!driver) return null;
            
            // Get team color (simplified mapping)
            const teamColors = {
              'Mercedes': '#27F4D2',
              'Red Bull Racing': '#3671C6',
              'Ferrari': '#E8002D',
              'McLaren': '#FF8000',
              'Aston Martin': '#229971',
              'Alpine': '#FF87BC',
              'Williams': '#64C4FF',
              'AlphaTauri': '#5E8FAA',
              'Alfa Romeo': '#C92D4B',
              'Haas F1 Team': '#B6BABD',
              'RB': '#6692FF',
              'Kick Sauber': '#52E252'
            };
            
            const teamColor = teamColors[driver.team_name] || '#FFFFFF';
            
            return {
              position: pos.position,
              driver: driver.name_acronym || driver.full_name?.split(' ').pop() || 'Unknown',
              team: driver.team_name,
              color: teamColor
            };
          }).filter(Boolean);
          
          console.log('🏆 Top 3 results:', topThree);
          
          setRaceResults({
            sessionKey: sessionData.session_key,
            countryName: sessionData.country_name,
            sessionName: sessionData.session_name,
            date: sessionData.date_start,
            topThree: topThree
          });
        }
      } catch (error) {
        console.error('Error fetching race results:', error);
      } finally {
        setLoadingResults(false);
      }
    };

    fetchRaceResults();
    // Refresh every 5 minutes
    const interval = setInterval(fetchRaceResults, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Filter races
  const filteredRaces = racesWithStatus.filter(race => {
    if (filter === 'COMPLETED') return race.status === 'completed';
    if (filter === 'UPCOMING') return race.status === 'upcoming';
    return true;
  });

  // Calculate season progress
  const completedRaces = racesWithStatus.filter(r => r.status === 'completed').length;
  const progressPercentage = Math.round((completedRaces / racesWithStatus.length) * 100);

  // Find next race (race that hasn't started yet)
  const nextRaceIndex = racesWithStatus.findIndex(r => isRaceNext(r.raceUTC));

  // Auto scroll to next race
  useEffect(() => {
    if (nextRaceRef.current && filter === 'ALL') {
      setTimeout(() => {
        nextRaceRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 500);
    }
  }, [filter]);

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', paddingTop: '80px', paddingBottom: '80px' }}>
      {/* Hero Header - Redesigned */}
      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto', 
        padding: '80px 5% 50px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background grid effect */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '400px',
          background: 'radial-gradient(circle at 50% 0%, rgba(232, 0, 45, 0.2), transparent 70%)',
          opacity: 0.8,
          pointerEvents: 'none'
        }} />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          style={{ position: 'relative', zIndex: 1 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            {/* F1 Chevron */}
            <div style={{ display: 'flex', gap: '4px' }}>
              <div style={{ width: '3px', height: '32px', background: '#E8002D', transform: 'skewX(-20deg)' }} />
              <div style={{ width: '3px', height: '32px', background: '#E8002D', transform: 'skewX(-20deg)' }} />
            </div>
            <p style={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.15em',
              fontFamily: 'Titillium Web'
            }}>
              2026 SEASON CALENDAR
            </p>
          </div>

          <h1 style={{
            fontFamily: 'Titillium Web',
            fontWeight: 900,
            lineHeight: 0.95,
            marginBottom: '32px',
            letterSpacing: '-0.03em'
          }}>
            <div style={{ color: '#E8002D', fontSize: '72px', marginBottom: '8px' }}>
              FORMULA 1
            </div>
            <div style={{ color: 'white', fontSize: '56px' }}>
              WORLD CHAMPIONSHIP
            </div>
          </h1>

          {/* Animated underline */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '200px' }}
            transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
            style={{
              height: '4px',
              background: 'linear-gradient(90deg, #E8002D, transparent)',
              marginBottom: '40px'
            }}
          />

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{
              background: 'rgba(26, 26, 26, 0.6)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(232, 0, 45, 0.2)',
              borderRadius: '12px',
              padding: '20px 32px'
            }}>
              <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '11px', marginBottom: '6px', letterSpacing: '0.12em', fontFamily: 'JetBrains Mono' }}>
                TOTAL ROUNDS
              </p>
              <p style={{ color: 'white', fontSize: '36px', fontWeight: 900, fontFamily: 'Titillium Web' }}>
                24
              </p>
            </div>

            <div style={{
              background: 'rgba(26, 26, 26, 0.6)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 107, 0, 0.2)',
              borderRadius: '12px',
              padding: '20px 32px'
            }}>
              <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '11px', marginBottom: '6px', letterSpacing: '0.12em', fontFamily: 'JetBrains Mono' }}>
                SPRINT WEEKENDS
              </p>
              <p style={{ color: '#FF6B00', fontSize: '36px', fontWeight: 900, fontFamily: 'Titillium Web' }}>
                6
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Season Progress Bar */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 5%', marginBottom: '48px' }}>
        <div style={{ textAlign: 'center', marginBottom: '12px' }}>
          <p style={{
            color: '#E8002D',
            fontSize: '13px',
            fontWeight: 700,
            letterSpacing: '0.1em',
            fontFamily: 'JetBrains Mono'
          }}>
            {progressPercentage}% COMPLETE • SEASON IN PROGRESS
          </p>
        </div>

        <div style={{ position: 'relative' }}>
          <div style={{
            height: '8px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '4px',
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #E8002D, #FF4D6A)',
                borderRadius: '4px'
              }}
            />
          </div>

          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginTop: '10px',
            fontFamily: 'JetBrains Mono',
            fontSize: '10px',
            color: 'rgba(255, 255, 255, 0.4)',
            letterSpacing: '0.08em'
          }}>
            <span>ROUND 1</span>
            <span>ROUND 24</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 5%', marginBottom: '40px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          {['ALL RACES', 'UPCOMING', 'COMPLETED'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab.split(' ')[0])}
              style={{
                background: filter === tab.split(' ')[0] ? '#E8002D' : 'rgba(255, 255, 255, 0.03)',
                color: filter === tab.split(' ')[0] ? 'white' : 'rgba(255, 255, 255, 0.5)',
                border: filter === tab.split(' ')[0] ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                padding: '14px 28px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                fontFamily: 'Titillium Web',
                cursor: 'pointer',
                transition: 'all 0.3s',
                boxShadow: filter === tab.split(' ')[0] ? '0 4px 16px rgba(232, 0, 45, 0.3)' : 'none'
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Race Cards - Premium Redesign */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 5%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredRaces.map((race, index) => {
            const isNext = race.round === racesWithStatus[nextRaceIndex]?.round;
            const qualPKT = convertToPKT(race.qualifyingUTC);
            const racePKT = convertToPKT(race.raceUTC);
            const qualFormatted = formatDateTime(qualPKT);
            const raceFormatted = formatDateTime(racePKT);

            // Get card background
            let cardBackground = 'linear-gradient(to right, #1a1a1a 0%, #111111 40%, #0d0d0d 100%)';
            if (isNext) cardBackground = 'linear-gradient(to right, rgba(232,0,45,0.08) 0%, #111111 50%, #0d0d0d 100%)';
            if (race.status === 'completed') cardBackground = 'linear-gradient(to right, rgba(57,255,20,0.04) 0%, #111111 50%, #0d0d0d 100%)';

            return (
              <motion.div
                key={race.round}
                ref={isNext ? nextRaceRef : null}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.06, duration: 0.5 }}
                whileHover={{ 
                  y: -4,
                  transition: { duration: 0.2 }
                }}
                onClick={() => race.status === 'completed' && navigate('/live')}
                style={{
                  background: cardBackground,
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderLeft: '4px solid transparent',
                  borderRadius: '16px',
                  padding: '28px 32px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '32px',
                  cursor: race.status === 'completed' ? 'pointer' : 'default',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'border-left-color 0.3s, box-shadow 0.3s',
                  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderLeftColor = '#E8002D';
                  const watermark = e.currentTarget.querySelector('.country-watermark');
                  if (watermark) watermark.style.opacity = '0.08';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderLeftColor = 'transparent';
                  const watermark = e.currentTarget.querySelector('.country-watermark');
                  if (watermark) watermark.style.opacity = race.status === 'completed' ? '0.04' : '0.035';
                }}
              >
                {/* Country Name Watermark */}
                <div
                  className="country-watermark"
                  style={{
                    position: 'absolute',
                    right: '-50px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '90px',
                    fontWeight: 900,
                    fontFamily: 'Titillium Web',
                    color: 'white',
                    opacity: race.status === 'completed' ? '0.04' : '0.035',
                    letterSpacing: '-0.02em',
                    textTransform: 'uppercase',
                    pointerEvents: 'none',
                    transition: 'opacity 0.3s',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {race.country.toUpperCase()}
                </div>

                {/* Round Number Badge */}
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  left: '16px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '20px',
                  padding: '6px 14px',
                  zIndex: 2
                }}>
                  <p style={{
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    fontFamily: 'JetBrains Mono',
                    margin: 0
                  }}>
                    RD {race.round.toString().padStart(2, '0')}
                  </p>
                </div>

                {/* Large Flag */}
                <div style={{
                  fontSize: '80px',
                  lineHeight: 1,
                  flexShrink: 0,
                  zIndex: 1
                }}>
                  {race.flag}
                </div>

                {/* Race Info */}
                <div style={{ flex: 1, zIndex: 1, minWidth: 0 }}>
                  <div style={{
                    borderLeft: '3px solid #E8002D',
                    paddingLeft: '20px',
                    marginBottom: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '10px' }}>
                      <h2 style={{
                        color: 'white',
                        fontSize: '32px',
                        fontWeight: 900,
                        fontFamily: 'Titillium Web',
                        margin: 0,
                        textTransform: 'uppercase',
                        letterSpacing: '-0.01em'
                      }}>
                        {race.raceName.replace(' Grand Prix', '')}
                      </h2>

                      {/* Sprint Badge */}
                      {race.sprint && (
                        <span style={{
                          background: 'rgba(255, 107, 0, 0.15)',
                          color: '#FF6B00',
                          border: '1px solid rgba(255, 107, 0, 0.3)',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '10px',
                          fontWeight: 700,
                          letterSpacing: '0.1em',
                          fontFamily: 'JetBrains Mono',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          ⚡ SPRINT
                        </span>
                      )}

                      {/* Next Badge with Pulse */}
                      {isNext && (
                        <motion.span
                          animate={{ 
                            opacity: [1, 0.7, 1],
                            boxShadow: [
                              '0 0 0px rgba(232, 0, 45, 0)',
                              '0 0 20px rgba(232, 0, 45, 0.5)',
                              '0 0 0px rgba(232, 0, 45, 0)'
                            ]
                          }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          style={{
                            background: '#E8002D',
                            color: 'white',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '10px',
                            fontWeight: 700,
                            letterSpacing: '0.1em',
                            fontFamily: 'JetBrains Mono'
                          }}
                        >
                          NEXT
                        </motion.span>
                      )}

                      {/* Completed Badge */}
                      {race.status === 'completed' && (
                        <span style={{
                          background: 'rgba(57, 255, 20, 0.1)',
                          color: '#39FF14',
                          border: '1px solid rgba(57, 255, 20, 0.3)',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '10px',
                          fontWeight: 700,
                          letterSpacing: '0.1em',
                          fontFamily: 'JetBrains Mono',
                          boxShadow: '0 0 10px rgba(57, 255, 20, 0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          ✓ COMPLETED
                        </span>
                      )}
                    </div>

                    <p style={{
                      color: 'rgba(255, 255, 255, 0.5)',
                      fontSize: '14px',
                      margin: 0,
                      marginBottom: '6px',
                      fontWeight: 600
                    }}>
                      {race.circuit}
                    </p>
                    <p style={{
                      color: 'rgba(255, 255, 255, 0.35)',
                      fontSize: '12px',
                      margin: 0
                    }}>
                      {race.city}, {race.country}
                    </p>
                  </div>

                  {/* Top 3 Results - Premium Chips (only for completed races) */}
                  {race.status === 'completed' && (
                    <div style={{
                      marginTop: '20px',
                      padding: '16px 20px',
                      background: 'rgba(57, 255, 20, 0.03)',
                      borderRadius: '10px',
                      border: '1px solid rgba(57, 255, 20, 0.1)'
                    }}>
                      <p style={{
                        color: 'rgba(255, 255, 255, 0.4)',
                        fontSize: '9px',
                        marginBottom: '12px',
                        letterSpacing: '0.12em',
                        fontFamily: 'JetBrains Mono',
                        textTransform: 'uppercase'
                      }}>
                        Race Result {loadingResults && '(Loading...)'}
                      </p>
                      {(() => {
                        // Match race by country name with the fetched results
                        const countryMatches = raceResults && raceResults.countryName &&
                          race.country.toLowerCase().includes(raceResults.countryName.toLowerCase().split(' ')[0]);
                        
                        // Also check if this is the latest completed race as fallback
                        const latestCompletedRace = racesWithStatus
                          .filter(r => r.status === 'completed')
                          .sort((a, b) => new Date(b.raceUTC) - new Date(a.raceUTC))[0];
                        
                        const isLatestCompleted = latestCompletedRace?.round === race.round;
                        
                        // Use dynamic results if country matches OR if it's the latest completed race
                        const shouldUseDynamicResults = (countryMatches || isLatestCompleted) && 
                          raceResults?.topThree?.length > 0;
                        
                        const topThreeData = shouldUseDynamicResults
                          ? raceResults.topThree
                          : race.topThree;

                        if (!topThreeData || topThreeData.length === 0) {
                          return (
                            <div style={{
                              color: 'rgba(255, 255, 255, 0.3)',
                              fontSize: '12px',
                              fontStyle: 'italic',
                              textAlign: 'center',
                              padding: '10px'
                            }}>
                              Results not available yet
                            </div>
                          );
                        }

                        return (
                          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            {topThreeData.map(result => {
                              const positionColors = {
                                1: '#FFD700',
                                2: '#C0C0C0',
                                3: '#CD7F32'
                              };
                              return (
                                <div key={result.position} style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '10px',
                                  background: 'rgba(0, 0, 0, 0.3)',
                                  backdropFilter: 'blur(10px)',
                                  border: '1px solid rgba(255, 255, 255, 0.08)',
                                  borderRadius: '8px',
                                  padding: '8px 14px'
                                }}>
                                  <div style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    background: positionColors[result.position],
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontFamily: 'JetBrains Mono',
                                    fontSize: '11px',
                                    fontWeight: 900,
                                    color: '#000',
                                    flexShrink: 0
                                  }}>
                                    {result.position}
                                  </div>
                                  <span style={{
                                    color: 'white',
                                    fontSize: '14px',
                                    fontWeight: 700,
                                    fontFamily: 'Titillium Web'
                                  }}>
                                    {result.driver}
                                  </span>
                                  <div style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: result.color,
                                    flexShrink: 0
                                  }} />
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* Session Boxes - Minimal Premium Design */}
                <div style={{ display: 'flex', gap: '14px', flexShrink: 0, zIndex: 1 }}>
                  {/* Qualifying */}
                  <div style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    backdropFilter: 'blur(10px)',
                    borderTop: `3px solid ${isSessionPast(race.qualifyingUTC) ? 'rgba(191, 95, 255, 0.3)' : '#BF5FFF'}`,
                    borderRadius: '10px',
                    padding: '20px 20px',
                    minWidth: '140px',
                    opacity: isSessionPast(race.qualifyingUTC) ? 0.5 : 1,
                    position: 'relative'
                  }}>
                    {isSessionPast(race.qualifyingUTC) && (
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        color: 'rgba(255, 255, 255, 0.4)',
                        fontSize: '9px',
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        fontFamily: 'JetBrains Mono'
                      }}>
                        ✓ DONE
                      </div>
                    )}
                    <p style={{
                      color: isSessionPast(race.qualifyingUTC) ? 'rgba(191, 95, 255, 0.5)' : '#BF5FFF',
                      fontSize: '10px',
                      fontWeight: 700,
                      letterSpacing: '0.12em',
                      marginBottom: '10px',
                      fontFamily: 'JetBrains Mono',
                      textTransform: 'uppercase'
                    }}>
                      Qualifying
                    </p>
                    <p style={{ 
                      color: isSessionPast(race.qualifyingUTC) ? 'rgba(255, 255, 255, 0.4)' : 'white',
                      fontSize: '16px', 
                      fontWeight: 700, 
                      marginBottom: '6px',
                      fontFamily: 'Titillium Web'
                    }}>
                      {qualFormatted.date}
                    </p>
                    <p style={{ 
                      color: isSessionPast(race.qualifyingUTC) ? 'rgba(191, 95, 255, 0.4)' : '#BF5FFF',
                      fontSize: '13px', 
                      fontFamily: 'JetBrains Mono',
                      fontWeight: 600
                    }}>
                      {qualFormatted.time} PKT
                    </p>
                  </div>

                  {/* Race */}
                  <div style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    backdropFilter: 'blur(10px)',
                    borderTop: `3px solid ${race.status === 'completed' ? 'rgba(232, 0, 45, 0.3)' : '#E8002D'}`,
                    borderRadius: '10px',
                    padding: '20px 20px',
                    minWidth: '140px',
                    opacity: race.status === 'completed' ? 0.5 : 1,
                    position: 'relative'
                  }}>
                    {race.status === 'completed' && (
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        color: 'rgba(255, 255, 255, 0.4)',
                        fontSize: '9px',
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        fontFamily: 'JetBrains Mono'
                      }}>
                        ✓ DONE
                      </div>
                    )}
                    <p style={{
                      color: race.status === 'completed' ? 'rgba(232, 0, 45, 0.5)' : '#E8002D',
                      fontSize: '10px',
                      fontWeight: 700,
                      letterSpacing: '0.12em',
                      marginBottom: '10px',
                      fontFamily: 'JetBrains Mono',
                      textTransform: 'uppercase'
                    }}>
                      Race
                    </p>
                    <p style={{ 
                      color: race.status === 'completed' ? 'rgba(255, 255, 255, 0.4)' : 'white',
                      fontSize: '16px', 
                      fontWeight: 700, 
                      marginBottom: '6px',
                      fontFamily: 'Titillium Web'
                    }}>
                      {raceFormatted.date}
                    </p>
                    <p style={{ 
                      color: race.status === 'completed' ? 'rgba(232, 0, 45, 0.4)' : '#E8002D',
                      fontSize: '13px', 
                      fontFamily: 'JetBrains Mono',
                      fontWeight: 600
                    }}>
                      {raceFormatted.time} PKT
                    </p>
                  </div>
                </div>

                {/* Circuit Info - Stacked Stats */}
                <div style={{
                  background: 'rgba(0, 0, 0, 0.2)',
                  borderTop: '2px solid rgba(255, 255, 255, 0.1)',
                  borderLeft: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '10px',
                  padding: '20px 20px',
                  minWidth: '160px',
                  flexShrink: 0,
                  zIndex: 1
                }}>
                  <div style={{ marginBottom: race.lapRecord ? '16px' : 0 }}>
                    <p style={{
                      color: 'rgba(255, 255, 255, 0.4)',
                      fontSize: '9px',
                      marginBottom: '6px',
                      letterSpacing: '0.12em',
                      fontFamily: 'JetBrains Mono',
                      textTransform: 'uppercase'
                    }}>
                      Circuit Length
                    </p>
                    <p style={{
                      color: 'white',
                      fontSize: '18px',
                      fontWeight: 700,
                      fontFamily: 'JetBrains Mono',
                      margin: 0
                    }}>
                      {race.circuitLength}
                    </p>
                  </div>

                  {race.lapRecord && (
                    <div>
                      <p style={{
                        color: 'rgba(255, 255, 255, 0.4)',
                        fontSize: '9px',
                        marginBottom: '6px',
                        letterSpacing: '0.12em',
                        fontFamily: 'JetBrains Mono',
                        textTransform: 'uppercase'
                      }}>
                        Lap Record
                      </p>
                      <p style={{
                        color: '#E8002D',
                        fontSize: '15px',
                        fontWeight: 700,
                        fontFamily: 'JetBrains Mono',
                        margin: 0
                      }}>
                        {race.lapRecord}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SchedulePage;
