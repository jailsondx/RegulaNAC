import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Snackbar, Alert } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

/*IMPORT FUNCTIONS*/


/*IMPORT CSS*/
import '../Usuarios.css';
import { clearSessionStorage } from '../../../functions/storageUtils';

const NODE_URL = import.meta.env.VITE_NODE_SERVER_URL;

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  /*SNACKBAR*/
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>("success");

  /*CARREGA A SNACKBAR STATE DO UPDATE SENHA*/
  useEffect(() => {
    if (location.state?.snackbarMessage && location.state?.snackbarSeverity) {
      showSnackbar(location.state.snackbarMessage, location.state.snackbarSeverity);
    }
  }, [location.state]);

  /*ESVAZIA A SEASSONSTORAGE QUANDO O COMPONENTE É CARREGADO*/
  useEffect(() => {
    clearSessionStorage();
    console.log('Sessão Esvaziada');
  })

  /*REQUISIÇÃO DE LOGIN*/
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post(`${NODE_URL}/api/internal/post/Login`, {
        username,
        password,
      });

      //const success = response.data.success;
      const { id_user, login, nome, tipo, permissao } = response.data.data;

      if (response.data.message === 'Redefina sua senha pessoal') {
        //navigate(`/updatepassword?login=${response.data.data}`);
        navigate('/updatepassword', { state: { login: response.data.data } });
      } else {
        // Salvar dados no sessionStorage
        sessionStorage.setItem('id_user', id_user);
        sessionStorage.setItem('login', login);
        sessionStorage.setItem('nome', nome);
        sessionStorage.setItem('tipo', tipo);
        sessionStorage.setItem('permissao', permissao);

        // Redirecionar para a rota /home
        navigate('/home');
      }

    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        showSnackbar(err.response.data.message || 'Erro ao realizar login', 'error');
      } else {
        //setError('Erro inesperado. Tente novamente mais tarde.');
        showSnackbar('Erro inesperado. Tente novamente mais tarde.', 'error');
      }
    }
  };

  /*SNACKBARS*/
  const handleSnackbarClose = (): void => {
    setSnackbarOpen(false);
  };

  const showSnackbar = (
    message: string,
    severity: 'success' | 'error' | 'info' | 'warning'
  ): void => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  return (
    <>
      <div className='Screen-Login'>
        <div className='Component-Login'>

          <div className='div-esquerda BG'>
            <img className='Logo' src='/Logo/RegulaNAC-IA.png'></img>
          </div>

          <div className='div-direita'>

            <div className="login-container">
              <div className='Mobile'>
                <img className='Logo' src='/Logo/RegulaNAC-IA-WHITE.png'></img>
              </div>
              <h1>Login</h1>
              {error && <p className="error-message">{error}</p>}
              <form onSubmit={handleLogin}>
                <div>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder='Username'
                    required
                    autoComplete='off'
                  />
                </div>
                <div>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder='Password'
                    required
                  />
                </div>
                <div className='Div-Buttons Central'>
                  <button type="submit">Entrar</button>
                </div>
              </form>
            </div>
          </div>

        </div>
      </div>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
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
    </>
  );
};

export default Login;
