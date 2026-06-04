'use client';
import { useEffect, useState } from 'react';
import { getTimeUntil } from '@/lib/utils';
import { COUNTDOWN_DATE } from '@/lib/data';

export default function CountdownTimer() {
  const [time, setTime] = useState(getTimeUntil(COUNTDOWN_DATE));

  useEffect(() => {
    const interval = setInterval(() => setTime(getTimeUntil(COUNTDOWN_DATE)), 1000);
    return () => clearInterval(interval);
  }, []);

  const units = [
    { label: 'Days', value: time.days },
    { label: 'Hours', value: time.hours },
    { label: 'Mins', value: time.minutes },
    { label: 'Secs', value: time.seconds },
  ];

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {units.map(({ label, value }, i) => (
        <div key={label} className="flex items-center gap-2 sm:gap-3">
          <div className="flex flex-col items-center">
            <div
              className="rounded-xl flex items-center justify-center min-w-[52px] sm:min-w-[64px] h-14 sm:h-16 px-2"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <span
                className="text-2xl sm:text-3xl font-display font-extrabold tabular-nums"
                style={{ color: '#f5f3ff' }}
              >
                {String(value).padStart(2, '0')}
              </span>
            </div>
            <span
              className="text-[10px] font-bold uppercase tracking-widest mt-1.5"
              style={{ color: '#6f6796' }}
            >
              {label}
            </span>
          </div>
          {i < units.length - 1 && (
            <span
              className="text-xl font-bold mb-4"
              style={{ color: 'rgba(139,92,246,0.60)' }}
            >
              :
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
