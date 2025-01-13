import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const NODE_URL = import.meta.env.VITE_NODE_SERVER_URL;

const Cadastro: React.FC = () => {
  const [login, setLogin] = useState('');
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [tipo, setTipo] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await axios.post(`${NODE_URL}/api/internal/post/Cadastro`, {
        login,
        nome,
        cpf,
        senha,
        tipo,
        ativo: true, // Define o valor de ativo como true por padrão
      });

      setSuccess('Usuário cadastrado com sucesso!');
      setTimeout(() => {
        //navigate('/login'); // Redireciona para a página de login após o cadastro
      }, 2000);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || 'Erro ao realizar o cadastro.');
      } else {
        setError('Erro inesperado. Tente novamente mais tarde.');
      }
    }
  };

  return (
    <div className="cadastro-container">
      <h1>Cadastro</h1>
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}
      <form onSubmit={handleCadastro}>
        <div>
          <label htmlFor="login">Login:</label>
          <input
            type="text"
            id="login"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="nome">Nome Completo:</label>
          <input
            type="text"
            id="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="cpf">CPF:</label>
          <input
            type="text"
            id="cpf"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="senha">Senha:</label>
          <input
            type="password"
            id="senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="tipo">Tipo:</label>
          <select
            id="tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            required
          >
            <option value="">Selecione o tipo</option>
            <option value="Regulador">Regulador</option>
            <option value="Medico">Médico</option>
            <option value="Gerencia">Gerência</option>
          </select>
        </div>
        <button type="submit">Cadastrar</button>
      </form>
    </div>
  );
};

export default Cadastro;
