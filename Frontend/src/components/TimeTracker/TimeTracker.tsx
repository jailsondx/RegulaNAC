import React, { useEffect, useState } from 'react';

interface TimeTrackerProps {
  startTime: string; // Hora inicial da API (formato ISO)
  serverTime: string; // Hora atual do servidor no momento da resposta (formato ISO)
}

const TimeTracker: React.FC<TimeTrackerProps> = ({ startTime, serverTime }) => {
  const [elapsedTime, setElapsedTime] = useState('');

  useEffect(() => {
    // Converta as datas para timestamps
    const serverNow = new Date(serverTime).getTime();
    const localNow = Date.now();
    const offset = serverNow - localNow; // Diferença entre servidor e cliente

    const calculateElapsedTime = () => {
      const serverStart = new Date(startTime).getTime();
      const now = Date.now() + offset; // Corrige o relógio local com o offset
      const diff = now - serverStart; // Diferença entre agora e o início

      const hours = Math.floor(diff / (1000 * 60 * 60)); // Total de horas
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)); // Restante em minutos

      setElapsedTime(`${hours}h ${minutes}m`);
    };

    // Atualiza o tempo imediatamente e depois a cada 30 segundos
    calculateElapsedTime();
    const interval = setInterval(calculateElapsedTime, 3000); // Atualiza a cada 30 segundos

    return () => clearInterval(interval);
  }, [startTime, serverTime]);

  return <span>{elapsedTime}</span>;
};

export default TimeTracker;
