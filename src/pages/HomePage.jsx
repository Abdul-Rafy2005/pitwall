import React from 'react';
import HeroSection from '../components/home/HeroSection';
import HighlightsGrid from '../components/home/HighlightsGrid';
import DriverStandings from '../components/home/DriverStandings';
// import AICommentaryTicker from '../components/home/AICommentaryTicker';
import EditorsPicks from '../components/home/EditorsPicks';

const HomePage = () => {
  return (
    <div>
      <HeroSection />
      <HighlightsGrid />
      <DriverStandings />
      {/* <AICommentaryTicker /> */}
      <EditorsPicks />
    </div>
  );
};

export default HomePage;
