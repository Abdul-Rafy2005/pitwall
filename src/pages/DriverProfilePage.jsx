import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Trophy, Star, Flag, Users, ArrowLeft, ArrowRight } from 'lucide-react';
import GlassCard from '../components/shared/GlassCard';
import { apiUrl } from '../config/api';
import driverBios from '../config/driverBios';

const pointsByDriverNumber = {
  63: 25,
  12: 18,
  6: 15,
  16: 12,
  81: 10,
  4: 8,
  44: 6,
  30: 4,
  41: 2,
  5: 1
};

const DriverProfilePage = () => {
  const { driverNumber } = useParams();
  const navigate = useNavigate();
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('OVERVIEW');
  const [allDrivers, setAllDrivers] = useState([]);

  useEffect(() => {
    const fetchDriverData = async () => {
      setLoading(true);
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

        const [driversRes, resultsRes] = await Promise.all([
          fetch(apiUrl('/api/timing/drivers/latest'), { signal: controller.signal }),
          fetch(apiUrl('/api/timing/results/latest'), { signal: controller.signal })
        ]);

        clearTimeout(timeoutId);

        const driversData = await driversRes.json();
        const resultsData = await resultsRes.json();
        const positions = Array.isArray(resultsData?.positions) ? resultsData.positions : [];

        const positionMap = positions.reduce((acc, row) => {
          const number = String(row.driver_number);
          const position = Number(row.position);
          if (number && Number.isFinite(position)) {
            acc[number] = position;
          }
          return acc;
        }, {});

        const driverInfo = driversData.find(d => String(d.driver_number) === String(driverNumber));

        if (!driverInfo) {
          console.error('Driver not found');
          navigate('/');
          return;
        }

        const enhancedDriver = {
          ...driverInfo,
          position: positionMap[String(driverNumber)] || null,
          points: pointsByDriverNumber[Number(driverNumber)] || 0,
          racesEntered: 1,
          teamColor: driverInfo.team_colour ? `#${driverInfo.team_colour}` : '#888888'
        };

        setDriver(enhancedDriver);
        const sortedByPosition = [...driversData]
          .map((item) => ({
            ...item,
            qualPosition: positionMap[String(item.driver_number)] ?? 999
          }))
          .sort((a, b) => {
            if (a.qualPosition !== b.qualPosition) {
              return a.qualPosition - b.qualPosition;
            }
            return (a.driver_number || 999) - (b.driver_number || 999);
          });

        setAllDrivers(sortedByPosition);
      } catch (error) {
        console.error('Error fetching driver data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDriverData();
  }, [driverNumber, navigate]);

  // Get previous and next drivers
  const currentIndex = allDrivers.findIndex(d => String(d.driver_number) === String(driverNumber));
  const prevDriver = currentIndex > 0 ? allDrivers[currentIndex - 1] : null;
  const nextDriver = currentIndex < allDrivers.length - 1 ? allDrivers[currentIndex + 1] : null;

  if (loading) {
    return (
      <div style={{ background: '#0a0a0a', minHeight: '100vh', padding: '0' }}>
        <div style={{ height: '100vh', background: 'linear-gradient(90deg, #1a1a1a 25%, #222 50%, #1a1a1a 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
      </div>
    );
  }

  if (!driver) return null;

  const bio = driverBios[Number(driver.driver_number)] || null;

  const seasonResults = [
    {
      round: 1,
      gp: 'Australian GP',
      flag: '🇦🇺',
      qualiPos: driver.position || 'N/A',
      racePos: driver.position ? `P${driver.position}` : 'N/A',
      points: driver.points
    }
  ];

  const pointsData = [
    {
      round: 'Round 1 - Australian GP',
      points: driver.points
    }
  ];

  const getPositionColor = (pos) => {
    if (pos === 1 || pos === 'P1') return '#FFD700';
    if (pos === 2 || pos === 'P2') return '#C0C0C0';
    if (pos === 3 || pos === 'P3') return '#CD7F32';
    return 'white';
  };

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', paddingBottom: '80px' }}>
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          height: '100vh',
          position: 'relative',
          background: `radial-gradient(ellipse at top right, ${driver.teamColor} 0%, rgba(0,0,0,0.95) 60%, #0a0a0a 100%)`,
          overflow: 'hidden'
        }}
      >
        {/* Background Number */}
        <div
          style={{
            position: 'absolute',
            top: '20%',
            right: '5%',
            fontSize: '320px',
            fontWeight: 900,
            fontFamily: 'Titillium Web',
            color: driver.teamColor,
            opacity: 0.06,
            lineHeight: 1,
            userSelect: 'none'
          }}
        >
          {driver.driver_number}
        </div>

        {/* Content */}
        <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center', padding: '0 8%' }}>
          {/* Left Side - Name */}
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            style={{ flex: 1, zIndex: 2 }}
          >
            <p style={{ color: '#E8002D', fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em', marginBottom: '12px' }}>
              {driver.name_acronym || 'DRV'}
            </p>
            <h1 style={{ 
              color: 'white', 
              fontSize: '84px', 
              fontWeight: 900, 
              fontFamily: 'Titillium Web', 
              lineHeight: 0.95, 
              marginBottom: '20px',
              textTransform: 'uppercase'
            }}>
              {driver.full_name || driver.broadcast_name || 'Driver'}
            </h1>
            <p style={{ 
              color: driver.teamColor, 
              fontSize: '28px', 
              fontWeight: 700, 
              fontFamily: 'Titillium Web',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              {driver.team_name}
            </p>
          </motion.div>

          {/* Right Side - Headshot */}
          {driver.headshot_url && (
            <motion.div
              initial={{ x: 200, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              style={{
                flex: 1,
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'flex-end',
                height: '100%',
                overflow: 'hidden',
                background: 'transparent'
              }}
            >
              <img
                src={driver.headshot_url}
                alt={driver.full_name}
                style={{
                  height: '80%',
                  width: '100%',
                  objectFit: 'contain',
                  objectPosition: 'right bottom',
                  imageRendering: 'crisp-edges',
                  filter: 'none',
                  backdropFilter: 'none'
                }}
              />
            </motion.div>
          )}
        </div>

        {/* Bottom Gradient */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '200px',
          background: 'linear-gradient(to bottom, transparent 0%, #0a0a0a 100%)'
        }} />
      </motion.div>

      {/* Stat Cards Row */}
      <div style={{ 
        padding: '60px 8%', 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
        gap: '24px',
        alignItems: 'stretch',
        marginTop: '-100px',
        position: 'relative',
        zIndex: 3
      }}>
        {[
          { label: 'Championship Position', value: driver.position ? `P${driver.position}` : 'N/A', Icon: Trophy },
          { label: 'Points This Season', value: String(driver.points), Icon: Star },
          { label: 'Races Entered', value: String(driver.racesEntered), Icon: Flag },
          { label: 'Team', value: driver.team_name || 'N/A', Icon: Users }
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            viewport={{ once: true }}
            style={{ height: '100%' }}
          >
            <GlassCard
              style={{
                padding: '24px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end'
              }}
            >
              <stat.Icon size={32} color={driver.teamColor} style={{ marginBottom: '12px' }} />
              <p style={{ color: 'rgba(255,255,255,0.52)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>
                {stat.label}
              </p>
              <p style={{ color: 'white', fontSize: '28px', fontWeight: 900, fontFamily: 'Titillium Web' }}>
                {stat.value}
              </p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Tabs Section */}
      <div style={{ padding: '0 8%', marginTop: '40px' }}>
        {/* Tab Headers */}
        <div style={{ display: 'flex', gap: '40px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '40px' }}>
          {['OVERVIEW', 'CAREER', 'THIS SEASON'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: activeTab === tab ? 'rgba(232,0,45,0.12)' : 'transparent',
                border: activeTab === tab ? '1px solid rgba(232,0,45,0.45)' : '1px solid transparent',
                color: activeTab === tab ? 'white' : 'rgba(255,255,255,0.4)',
                fontSize: '14px',
                fontWeight: 700,
                fontFamily: 'Titillium Web',
                letterSpacing: '0.1em',
                padding: '10px 16px',
                cursor: 'pointer',
                borderBottom: activeTab === tab ? '3px solid #E8002D' : '3px solid transparent',
                transition: 'all 0.3s ease',
                position: 'relative',
                top: '1px',
                borderRadius: '999px',
                boxShadow: activeTab === tab ? '0 0 20px rgba(232,0,45,0.2)' : 'none'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'OVERVIEW' && (
              <div>
                {/* Two Column Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}>
                  {/* Bio Card */}
                  <GlassCard style={{ padding: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                      <div style={{ width: '3px', height: '24px', background: '#E8002D' }} />
                      <h3 style={{ color: 'white', fontFamily: 'Titillium Web', fontWeight: 700, fontSize: '18px', textTransform: 'uppercase' }}>
                        Biography
                      </h3>
                    </div>
                    {[
                      { label: 'Nationality', value: bio?.nationality || 'Not available' },
                      { label: 'Date of Birth', value: bio?.dateOfBirth || 'Not available' },
                      { label: 'Place of Birth', value: bio?.placeOfBirth || 'Not available' },
                      { label: 'Race Number', value: driver.driver_number }
                    ].map((field, i) => (
                      <div key={i} style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                          {field.label}
                        </p>
                        <p style={{ color: 'white', fontSize: '16px', fontWeight: 600, fontFamily: 'Titillium Web' }}>
                          {field.value}
                        </p>
                      </div>
                    ))}
                    <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: '14px', lineHeight: 1.6 }}>
                      {bio?.biography || `${driver.full_name} competes for ${driver.team_name} in the 2026 Formula 1 season.`}
                    </p>
                  </GlassCard>

                  {/* Qualifying Result Card */}
                  <GlassCard style={{ padding: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                      <div style={{ width: '3px', height: '24px', background: '#E8002D' }} />
                      <h3 style={{ color: 'white', fontFamily: 'Titillium Web', fontWeight: 700, fontSize: '18px', textTransform: 'uppercase' }}>
                        Latest Qualifying
                      </h3>
                    </div>
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginBottom: '12px' }}>
                        Australian GP - Qualifying
                      </p>
                      <div style={{ fontSize: '72px', fontWeight: 900, fontFamily: 'Titillium Web', color: getPositionColor(driver.position), marginBottom: '8px' }}>
                        {driver.position ? `P${driver.position}` : 'N/A'}
                      </div>
                      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
                        Position
                      </p>
                    </div>
                  </GlassCard>
                </div>

                {/* Points Progression Chart */}
                <GlassCard style={{ padding: '32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                    <div style={{ width: '3px', height: '24px', background: '#E8002D' }} />
                    <h3 style={{ color: 'white', fontFamily: 'Titillium Web', fontWeight: 700, fontSize: '18px', textTransform: 'uppercase' }}>
                      Points Progression
                    </h3>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={pointsData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                      <XAxis dataKey="round" stroke="rgba(255,255,255,0.65)" tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 12 }} />
                      <YAxis stroke="rgba(255,255,255,0.65)" tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          background: '#111111',
                          border: '1px solid rgba(255,255,255,0.12)',
                          borderRadius: '8px',
                          color: 'white'
                        }}
                        labelStyle={{ color: 'white', fontWeight: 700 }}
                        itemStyle={{ color: 'white' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="points"
                        stroke={driver.teamColor}
                        strokeWidth={3}
                        fill={driver.teamColor}
                        fillOpacity={0.3}
                        dot={{ r: 5, fill: driver.teamColor, stroke: '#0a0a0a', strokeWidth: 2 }}
                        activeDot={{ r: 7 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </GlassCard>
              </div>
            )}

            {activeTab === 'CAREER' && (
              <GlassCard style={{ padding: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
                  <div style={{ width: '3px', height: '24px', background: '#E8002D' }} />
                  <h3 style={{ color: 'white', fontFamily: 'Titillium Web', fontWeight: 700, fontSize: '18px', textTransform: 'uppercase' }}>
                    Career Timeline
                  </h3>
                </div>
                <div style={{ display: 'grid', gap: '20px' }}>
                  <GlassCard style={{ padding: '24px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>
                      Biography Summary
                    </p>
                    <p style={{ color: 'white', fontSize: '16px', lineHeight: 1.7 }}>
                      {bio?.biography || `${driver.full_name} is currently racing with ${driver.team_name}.`}
                    </p>
                  </GlassCard>
                  <GlassCard style={{ padding: '24px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>
                      Current Team
                    </p>
                    <p style={{ color: driver.teamColor, fontSize: '28px', fontWeight: 900, fontFamily: 'Titillium Web', marginBottom: '8px' }}>
                      {driver.team_name}
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '14px' }}>
                      Competing in the 2026 Formula 1 World Championship.
                    </p>
                  </GlassCard>
                </div>
              </GlassCard>
            )}

            {activeTab === 'THIS SEASON' && (
              <GlassCard style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '32px 32px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '3px', height: '24px', background: '#E8002D' }} />
                    <h3 style={{ color: 'white', fontFamily: 'Titillium Web', fontWeight: 700, fontSize: '18px', textTransform: 'uppercase' }}>
                      2026 Season Results
                    </h3>
                  </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        {['Round', 'Grand Prix', 'Qualifying', 'Race', 'Points'].map(header => (
                          <th key={header} style={{ 
                            padding: '16px 24px', 
                            textAlign: 'left', 
                            color: 'rgba(255,255,255,0.5)', 
                            fontSize: '12px', 
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {seasonResults.map((result, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '20px 24px', color: 'white', fontWeight: 700 }}>
                            {result.round}
                          </td>
                          <td style={{ padding: '20px 24px', color: 'white', fontWeight: 600 }}>
                            {result.flag} {result.gp}
                          </td>
                          <td style={{ padding: '20px 24px', color: getPositionColor(result.qualiPos), fontWeight: 700, fontFamily: 'Titillium Web' }}>
                            {typeof result.qualiPos === 'number' ? `P${result.qualiPos}` : result.qualiPos}
                          </td>
                          <td style={{ padding: '20px 24px', color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>
                            {result.racePos}
                          </td>
                          <td style={{ padding: '20px 24px', color: 'white', fontWeight: 700 }}>
                            {result.points}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Driver Navigation */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginTop: '60px' }}>
          {prevDriver ? (
            <motion.div
              whileHover={{
                scale: 1.02,
                boxShadow: `0 18px 40px ${prevDriver.team_colour ? `#${prevDriver.team_colour}66` : 'rgba(255,255,255,0.2)'}`
              }}
              transition={{ duration: 0.2 }}
              onClick={() => navigate(`/driver/${prevDriver.driver_number}`)}
              style={{
                cursor: 'pointer',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.12)',
                borderTop: `3px solid ${prevDriver.team_colour ? `#${prevDriver.team_colour}` : '#888888'}`,
                background: `linear-gradient(145deg, ${prevDriver.team_colour ? `#${prevDriver.team_colour}18` : 'rgba(255,255,255,0.06)'} 0%, rgba(18,18,18,0.86) 55%, rgba(12,12,12,0.9) 100%)`,
                padding: '20px',
                boxShadow: '0 8px 20px rgba(0,0,0,0.3)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '999px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(255,255,255,0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ArrowLeft size={18} color="rgba(255,255,255,0.9)" />
                </div>
                <div>
                  <p style={{ color: 'rgba(232,0,45,0.8)', fontSize: '11px', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Previous Driver
                  </p>
                  <p style={{ color: 'white', fontSize: '24px', fontWeight: 900, fontFamily: 'Titillium Web', lineHeight: 1.1 }}>
                    {prevDriver.full_name || prevDriver.broadcast_name}
                  </p>
                  <p style={{ color: prevDriver.team_colour ? `#${prevDriver.team_colour}` : '#888888', fontSize: '14px', fontWeight: 700, marginTop: '6px' }}>
                    {prevDriver.team_name}
                  </p>
                </div>
              </div>
            </motion.div>
          ) : <div />}

          {nextDriver ? (
            <motion.div
              whileHover={{
                scale: 1.02,
                boxShadow: `0 18px 40px ${nextDriver.team_colour ? `#${nextDriver.team_colour}66` : 'rgba(255,255,255,0.2)'}`
              }}
              transition={{ duration: 0.2 }}
              onClick={() => navigate(`/driver/${nextDriver.driver_number}`)}
              style={{
                cursor: 'pointer',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.12)',
                borderTop: `3px solid ${nextDriver.team_colour ? `#${nextDriver.team_colour}` : '#888888'}`,
                background: `linear-gradient(145deg, ${nextDriver.team_colour ? `#${nextDriver.team_colour}18` : 'rgba(255,255,255,0.06)'} 0%, rgba(18,18,18,0.86) 55%, rgba(12,12,12,0.9) 100%)`,
                padding: '20px',
                boxShadow: '0 8px 20px rgba(0,0,0,0.3)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <div>
                  <p style={{ color: 'rgba(232,0,45,0.8)', fontSize: '11px', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px', textAlign: 'right' }}>
                    Next Driver
                  </p>
                  <p style={{ color: 'white', fontSize: '24px', fontWeight: 900, fontFamily: 'Titillium Web', lineHeight: 1.1, textAlign: 'right' }}>
                    {nextDriver.full_name || nextDriver.broadcast_name}
                  </p>
                  <p style={{ color: nextDriver.team_colour ? `#${nextDriver.team_colour}` : '#888888', fontSize: '14px', fontWeight: 700, marginTop: '6px', textAlign: 'right' }}>
                    {nextDriver.team_name}
                  </p>
                </div>
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '999px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(255,255,255,0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ArrowRight size={18} color="rgba(255,255,255,0.9)" />
                </div>
              </div>
            </motion.div>
          ) : <div />}
        </div>
      </div>
    </div>
  );
};

export default DriverProfilePage;
