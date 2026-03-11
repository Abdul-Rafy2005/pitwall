// F1 2025 Team Colors Configuration
export const teamColors = {
  redbull: {
    name: 'Red Bull Racing',
    primary: '#3671C6',
    secondary: '#1E3A8A',
  },
  ferrari: {
    name: 'Scuderia Ferrari',
    primary: '#E8002D',
    secondary: '#FFF500',
  },
  mercedes: {
    name: 'Mercedes-AMG Petronas',
    primary: '#27F4D2',
    secondary: '#000000',
  },
  mclaren: {
    name: 'McLaren F1 Team',
    primary: '#FF8000',
    secondary: '#47C7FC',
  },
  astonmartin: {
    name: 'Aston Martin Aramco',
    primary: '#229971',
    secondary: '#00594F',
  },
  alpine: {
    name: 'BWT Alpine F1 Team',
    primary: '#FF87BC',
    secondary: '#2293D1',
  },
  williams: {
    name: 'Williams Racing',
    primary: '#64C4FF',
    secondary: '#041E42',
  },
  visa_rb: {
    name: 'Visa Cash App RB',
    primary: '#6692FF',
    secondary: '#1634CB',
  },
  haas: {
    name: 'MoneyGram Haas F1 Team',
    primary: '#B6BABD',
    secondary: '#E6002D',
  },
  sauber: {
    name: 'Stake F1 Team',
    primary: '#00E701',
    secondary: '#1B1B1B',
  },
  cadillac: {
    name: 'Cadillac Formula 1 Team',
    primary: '#8C8C8C',
    secondary: '#1A1A1A',
  },
};

// Helper function to get team colors by team name or key
export const getTeamColors = (teamKey) => {
  return teamColors[teamKey.toLowerCase()] || teamColors.redbull;
};

export default teamColors;
