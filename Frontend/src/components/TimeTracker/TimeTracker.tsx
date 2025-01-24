import React, { useEffect, useState } from 'react';

interface TimeTrackerProps {
  startTime: string; // Hora inicial
  serverTime: string; // Hora do servidor
  onTimeUpdate?: (elapsedTime: string) => void; // Callback para atualizar o tempo no pai
}

const TimeTracker: React.FC<TimeTrackerProps> = ({ startTime, serverTime, onTimeUpdate }) => {
  const [elapsedTime, setElapsedTime] = useState("");

  useEffect(() => {
    const serverNow = new Date(serverTime).getTime();
    const localNow = Date.now();
    const offset = serverNow - localNow;

    const calculateElapsedTime = () => {
      const serverStart = new Date(startTime).getTime();
      const now = Date.now() + offset;
      const diff = now - serverStart;

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      const formattedTime = `${hours}h ${minutes}m`;
      setElapsedTime(formattedTime);

      if (onTimeUpdate) {
        onTimeUpdate(formattedTime);
      }
    };

    calculateElapsedTime();
    const interval = setInterval(calculateElapsedTime, 30000);

    return () => clearInterval(interval);
  }, [startTime, serverTime, onTimeUpdate]);

  return <span>{elapsedTime}</span>;
};

export default TimeTracker;
