import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { apiUrl } from '../config/api';
import driverBios from '../config/driverBios';
import driverRoster2026 from '../config/driverRoster2026';

const DriversPage = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

        const driversRes = await fetch(apiUrl('/api/timing/drivers/latest'), { signal: controller.signal });

        clearTimeout(timeoutId);

        const driversData = await driversRes.json();

        // Create lookup map from roster by driver number
        const rosterMap = driverRoster2026.reduce((acc, rosterDriver) => {
          acc[rosterDriver.number] = rosterDriver;
          return acc;
        }, {});

        // Sort drivers by roster order and merge roster data
        const sorted = [...driversData]
          .map((driver) => ({
            ...driver,
            rosterData: rosterMap[driver.driver_number]
          }))
          .filter((driver) => driver.rosterData) // Only include drivers in roster
          .sort((a, b) => {
            const aPos = a.rosterData?.championshipPosition || 999;
            const bPos = b.rosterData?.championshipPosition || 999;
            return aPos - bPos;
          });

        setDrivers(sorted);
      } catch (error) {
        console.error('Error fetching drivers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDrivers();
  }, []);

  const getBio = (driverNumber) => driverBios[Number(driverNumber)] || null;

  if (loading) {
    return (
      <div style={{ background: '#0a0a0a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'white', fontSize: '20px' }}>Loading drivers...</p>
      </div>
    );
  }

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', paddingTop: '120px', paddingBottom: '80px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 5%' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '60px' }}>
          <div style={{ width: '4px', height: '48px', background: '#E8002D', borderRadius: '2px' }} />
          <h1 style={{ 
            color: 'white', 
            fontSize: '48px', 
            fontWeight: 900, 
            fontFamily: 'Titillium Web',
            textTransform: 'uppercase',
            letterSpacing: '0.02em'
          }}>
            2026 Drivers
          </h1>
        </div>

        {/* Drivers Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
          gap: '24px' 
        }}>
          {drivers.map((driver, index) => {
            const teamColor = driver.team_colour ? `#${driver.team_colour}` : '#888888';
            const bio = getBio(driver.driver_number);
            const championshipPos = driver.rosterData?.championshipPosition;
            const positionLabel = Number.isFinite(championshipPos) && championshipPos < 999
              ? `P${championshipPos}`
              : 'P/A';
            
            return (
              <Link
                key={driver.driver_number}
                to={`/driver/${driver.driver_number}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03, duration: 0.5 }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  style={{
                    background: 'rgba(26, 26, 26, 0.8)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    cursor: 'pointer',
                    height: '100%',
                    position: 'relative'
                  }}
                >
                  {/* Team Color Bar */}
                  <div style={{ height: '4px', background: teamColor }} />

                  {/* Position Badge */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      zIndex: 3,
                      padding: '6px 10px',
                      borderRadius: '999px',
                      border: '1px solid rgba(255, 255, 255, 0.16)',
                      background: 'rgba(0, 0, 0, 0.65)',
                      color: 'white',
                      fontSize: '11px',
                      fontWeight: 800,
                      fontFamily: 'JetBrains Mono',
                      letterSpacing: '0.08em'
                    }}
                  >
                    {positionLabel}
                  </div>

                  {/* Driver Number Background */}
                  <div style={{
                    position: 'absolute',
                    top: '20%',
                    right: '-10%',
                    fontSize: '160px',
                    fontWeight: 900,
                    fontFamily: 'Titillium Web',
                    color: teamColor,
                    opacity: 0.08,
                    lineHeight: 1,
                    userSelect: 'none',
                    pointerEvents: 'none'
                  }}>
                    {driver.driver_number}
                  </div>

                  {/* Content */}
                  <div style={{ padding: '24px', position: 'relative', zIndex: 1 }}>
                    {/* Headshot */}
                    {driver.headshot_url && (
                      <div style={{ 
                        width: '100%', 
                        height: '240px', 
                        marginBottom: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        background: 'transparent'
                      }}>
                        <img
                          src={driver.headshot_url}
                          alt={driver.full_name}
                          style={{
                            height: '100%',
                            width: '100%',
                            objectFit: 'contain',
                            objectPosition: 'center top',
                            imageRendering: 'crisp-edges',
                            filter: 'none',
                            backdropFilter: 'none'
                          }}
                        />
                      </div>
                    )}

                    {/* Driver Name */}
                    <h2 style={{
                      color: 'white',
                      fontSize: '24px',
                      fontWeight: 900,
                      fontFamily: 'Titillium Web',
                      marginBottom: '8px',
                      lineHeight: 1.2
                    }}>
                      {driver.full_name}
                    </h2>

                    {/* Broadcast Name */}
                    {driver.broadcast_name && (
                      <p style={{
                        color: 'rgba(255, 255, 255, 0.6)',
                        fontSize: '12px',
                        fontFamily: 'JetBrains Mono',
                        marginBottom: '12px',
                        letterSpacing: '0.05em'
                      }}>
                        {driver.broadcast_name}
                      </p>
                    )}

                    {/* Team */}
                    <p style={{
                      color: teamColor,
                      fontSize: '14px',
                      fontWeight: 700,
                      fontFamily: 'Titillium Web',
                      marginBottom: '16px',
                      textTransform: 'uppercase'
                    }}>
                      {driver.team_name}
                    </p>

                    {/* Details */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'flex-end', 
                      gap: '16px',
                      paddingTop: '16px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.06)'
                    }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase' }}>
                          Number
                        </p>
                        <p style={{
                          color: 'white',
                          fontSize: '20px',
                          fontWeight: 900,
                          fontFamily: 'JetBrains Mono'
                        }}>
                          #{driver.driver_number}
                        </p>
                      </div>
                      
                      <div style={{ flex: 1 }}>
                        <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase' }}>
                          Nationality
                        </p>
                        <p style={{ color: 'white', fontSize: '13px', fontWeight: 700, lineHeight: 1.4 }}>
                          {bio?.nationality || 'Unknown'}
                        </p>
                      </div>
                    </div>

                    {bio?.dateOfBirth && (
                      <div style={{ marginTop: '12px' }}>
                        <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase' }}>
                          Date Of Birth
                        </p>
                        <p style={{ color: 'rgba(255, 255, 255, 0.88)', fontSize: '13px', fontWeight: 600 }}>
                          {bio.dateOfBirth}
                        </p>
                      </div>
                    )}

                    {/* Acronym */}
                    {driver.name_acronym && (
                      <div style={{ 
                        marginTop: '16px',
                        padding: '12px',
                        background: 'rgba(232, 0, 45, 0.1)',
                        borderRadius: '6px',
                        textAlign: 'center'
                      }}>
                        <p style={{ 
                          color: '#E8002D', 
                          fontSize: '12px', 
                          fontWeight: 700,
                          letterSpacing: '0.15em',
                          textTransform: 'uppercase'
                        }}>
                          {driver.name_acronym}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Hover Indicator */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: `linear-gradient(to top, ${teamColor}15, transparent)`,
                      pointerEvents: 'none'
                    }}
                  />
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DriversPage;
