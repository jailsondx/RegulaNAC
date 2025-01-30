import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import './Login.css';

const NODE_URL = import.meta.env.VITE_NODE_SERVER_URL;

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post(`${NODE_URL}/api/internal/post/Login`, {
        username,
        password,
      });

      //const success = response.data.success;
      const { id_user, login, nome, tipo } = response.data.data;

      // Salvar dados no sessionStorage
      sessionStorage.setItem('id_user', id_user);
      sessionStorage.setItem('login', login);
      sessionStorage.setItem('nome', nome);
      sessionStorage.setItem('tipo', tipo);

      // Redirecionar para a rota /home
      navigate('/home');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || 'Erro ao realizar login.');
      } else {
        setError('Erro inesperado. Tente novamente mais tarde.');
      }
    }
  };

  return (
    <>
      <div className='Screen-Login'>

        <div className='div-Logo'>
          <img src='Logo/RegulaNACLogo.png' className='Logo'></img>
        </div>
        <div className="login-container">
          <h1>Login</h1>
          {error && <p className="error-message">{error}</p>}
          <form onSubmit={handleLogin}>
            <div>
              <label htmlFor="username">Usuário:</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="password">Senha:</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit">Entrar</button>
          </form>
        </div>

      </div>


    </>

  );
};

export default Login;
