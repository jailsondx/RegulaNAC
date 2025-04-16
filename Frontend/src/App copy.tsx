// App.tsx
import Rotas from './Routes/routes';
import './App.css';
import { getUserData } from './functions/storageUtils';
import { useState } from 'react';
import { Snackbar, Alert } from '@mui/material';
import SocketListenerProvider from './Utils/SocketListenerProvider';

// opcional: som de notificação
const playNotificationSound = () => {
  const audio = new Audio('/sounds/notification.wav');
  audio.play().catch((e) => console.error('Erro ao tocar som:', e));
};

function App() {
  const [userData] = useState(() => getUserData());

  /* SNACKBAR */
  const vertical = 'top';
  const horizontal = 'left';
  const [snackbarOpenSocket, setSnackbarOpenSocket] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');

  const handleSnackbarClose = (): void => {
    setSnackbarOpenSocket(false);
  };

  const showSnackbarSocket = (
    message: string,
    severity: 'success' | 'error' | 'info' | 'warning'
  ): void => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpenSocket(true);
    playNotificationSound();
  };

  const handleSocketMessage = (mensagem: string) => {
    showSnackbarSocket(mensagem, 'warning');
  };

  if (!userData) return null; // ou redireciona/login

  return (
    <SocketListenerProvider
      username={userData.login}
      tipo={userData.tipo}
      onMessage={handleSocketMessage}
    >
      <div className="App">
        <Rotas />
      </div>

      <Snackbar
        anchorOrigin={{ vertical, horizontal }}
        open={snackbarOpenSocket}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </SocketListenerProvider>
  );
}

export default App;
