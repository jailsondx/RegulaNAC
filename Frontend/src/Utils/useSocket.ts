import { useEffect, useRef } from 'react';
import io from 'socket.io-client';

const NODE_URL = import.meta.env.VITE_NODE_SERVER_URL;
const socket = io(NODE_URL, { autoConnect: true });

export const useSocket = (
  username: string,
  tipo: string,
  onMessage: (mensagem: string) => void
) => {
  const salaRef = useRef('');
  const messageHandlerRef = useRef<(mensagem: string) => void>();

  // Define a sala apenas uma vez
  useEffect(() => {
    if (tipo === 'MEDICO') {
      salaRef.current = 'Medicos';
    } else if (
      tipo === 'NAC' ||
      tipo === 'AUX. ADMINISTRATIVO' ||
      tipo === 'GERENCIA'
    ) {
      salaRef.current = 'NAC';
    }

    if (username && salaRef.current) {
      socket.emit('usuario-login', {
        username,
        sala: salaRef.current,
      });
    }

    // Armazena o callback atual
    messageHandlerRef.current = onMessage;

    const handleMessage = (mensagem: string) => {
      messageHandlerRef.current?.(mensagem);
    };

    socket.on('nova-mensagem', handleMessage);

    return () => {
      socket.off('nova-mensagem', handleMessage);
    };
  }, []); // <- Executa apenas uma vez

  const enviarMensagem = (mensagem: string) => {
    let destino;
    switch (salaRef.current) {
      case 'NAC':
        destino = 'Medicos';
        break;
      case 'Medicos':
        destino = 'NAC';
        break;
      default:
        destino = salaRef.current;
        break;
    }

    socket.emit('nova-mensagem', {
      roomId: destino,
      mensagem,
    });
  };

  return { enviarMensagem };
};
