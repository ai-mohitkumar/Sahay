import React, { useState, useEffect } from 'react';

export const CurrentTimeCursor: React.FC = () => {
  const [currentMinutes, setCurrentMinutes] = useState(() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentMinutes(now.getHours() * 60 + now.getMinutes());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const startOfDayMins = 6 * 60; // 06:00
  const endOfDayMins = 24 * 60;  // 24:00
  const totalDayMins = endOfDayMins - startOfDayMins;

  if (currentMinutes < startOfDayMins || currentMinutes > endOfDayMins) {
    return null;
  }

  const topPct = ((currentMinutes - startOfDayMins) / totalDayMins) * 100;
  const hours = Math.floor(currentMinutes / 60);
  const mins = currentMinutes % 60;
  const timeFormatted = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;

  return (
    <div
      className="absolute left-0 right-0 z-30 pointer-events-none flex items-center transition-all duration-500"
      style={{ top: `${topPct}%` }}
    >
      <div className="bg-rose-500 text-white font-mono text-[10px] font-bold px-1.5 py-0.5 rounded shadow-md -ml-1 flex items-center space-x-1">
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
        <span>{timeFormatted}</span>
      </div>
      <div className="flex-1 h-[2px] bg-gradient-to-r from-rose-500 via-rose-500/80 to-transparent shadow-sm"></div>
    </div>
  );
};
