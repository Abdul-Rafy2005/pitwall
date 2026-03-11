import React from 'react';

const GlassCard = ({ className = '', children }) => {
  return (
    <div
      className={`
        bg-white/5
        backdrop-blur-md
        border border-white/10
        rounded-xl
        shadow-lg
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default GlassCard;
