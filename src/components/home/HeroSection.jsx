import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../shared/GlassCard';

const HeroSection = () => {
  // 2026 F1 Calendar - Full Season
  const races = [
    { round: 1, country: "Australia", name: "Australian GP", flag: "🇦🇺", circuit: "Albert Park Circuit", short: "AU", sprint: false,
      sessions: { qualifying: "Mar 07 2026 06:00 UTC", race: "Mar 08 2026 05:00 UTC" }},
  
    { round: 2, country: "China", name: "Chinese GP", flag: "🇨🇳", circuit: "Shanghai International Circuit", short: "CN", sprint: true,
      sessions: { qualifying: "Mar 14 2026 07:00 UTC", race: "Mar 15 2026 07:00 UTC" }},
  
    { round: 3, country: "Japan", name: "Japanese GP", flag: "🇯🇵", circuit: "Suzuka Circuit", short: "JP", sprint: false,
      sessions: { qualifying: "Mar 28 2026 06:00 UTC", race: "Mar 29 2026 05:00 UTC" }},
  
    { round: 4, country: "Bahrain", name: "Bahrain GP", flag: "🇧🇭", circuit: "Bahrain International Circuit", short: "BH", sprint: false,
      sessions: { qualifying: "Apr 11 2026 15:00 UTC", race: "Apr 12 2026 15:00 UTC" }},
  
    { round: 5, country: "Saudi Arabia", name: "Saudi Arabian GP", flag: "🇸🇦", circuit: "Jeddah Corniche Circuit", short: "SA", sprint: false,
      sessions: { qualifying: "Apr 18 2026 17:00 UTC", race: "Apr 19 2026 17:00 UTC" }},
  
    { round: 6, country: "Miami", name: "Miami GP", flag: "🇺🇸", circuit: "Miami International Autodrome", short: "MIA", sprint: true,
      sessions: { qualifying: "May 02 2026 23:30 UTC", race: "May 03 2026 19:00 UTC" }},
  
    { round: 7, country: "Canada", name: "Canadian GP", flag: "🇨🇦", circuit: "Circuit Gilles Villeneuve", short: "CA", sprint: true,
      sessions: { qualifying: "May 23 2026 20:00 UTC", race: "May 24 2026 18:00 UTC" }},
  
    { round: 8, country: "Monaco", name: "Monaco GP", flag: "🇲🇨", circuit: "Circuit de Monaco", short: "MC", sprint: false,
      sessions: { qualifying: "Jun 06 2026 14:00 UTC", race: "Jun 07 2026 13:00 UTC" }},
  
    { round: 9, country: "Spain", name: "Spanish GP", flag: "🇪🇸", circuit: "Circuit de Barcelona-Catalunya", short: "ES", sprint: false,
      sessions: { qualifying: "Jun 13 2026 14:00 UTC", race: "Jun 14 2026 13:00 UTC" }},
  
    { round: 10, country: "Austria", name: "Austrian GP", flag: "🇦🇹", circuit: "Red Bull Ring", short: "AT", sprint: false,
      sessions: { qualifying: "Jun 27 2026 14:00 UTC", race: "Jun 28 2026 13:00 UTC" }},
  
    { round: 11, country: "Great Britain", name: "British GP", flag: "🇬🇧", circuit: "Silverstone Circuit", short: "GB", sprint: true,
      sessions: { qualifying: "Jul 04 2026 14:00 UTC", race: "Jul 05 2026 14:00 UTC" }},
  
    { round: 12, country: "Belgium", name: "Belgian GP", flag: "🇧🇪", circuit: "Circuit de Spa-Francorchamps", short: "BE", sprint: false,
      sessions: { qualifying: "Jul 18 2026 14:00 UTC", race: "Jul 19 2026 13:00 UTC" }},
  
    { round: 13, country: "Hungary", name: "Hungarian GP", flag: "🇭🇺", circuit: "Hungaroring", short: "HU", sprint: false,
      sessions: { qualifying: "Jul 25 2026 14:00 UTC", race: "Jul 26 2026 13:00 UTC" }},
  
    { round: 14, country: "Netherlands", name: "Dutch GP", flag: "🇳🇱", circuit: "Circuit Zandvoort", short: "NL", sprint: true,
      sessions: { qualifying: "Aug 22 2026 14:00 UTC", race: "Aug 23 2026 13:00 UTC" }},
  
    { round: 15, country: "Italy", name: "Italian GP", flag: "🇮🇹", circuit: "Autodromo Nazionale Monza", short: "IT", sprint: false,
      sessions: { qualifying: "Sep 05 2026 14:00 UTC", race: "Sep 06 2026 13:00 UTC" }},
  
    { round: 16, country: "Spain", name: "Madrid GP", flag: "🇪🇸", circuit: "Circuito de Madrid", short: "MAD", sprint: false,
      sessions: { qualifying: "Sep 12 2026 14:00 UTC", race: "Sep 13 2026 13:00 UTC" }},
  
    { round: 17, country: "Azerbaijan", name: "Azerbaijan GP", flag: "🇦🇿", circuit: "Baku City Circuit", short: "AZ", sprint: false,
      sessions: { qualifying: "Sep 25 2026 11:00 UTC", race: "Sep 26 2026 11:00 UTC" }},
  
    { round: 18, country: "Singapore", name: "Singapore GP", flag: "🇸🇬", circuit: "Marina Bay Street Circuit", short: "SG", sprint: true,
      sessions: { qualifying: "Oct 10 2026 13:00 UTC", race: "Oct 11 2026 12:00 UTC" }},
  
    { round: 19, country: "USA", name: "United States GP", flag: "🇺🇸", circuit: "Circuit of the Americas", short: "US", sprint: false,
      sessions: { qualifying: "Oct 24 2026 22:00 UTC", race: "Oct 25 2026 19:00 UTC" }},
  
    { round: 20, country: "Mexico", name: "Mexico City GP", flag: "🇲🇽", circuit: "Autodromo Hermanos Rodriguez", short: "MX", sprint: false,
      sessions: { qualifying: "Oct 31 2026 22:00 UTC", race: "Nov 01 2026 20:00 UTC" }},
  
    { round: 21, country: "Brazil", name: "São Paulo GP", flag: "🇧🇷", circuit: "Autodromo Jose Carlos Pace", short: "BR", sprint: false,
      sessions: { qualifying: "Nov 07 2026 18:00 UTC", race: "Nov 08 2026 17:00 UTC" }},
  
    { round: 22, country: "Las Vegas", name: "Las Vegas GP", flag: "🇺🇸", circuit: "Las Vegas Strip Circuit", short: "LV", sprint: false,
      sessions: { qualifying: "Nov 21 2026 06:00 UTC", race: "Nov 22 2026 06:00 UTC" }},
  
    { round: 23, country: "Qatar", name: "Qatar GP", flag: "🇶🇦", circuit: "Lusail International Circuit", short: "QA", sprint: false,
      sessions: { qualifying: "Nov 28 2026 14:00 UTC", race: "Nov 29 2026 13:00 UTC" }},
  
    { round: 24, country: "Abu Dhabi", name: "Abu Dhabi GP", flag: "🇦🇪", circuit: "Yas Marina Circuit", short: "AD", sprint: false,
      sessions: { qualifying: "Dec 05 2026 13:00 UTC", race: "Dec 06 2026 13:00 UTC" }},
  ];

  // Get next session to countdown to - only qualifying and race
  const getNextSession = () => {
    const now = new Date();
    const sessionOrder = ['qualifying', 'race'];

    // Flatten all sessions with their metadata
    const allSessions = [];
    for (const race of races) {
      for (const sessionKey of sessionOrder) {
        if (race.sessions[sessionKey]) {
          const sessionDate = new Date(race.sessions[sessionKey]);
          allSessions.push({
            race,
            sessionKey,
            sessionDate,
            sessionName: sessionKey === 'qualifying' ? 'QUALIFYING' : 'RACE',
          });
        }
      }
    }

    // Sort by date and find first one in the future
    allSessions.sort((a, b) => a.sessionDate - b.sessionDate);

    for (const session of allSessions) {
      if (session.sessionDate > now) {
        return session;
      }
    }

    // Fallback to first session if all have passed
    return allSessions[0] || {
      race: races[0],
      sessionKey: 'qualifying',
      sessionDate: new Date(races[0].sessions.qualifying),
      sessionName: 'QUALIFYING',
    };
  };

  const nextSession = getNextSession();
  const nextRace = nextSession.race;

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = nextSession.sessionDate - new Date();

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }

      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [nextSession.sessionDate]);

  const CountdownUnit = ({ value, label }) => (
    <GlassCard className="px-6 py-4 min-w-[100px] flex flex-col items-center">
      <span className="font-jetbrains text-5xl font-bold text-white">
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-white/60 text-sm uppercase tracking-wider mt-2">
        {label}
      </span>
    </GlassCard>
  );

  // SVG F1 Car Component - Static, bottom right, subtle watermark
  const F1CarSilhouette = () => (
    <div
      className="absolute bottom-0 right-0 opacity-15"
      style={{
        filter: 'brightness(0) saturate(100%) invert(13%) sepia(94%) saturate(6000%) hue-rotate(0deg)',
      }}
    >
      <svg width="200" height="100" viewBox="0 0 120 60">
        {/* Car body */}
        <ellipse cx="40" cy="30" rx="35" ry="18" fill="none" stroke="currentColor" strokeWidth="2" />
        {/* Cockpit */}
        <circle cx="45" cy="28" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
        {/* Front wing */}
        <line x1="8" y1="28" x2="25" y2="28" stroke="currentColor" strokeWidth="2" />
        {/* Rear wing */}
        <line x1="75" y1="26" x2="92" y2="26" stroke="currentColor" strokeWidth="2" />
        <line x1="75" y1="34" x2="92" y2="34" stroke="currentColor" strokeWidth="2" />
        {/* Wheels */}
        <circle cx="28" cy="45" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="55" cy="45" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    </div>
  );

  const heroStyle = {
    minHeight: '100vh',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0a0a0a',
    overflow: 'hidden',
    paddingBottom: '60px'
  };

  return (
    <div>
      {/* Hero Section */}
      <section style={heroStyle}>
        {/* Layer 1 - Red dramatic glow */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          background: 'radial-gradient(ellipse 120% 60% at 50% 20%, rgba(232,0,45,0.18) 0%, transparent 65%)'
        }} />

        {/* Layer 2 - Grid pattern */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0, opacity: 0.07,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }} />

        {/* Layer 3 - Bottom fade */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: '40%', zIndex: 0,
          background: 'linear-gradient(to bottom, transparent, #0a0a0a)'
        }} />

        {/* Layer 4 - Large faded PITWALL text watermark */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 'clamp(100px, 20vw, 280px)',
          fontFamily: 'Titillium Web', fontWeight: 900,
          color: 'rgba(232,0,45,0.04)',
          letterSpacing: '-0.05em',
          userSelect: 'none', pointerEvents: 'none'
        }}>
          PITWALL
        </div>

        {/* Main Content */}
        <div style={{ position: 'relative', zIndex: 1, height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Center Content */}
          <div className="flex-1 flex items-center justify-center px-4" style={{ position: 'relative', zIndex: 1 }}>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="text-center"
              style={{ position: 'relative', zIndex: 1 }}
            >
              {/* Next Race Label */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-4"
              >
                <span className="text-[#E8002D] font-titillium font-bold text-sm uppercase tracking-[0.3em]">
                  Next Race
                </span>
              </motion.div>

              {/* Race Name - Enhanced Typography */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="font-titillium font-black text-white mb-4 tracking-tight"
                style={{
                  fontSize: 'clamp(3rem, 8vw, 7rem)',
                  textTransform: 'uppercase',
                  letterSpacing: '-0.02em',
                  textShadow: '0 0 80px rgba(232, 0, 45, 0.3)',
                }}
              >
                {nextRace.name}
              </motion.h1>

              {/* Circuit Name & Flag */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-white/60 text-lg md:text-xl mb-12"
              >
                <span className="mr-2 text-2xl">{nextRace.flag}</span>
                {nextRace.circuit}
              </motion.p>

              {/* Countdown Label */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.45 }}
                className="text-[#E8002D] font-titillium font-semibold text-sm uppercase tracking-wider mb-6"
              >
                {nextSession.sessionName} starts in
              </motion.p>

              {/* Countdown Timer */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="flex gap-4 justify-center flex-wrap"
                style={{ marginTop: '60px', marginBottom: '40px' }}
              >
                <CountdownUnit value={timeLeft.days} label="Days" />
                <CountdownUnit value={timeLeft.hours} label="Hours" />
                <CountdownUnit value={timeLeft.minutes} label="Minutes" />
                <CountdownUnit value={timeLeft.seconds} label="Seconds" />
              </motion.div>
            </motion.div>
          </div>

          {/* Bottom: Upcoming Races Scrollable Strip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="pb-8 px-4 md:px-8"
            style={{ 
              position: 'relative', 
              zIndex: 1,
              paddingTop: '32px',
              borderTop: '1px solid rgba(255,255,255,0.06)'
            }}
          >
            <div className="relative">
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex gap-4 min-w-max pb-2">
                  {races.map((race) => (
                    <SimpleRaceCard key={race.round} race={race} isNext={race.round === nextRace.round} />
                  ))}
                </div>
              </div>

              {/* Gradient Fade at edges */}
              <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#0a0a0a] to-transparent pointer-events-none" />
            </div>
          </motion.div>
        </div>

        <style jsx>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </section>

      {/* Race Weekend Card Section */}
      <RaceWeekendCard race={nextRace} />
    </div>
  );
};

// Simple Race Card - No hover expansion
const SimpleRaceCard = ({ race, isNext }) => {
  return (
    <GlassCard
      className={`px-6 py-4 cursor-pointer transition-all duration-300 ${
        isNext
          ? 'border-[#E8002D] border-2 shadow-lg shadow-[#E8002D]/20 min-w-[200px]'
          : 'hover:border-white/20 min-w-[200px]'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-3xl">{race.flag}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-jetbrains text-xs text-white/50">R{race.round}</span>
            {isNext && (
              <span className="px-2 py-0.5 bg-[#E8002D] text-white text-[10px] font-bold rounded uppercase">
                Next
              </span>
            )}
            {race.sprint && (
              <span className="px-2 py-0.5 bg-orange-500 text-white text-[10px] font-bold rounded uppercase">
                Sprint
              </span>
            )}
          </div>
          <h3 className="font-titillium font-semibold text-white text-sm mb-1">
            {race.name}
          </h3>
          <p className="text-white/60 text-xs">{race.circuit}</p>
        </div>
      </div>
    </GlassCard>
  );
};

// Race Weekend Card - Shows current/next race with two columns
const RaceWeekendCard = ({ race }) => {
  const isCompleted = (dateStr) => new Date(dateStr) < new Date();

  const formatDay = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric'
  });

  const formatLocalTime = (dateStr) => new Date(dateStr).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: true,
    timeZoneName: 'short'
  });

  const getAwayLabel = (dateStr) => {
    const diff = new Date(dateStr) - new Date();
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    if (days > 0) return `${days}d ${hours}h away`;
    if (hours > 0) return `${hours}h ${mins}m away`;
    return `${mins}m away`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      viewport={{ once: true }}
    >
      <div style={{
        margin: '0 5%',
        background: 'linear-gradient(135deg, #141414 0%, #1a1a1a 100%)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '16px',
        overflow: 'hidden',
        position: 'relative'
      }}>

        {/* Top accent line - animated gradient */}
        <div style={{
          height: '3px',
          background: 'linear-gradient(90deg, #E8002D, #BF5FFF, #E8002D)',
          backgroundSize: '200% 100%',
          animation: 'gradientShift 3s ease infinite'
        }} />

        {/* Header row */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', padding: '24px 32px 20px'
        }}>
          <div>
            <p style={{ color: '#E8002D', fontSize: '11px', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '4px' }}>
              RACE WEEKEND
            </p>
            <h3 style={{ color: 'white', fontSize: '20px', fontWeight: 800, fontFamily: 'Titillium Web' }}>
              {race.name} · {race.circuit}
            </h3>
          </div>
          <div style={{
            fontSize: '48px', opacity: 0.9,
            filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.3))'
          }}>
            {race.flag}
          </div>
        </div>

        {/* Sessions row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'rgba(255,255,255,0.06)' }}>

          {/* QUALIFYING */}
          <div style={{
            background: '#141414', padding: '28px 32px',
            position: 'relative', overflow: 'hidden'
          }}>
            {/* Purple glow bg */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              background: 'radial-gradient(ellipse at top left, rgba(191,95,255,0.08) 0%, transparent 60%)',
              pointerEvents: 'none'
            }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', position: 'relative' }}>
              <div style={{
                width: '10px', height: '10px', borderRadius: '50%',
                background: '#BF5FFF',
                boxShadow: '0 0 12px rgba(191,95,255,0.8)'
              }} />
              <span style={{ color: '#BF5FFF', fontWeight: 700, fontSize: '13px', letterSpacing: '0.12em' }}>
                QUALIFYING
              </span>
              {isCompleted(race.sessions.qualifying) && (
                <span style={{
                  marginLeft: 'auto', background: 'rgba(57,255,20,0.1)',
                  color: '#39FF14', fontSize: '11px', fontWeight: 700,
                  padding: '2px 10px', borderRadius: '20px',
                  border: '1px solid rgba(57,255,20,0.3)'
                }}>✓ DONE</span>
              )}
            </div>
            <p style={{ color: 'white', fontSize: '26px', fontWeight: 800, fontFamily: 'Titillium Web', marginBottom: '6px', position: 'relative' }}>
              {formatDay(race.sessions.qualifying)}
            </p>
            <p style={{ color: '#BF5FFF', fontSize: '20px', fontWeight: 700, fontFamily: 'JetBrains Mono', marginBottom: '12px', position: 'relative' }}>
              {formatLocalTime(race.sessions.qualifying)}
            </p>
            {!isCompleted(race.sessions.qualifying) && (
              <p style={{ color: 'rgba(191,95,255,0.7)', fontSize: '13px', position: 'relative' }}>
                ⏱ {getAwayLabel(race.sessions.qualifying)}
              </p>
            )}
          </div>

          {/* RACE */}
          <div style={{
            background: '#141414', padding: '28px 32px',
            position: 'relative', overflow: 'hidden'
          }}>
            {/* Red glow bg */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              background: 'radial-gradient(ellipse at top left, rgba(232,0,45,0.08) 0%, transparent 60%)',
              pointerEvents: 'none'
            }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', position: 'relative' }}>
              <div style={{
                width: '10px', height: '10px', borderRadius: '50%',
                background: '#E8002D',
                boxShadow: '0 0 12px rgba(232,0,45,0.8)'
              }} />
              <span style={{ color: '#E8002D', fontWeight: 700, fontSize: '13px', letterSpacing: '0.12em' }}>
                RACE
              </span>
              {isCompleted(race.sessions.race) && (
                <span style={{
                  marginLeft: 'auto', background: 'rgba(57,255,20,0.1)',
                  color: '#39FF14', fontSize: '11px', fontWeight: 700,
                  padding: '2px 10px', borderRadius: '20px',
                  border: '1px solid rgba(57,255,20,0.3)'
                }}>✓ DONE</span>
              )}
            </div>
            <p style={{ color: 'white', fontSize: '26px', fontWeight: 800, fontFamily: 'Titillium Web', marginBottom: '6px', position: 'relative' }}>
              {formatDay(race.sessions.race)}
            </p>
            <p style={{ color: '#E8002D', fontSize: '20px', fontWeight: 700, fontFamily: 'JetBrains Mono', marginBottom: '12px', position: 'relative' }}>
              {formatLocalTime(race.sessions.race)}
            </p>
            {!isCompleted(race.sessions.race) && (
              <p style={{ color: 'rgba(232,0,45,0.7)', fontSize: '13px', position: 'relative' }}>
                ⏱ {getAwayLabel(race.sessions.race)}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HeroSection;
