import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { apiUrl } from '../../config/api';
import { teamColors } from '../../config/teamColors';

const DriverStandings = () => {
  const navigate = useNavigate();
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        setLoading(true);
        const response = await fetch(apiUrl('/api/standings/drivers'));
        if (!response.ok) {
          throw new Error('Failed to fetch standings');
        }
        const data = await response.json();
        setStandings(data.drivers || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching standings:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStandings();
  }, []);
  
  const top10 = standings.slice(0, 10);
  const top3 = top10.slice(0, 3);
  const rest = top10.slice(3, 10);

  const getTeamColor = (constructorName) => {
    if (!constructorName) return '#ffffff';
    for (const [key, config] of Object.entries(teamColors)) {
      if (config.name && config.name.toLowerCase() === constructorName.toLowerCase()) {
        return config.primary || '#ffffff';
      }
    }
    return '#ffffff';
  };

  const getDriverNumber = (position) => {
    const numberMap = { 1: '1', 2: '2', 3: '3' };
    return numberMap[position] || '•';
  };

  if (error) {
    return (
      <div className="bg-[#0a0a0a] py-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-white/60">Failed to load standings</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-[#0a0a0a] py-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-16">
            <div className="w-1 h-8 bg-[#E8002D]" />
            <h2 className="font-titillium font-bold text-white text-3xl uppercase">2026 Driver Standings</h2>
          </div>
          <div className="text-center text-white/60">Loading standings...</div>
        </div>
      </div>
    );
  }

  if (!top10 || top10.length === 0) {
    return (
      <div className="bg-[#0a0a0a] py-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-white/60">No standings data available</p>
        </div>
      </div>
    );
  }

  const DriverCard = ({ driver, rank }) => {
    const teamColor = getTeamColor(driver.constructorName);

    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: rank * 0.1 }}
        viewport={{ once: true }}
        className={`relative overflow-hidden rounded-2xl border p-8 text-center backdrop-blur-sm ${rank === 1 ? 'shadow-[0_0_40px_rgba(255,200,0,0.16)]' : 'shadow-[0_20px_40px_rgba(0,0,0,0.28)]'}`}
        style={{
          borderColor: `${teamColor}55`,
          background: `linear-gradient(155deg, ${teamColor}22 0%, rgba(18,18,18,0.96) 38%, rgba(10,10,10,0.96) 100%)`
        }}
      >
        {/* Background driver number watermark */}
        <div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{
            fontSize: '160px',
            fontWeight: 900,
            opacity: 0.08,
            color: 'white',
            fontFamily: 'Titillium Web'
          }}
        >
          {getDriverNumber(rank)}
        </div>

        {/* Driver Info */}
        <h3 className="font-titillium font-bold text-white text-2xl mb-3 relative z-10">
          {driver.givenName} {driver.familyName}
        </h3>
        <p className="text-sm uppercase tracking-[0.16em] mb-8 relative z-10" style={{ color: teamColor }}>
          {driver.constructorName}
        </p>

        {/* Points */}
        <div className="text-6xl font-black text-white relative z-10">{driver.points}</div>
        <p className="text-white/60 text-xs mt-2 uppercase tracking-[0.18em] relative z-10">Points</p>
      </motion.div>
    );
  };

  return (
    <section className="relative overflow-hidden bg-[#090909] py-20 px-4 md:px-8">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(232,0,45,0.22),transparent_42%),radial-gradient(circle_at_85%_10%,rgba(255,255,255,0.08),transparent_38%)]" />
        <div className="absolute inset-0 opacity-[0.09] [background-image:linear-gradient(rgba(232,0,45,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(232,0,45,0.8)_1px,transparent_1px)] [background-size:26px_26px]" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-1 h-10 bg-[#E8002D]" />
            <div>
              <p className="font-jetbrains text-[11px] tracking-[0.22em] text-[#E8002D] uppercase">Championship Snapshot</p>
              <h2 className="font-titillium font-bold text-white text-3xl md:text-4xl uppercase leading-none mt-2">2026 Driver Standings</h2>
            </div>
          </div>
          <p className="text-white/45 font-jetbrains text-xs tracking-[0.08em] uppercase">Top 10 updated from live backend feed</p>
        </div>

        {/* Top 3 Hero Cards */}
        <div className="flex flex-col md:flex-row items-end justify-center gap-6 mb-14">
          {/* P2 - Left (Norris) */}
          <div className="w-full md:w-80">
            <DriverCard driver={top3[1]} rank={2} />
          </div>

          {/* P1 - Center (Verstappen) - 40px taller */}
          <div className="w-full md:w-80" style={{ paddingBottom: '40px' }}>
            <DriverCard driver={top3[0]} rank={1} />
          </div>

          {/* P3 - Right (Leclerc) */}
          <div className="w-full md:w-80">
            <DriverCard driver={top3[2]} rank={3} />
          </div>
        </div>

        {/* Standings Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-white/[0.08] overflow-hidden bg-[linear-gradient(160deg,rgba(255,255,255,0.05),rgba(255,255,255,0.01))] backdrop-blur-sm"
        >
          <div className="bg-[#141414]/95">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/[0.08] font-titillium font-bold text-white/60 text-xs tracking-[0.14em] uppercase">
              <div className="col-span-1">POS</div>
              <div className="col-span-4">DRIVER</div>
              <div className="col-span-3">TEAM</div>
              <div className="col-span-2">PTS</div>
              <div className="col-span-2">GAP</div>
            </div>

            {/* Table Rows */}
            {rest.map((driver, index) => {
              const leaderPoints = top10[0]?.points || 1;
              const gap = index === 0 ? '-' : -(leaderPoints - driver.points);
              const teamColor = getTeamColor(driver.constructorName);

              return (
                <motion.div
                  key={driver.driverNumber}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.05 }}
                  viewport={{ once: true }}
                  className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/[0.06] hover:bg-white/[0.045] transition-colors cursor-pointer"
                  onClick={() => navigate(`/driver/${driver.driverNumber}`)}
                >
                  <div className="col-span-1 font-titillium font-bold text-white">P{driver.position}</div>
                  <div className="col-span-4 font-titillium text-white">
                    {driver.givenName} {driver.familyName}
                  </div>
                  <div
                    className="col-span-3 font-titillium text-sm uppercase tracking-[0.08em]"
                    style={{ color: teamColor }}
                  >
                    {driver.constructorName}
                  </div>
                  <div className="col-span-2 font-jetbrains text-white font-bold">{driver.points}</div>
                  <div className="col-span-2 text-white/60 font-jetbrains text-sm">{gap === '-' ? '-' : `${gap > 0 ? '+' : ''}${gap}`}</div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Show All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="flex justify-center mt-12"
        >
          <button
            onClick={() => navigate('/standings')}
            className="group relative inline-flex items-center overflow-hidden rounded-md border border-[#E8002D]/80 bg-[linear-gradient(120deg,#23070d_0%,#E8002D_48%,#b50021_100%)] px-10 py-3 font-titillium text-sm font-extrabold uppercase tracking-[0.16em] text-white shadow-[0_12px_30px_rgba(232,0,45,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_44px_rgba(232,0,45,0.62)]"
          >
            <span className="absolute inset-y-0 -left-20 w-16 rotate-12 bg-white/25 blur-md transition-all duration-500 group-hover:left-[120%]" />
            <span className="absolute inset-x-0 bottom-0 h-[2px] bg-white/60" />
            <span className="relative">View Full Standings</span>
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default DriverStandings;
