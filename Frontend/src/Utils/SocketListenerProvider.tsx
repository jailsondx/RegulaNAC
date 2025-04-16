// src/providers/SocketListenerProvider.tsx
import { useSocket } from './useSocket';

interface Props {
  username: string;
  tipo: string;
  onMessage: (mensagem: string) => void;
  children: React.ReactNode;
}

const SocketListenerProvider: React.FC<Props> = ({ username, tipo, onMessage, children }) => {
  useSocket(username, tipo, onMessage); // isso mantém o socket vivo

  return <>{children}</>;
};

export default SocketListenerProvider;
