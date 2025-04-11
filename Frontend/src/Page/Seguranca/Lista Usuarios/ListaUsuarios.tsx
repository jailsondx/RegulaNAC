import React, { useState, useEffect } from 'react';
import axios from 'axios';

/*IMPORT CSS*/
import './ListaUsuarios.css';

const NODE_URL = import.meta.env.VITE_NODE_SERVER_URL;

interface Usuario {
  id: number;
  login: string;
  nome: string;
  tipo: string;
}

const ListaUsuarios: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${NODE_URL}/api/seguranca/get/ListaUsuarios`);
        setUsuarios(response.data);
        setError(null);
      } catch (error) {
        setError('Erro ao carregar a lista de usuários. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsuarios();
  }, []);

  return (
    <div className="lista-usuarios-container">
      <h1 className="lista-usuarios-title">Lista de Usuários</h1>
      {loading ? (
        <p className="loading-message">Carregando...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : (
        <table className="usuarios-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Login</th>
              <th>Nome</th>
              <th>Tipo</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.id}>
                <td>{usuario.id}</td>
                <td>{usuario.login}</td>
                <td>{usuario.nome}</td>
                <td>{usuario.tipo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ListaUsuarios;