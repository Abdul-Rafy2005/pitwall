import React, { useState, useEffect } from 'react';
import GlassCard from '../shared/GlassCard';

const RaceCountdown = () => {
  // 2025 F1 Calendar with session times
  const races = [
    {
      round: 1,
      country: 'Australia',
      name: 'Australian GP',
      flag: '🇦🇺',
      circuit: 'Albert Park Circuit',
      short: 'AU',
      sessions: {
        practice1: 'Mar 14 2025 01:30 UTC',
        practice2: 'Mar 14 2025 05:00 UTC',
        practice3: 'Mar 15 2025 01:30 UTC',
        qualifying: 'Mar 15 2025 05:00 UTC',
        race: 'Mar 16 2025 04:00 UTC',
      },
    },
    {
      round: 2,
      country: 'China',
      name: 'Chinese GP',
      flag: '🇨🇳',
      circuit: 'Shanghai International Circuit',
      short: 'CN',
      sessions: {
        practice1: 'Mar 21 2025 03:30 UTC',
        sprintQualifying: 'Mar 21 2025 07:30 UTC',
        sprint: 'Mar 22 2025 03:00 UTC',
        qualifying: 'Mar 22 2025 07:00 UTC',
        race: 'Mar 23 2025 07:00 UTC',
      },
    },
    {
      round: 3,
      country: 'Japan',
      name: 'Japanese GP',
      flag: '🇯🇵',
      circuit: 'Suzuka International Racing Course',
      short: 'JP',
      sessions: {
        practice1: 'Apr 4 2025 02:30 UTC',
        practice2: 'Apr 4 2025 06:00 UTC',
        practice3: 'Apr 5 2025 02:30 UTC',
        qualifying: 'Apr 5 2025 06:00 UTC',
        race: 'Apr 6 2025 05:00 UTC',
      },
    },
    {
      round: 4,
      country: 'Bahrain',
      name: 'Bahrain GP',
      flag: '🇧🇭',
      circuit: 'Bahrain International Circuit',
      short: 'BH',
      sessions: {
        practice1: 'Apr 11 2025 11:30 UTC',
        practice2: 'Apr 11 2025 15:00 UTC',
        practice3: 'Apr 12 2025 11:30 UTC',
        qualifying: 'Apr 12 2025 15:00 UTC',
        race: 'Apr 13 2025 15:00 UTC',
      },
    },
    {
      round: 5,
      country: 'Saudi Arabia',
      name: 'Saudi Arabian GP',
      flag: '🇸🇦',
      circuit: 'Jeddah Corniche Circuit',
      short: 'SA',
      sessions: {
        practice1: 'Apr 18 2025 13:30 UTC',
        practice2: 'Apr 18 2025 17:00 UTC',
        practice3: 'Apr 19 2025 13:30 UTC',
        qualifying: 'Apr 19 2025 17:00 UTC',
        race: 'Apr 20 2025 17:00 UTC',
      },
    },
  ];

  // Get next session
  const getNextSession = () => {
    const now = new Date();
    const sessionOrder = [
      'practice1',
      'practice2',
      'practice3',
      'sprintQualifying',
      'sprint',
      'qualifying',
      'race',
    ];

    for (const race of races) {
      for (const sessionKey of sessionOrder) {
        if (race.sessions[sessionKey]) {
          const sessionDate = new Date(race.sessions[sessionKey]);
          if (sessionDate > now) {
            return {
              race,
              sessionKey,
              sessionDate,
              sessionName: sessionKey
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, (str) => str.toUpperCase())
                .trim(),
            };
          }
        }
      }
    }

    return {
      race: races[0],
      sessionKey: 'practice1',
      sessionDate: new Date(races[0].sessions.practice1),
      sessionName: 'Practice 1',
    };
  };

  const nextSession = getNextSession();
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

  return (
    <div className="bg-[#0a0a0a] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="font-titillium font-bold text-3xl text-white mb-2">
            {nextSession.race.name}
          </h2>
          <p className="text-white/60 text-sm">
            {nextSession.race.flag} {nextSession.race.circuit}
          </p>
        </div>

        <div className="text-center mb-8">
          <p className="text-[#E8002D] font-titillium font-semibold text-sm uppercase tracking-wider mb-4">
            {nextSession.sessionName} starts in
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            {[
              { value: timeLeft.days, label: 'Days' },
              { value: timeLeft.hours, label: 'Hours' },
              { value: timeLeft.minutes, label: 'Minutes' },
              { value: timeLeft.seconds, label: 'Seconds' },
            ].map((unit) => (
              <GlassCard key={unit.label} className="px-6 py-4 min-w-[100px] flex flex-col items-center">
                <span className="font-jetbrains text-4xl font-bold text-white">
                  {String(unit.value).padStart(2, '0')}
                </span>
                <span className="text-white/60 text-sm uppercase tracking-wider mt-2">
                  {unit.label}
                </span>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RaceCountdown;
