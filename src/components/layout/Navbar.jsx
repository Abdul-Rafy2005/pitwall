import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const PitwallLogo = () => {
  return (
    <div className="flex items-center gap-3">
      {/* SVG Logo with PW Monogram */}
      <svg width="40" height="40" viewBox="0 0 40 40" className="flex-shrink-0">
        {/* P */}
        <text
          x="8"
          y="28"
          fontSize="24"
          fontWeight="bold"
          fill="white"
          fontFamily="Titillium Web"
        >
          P
        </text>
        {/* W with Chevron arrow */}
        <g>
          <text x="18" y="28" fontSize="24" fontWeight="bold" fill="#E8002D" fontFamily="Titillium Web">
            W
          </text>
          {/* Chevron arrow pointing right */}
          <line x1="32" y1="18" x2="38" y2="24" stroke="#E8002D" strokeWidth="2" />
          <line x1="38" y1="24" x2="32" y2="30" stroke="#E8002D" strokeWidth="2" />
        </g>
      </svg>

      {/* Text Logo */}
      <div className="flex items-baseline gap-0">
        <span className="font-titillium font-bold text-lg text-white">PIT</span>
        <span className="font-titillium font-bold text-lg text-[#E8002D]">WALL</span>
      </div>

      {/* Red underline */}
      <div className="absolute bottom-3 left-0 right-0 h-0.5 bg-gradient-to-r from-[#E8002D] to-transparent" style={{ width: '80px' }} />
    </div>
  );
};

const Navbar = ({ isLive = false }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Schedule', path: '/schedule' },
    { name: 'Standings', path: '/standings' },
    { name: 'Live', path: '/live' },
    { name: 'Drivers', path: '/drivers' },
  ];

  const isActivePath = (path) => location.pathname === path;

  return (
    <nav 
      className="sticky top-0 z-50"
      style={{
        backgroundColor: scrolled ? 'rgba(10, 10, 10, 0.5)' : 'rgba(0, 0, 0, 0)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: scrolled ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
        transition: 'all 0.4s ease'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo with Live Indicator */}
          <Link to="/" className="relative flex items-center gap-3 group">
            <PitwallLogo />
            {isLive && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E8002D] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E8002D]"></span>
              </span>
            )}
          </Link>

          {/* Center: Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="relative py-2 px-1 transition-all duration-300 font-titillium uppercase"
                style={{
                  fontSize: '13px',
                  letterSpacing: '0.08em',
                  color: isActivePath(link.path) ? '#ffffff' : 'rgba(255,255,255,0.82)',
                  fontWeight: 700,
                  textShadow: isActivePath(link.path) ? '0 0 16px rgba(232,0,45,0.35)' : 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.textShadow = '0 0 16px rgba(255,255,255,0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = isActivePath(link.path) ? '#ffffff' : 'rgba(255,255,255,0.82)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.textShadow = isActivePath(link.path) ? '0 0 16px rgba(232,0,45,0.35)' : 'none';
                }}
              >
                <span
                  className="absolute inset-x-0 -bottom-1 h-[2px] rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, rgba(232,0,45,0.95), rgba(232,0,45,0.15))',
                    opacity: isActivePath(link.path) ? 1 : 0,
                    transition: 'opacity 0.25s ease'
                  }}
                />
                {link.name}
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E8002D]"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  style={{ originX: 0 }}
                />
                {isActivePath(link.path) && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E8002D]"
                    layoutId="activeNavUnderline"
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Right: Live Now Badge */}
          <div className="hidden md:flex items-center">
            <AnimatePresence>
              {isLive && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative"
                >
                  <div className="px-4 py-2 bg-[#E8002D] rounded-full font-titillium font-bold text-sm text-white uppercase tracking-wider live-pulse">
                    Live Now
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile: Hamburger Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden flex flex-col justify-center items-center w-10 h-10 space-y-1.5 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] transition-colors"
            aria-label="Toggle menu"
          >
            <motion.span
              animate={isMobileMenuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
              className="block w-6 h-0.5 bg-white"
            />
            <motion.span
              animate={isMobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
              className="block w-6 h-0.5 bg-white"
            />
            <motion.span
              animate={isMobileMenuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
              className="block w-6 h-0.5 bg-white"
            />
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden border-t border-white/[0.08]"
            style={{
              background: 'rgba(10,10,10,0.95)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)'
            }}
          >
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block py-3 px-4 rounded-xl font-titillium font-semibold transition-all duration-300 ${
                    isActivePath(link.path)
                      ? 'bg-[#E8002D] text-white shadow-[0_0_20px_rgba(232,0,45,0.35)]'
                      : 'text-white/80 border border-white/10 hover:bg-white/5 hover:text-white hover:border-[#E8002D]/60'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              {isLive && (
                <div className="pt-2">
                  <div className="px-4 py-3 bg-[#E8002D] rounded-lg font-titillium font-bold text-sm text-white uppercase tracking-wider text-center live-pulse">
                    Live Now
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        @keyframes live-pulse {
          0%, 100% {
            opacity: 1;
            box-shadow: 0 0 20px rgba(232, 0, 45, 0.5);
          }
          50% {
            opacity: 0.85;
            box-shadow: 0 0 30px rgba(232, 0, 45, 0.8);
          }
        }
        .live-pulse {
          animation: live-pulse 2s ease-in-out infinite;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
