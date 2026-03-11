import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import LiveRacePage from './pages/LiveRacePage';
import DriverProfilePage from './pages/DriverProfilePage';
import DriversPage from './pages/DriversPage';
import SchedulePage from './pages/SchedulePage';
import StandingsPage from './pages/StandingsPage';
import NewsArticlePage from './pages/NewsArticlePage';
import './styles/globals.css';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  // In production, this would be derived from real race data
  // For now, set to false - change to true to test the live indicator
  const [isLive, setIsLive] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <Navbar isLive={isLive} />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/live" element={<LiveRacePage />} />
              <Route path="/driver/:driverNumber" element={<DriverProfilePage />} />
              <Route path="/schedule" element={<SchedulePage />} />
              <Route path="/standings" element={<StandingsPage />} />
              <Route path="/drivers" element={<DriversPage />} />
              <Route path="/news/article/:articleId" element={<NewsArticlePage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
