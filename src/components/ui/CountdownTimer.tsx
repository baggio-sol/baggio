'use client';
import { useEffect, useState } from 'react';
import { getTimeUntil } from '@/lib/utils';
import { COUNTDOWN_DATE } from '@/lib/data';

export default function CountdownTimer() {
  const [time, setTime] = useState(getTimeUntil(COUNTDOWN_DATE));

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getTimeUntil(COUNTDOWN_DATE));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const units = [
    { label: 'Days', value: time.days },
    { label: 'Hours', value: time.hours },
    { label: 'Minutes', value: time.minutes },
    { label: 'Seconds', value: time.seconds },
  ];

  return (
    <div className="flex gap-3 md:gap-5">
      {units.map(({ label, value }) => (
        <div key={label} className="flex flex-col items-center">
          <div className="bg-gradient-to-b from-gray-700 to-gray-800 border border-gray-600/50 rounded-xl px-3 md:px-5 py-2 md:py-3 min-w-[60px] md:min-w-[80px] text-center shadow-lg">
            <span className="text-2xl md:text-4xl font-black text-white tabular-nums">
              {String(value).padStart(2, '0')}
            </span>
          </div>
          <span className="text-xs text-gray-400 mt-1.5 font-medium">{label}</span>
        </div>
      ))}
    </div>
  );
}
