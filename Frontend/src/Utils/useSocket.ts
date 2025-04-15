import { useEffect } from 'react';
import io from 'socket.io-client';

/* VARIÁVEL DE AMBIENTE */
const NODE_URL = import.meta.env.VITE_NODE_SERVER_URL;

/* SOCKET.IO */
const socket = io(NODE_URL);

export const useSocket = (username: string, tipo: string, onMessage: (mensagem: string) => void) => {
    let sala: string = '';

    if(tipo === 'MEDICO'){
        sala = 'Medicos';
    } else if (tipo === 'NAC' || tipo === 'AUX. ADMINISTRATIVO' || tipo === 'GERENCIA'){
        sala = 'NAC';
    }

    useEffect(() => {
      socket.emit('usuario-login', { username, sala });
  
      socket.on('nova-mensagem', (mensagem) => {
        onMessage(mensagem);
      });
  
      return () => {
        socket.off('nova-mensagem');
      };
    }, [username, sala, onMessage]);


  
    // Envia mensagem para a sala
    const enviarMensagem = (mensagem: string) => {
        let destino;
        switch (sala) {
          case 'NAC':
            destino = 'Medicos';
            break;
        case 'Medicos':
            destino = 'NAC';
            break;
          default:
            destino = sala;
            break;
        }
        socket.emit('nova-mensagem', {
        roomId: destino,
        mensagem: `${mensagem}`, // você pode formatar a mensagem como quiser
        });
    };
  
    return { enviarMensagem };
  };
  
