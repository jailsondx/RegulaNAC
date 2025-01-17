import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { FcFullTrash, FcInspection } from "react-icons/fc";
import { Snackbar, Alert } from '@mui/material';
import './Regulacoes.css'

const NODE_URL = import.meta.env.VITE_NODE_SERVER_URL;

interface Regulacao {
  id_regulacao: number;
  num_prontuario: number | null;
  nome_paciente: string;
  num_idade: number | null;
  un_origem: string;
  un_destino: string;
  num_prioridade: number | null;
  data_hora_solicitacao_01: string;
  data_hora_solicitacao_02: string;
  nome_regulador_nac: string;
  num_regulacao: number | null;
  nome_regulador_medico: string;
  data_hora_acionamento_medico: string;
}
const Regulacao: React.FC = () => {
  const [regulacoes, setRegulacoes] = useState<Regulacao[]>([]); // Tipo do estado
  const location = useLocation();
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' as 'success' | 'error' | 'info' | 'warning' });
  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  useEffect(() => {
    const fetchRegulacoes = async () => {
      try {
        const response = await axios.get(`${NODE_URL}/api/internal/get/ListaRegulacoesPendentes`);

        if (response.data && Array.isArray(response.data.data)) {
          setRegulacoes(response.data.data);
        } else {
          console.error('Dados inesperados:', response.data);
        }
      } catch (error: any) {
        console.error('Erro ao carregar regulações:', error);
        setRegulacoes([]); // Garante que regulacoes seja sempre um array
      }
    };

    fetchRegulacoes();
  }, []);

  useEffect(() => {
    if (location.state?.snackbar) {
      setSnackbar(location.state.snackbar);
    }
  }, [location]);

  const calcularTempoDeEspera = (dataHoraSolicitacao: string, dataHoraAtual: string) => {
    const dateSolicitacao = new Date(dataHoraSolicitacao);
    const dateAtual = new Date(dataHoraAtual);

    const diffInMilliseconds = dateAtual.getTime() - dateSolicitacao.getTime();

    const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60)); // Horas completas
    const diffInMinutes = Math.floor((diffInMilliseconds % (1000 * 60 * 60)) / (1000 * 60)); // Minutos restantes

    return `${diffInHours}h ${diffInMinutes}min`;
  };


  const obterDataHoraAtual = () => {
    const now = new Date();
    return now.toISOString(); // Retorna a data e hora atual no formato ISO (por exemplo: "2024-12-30T16:00:00Z")
  };

  const NovaRegulacao = () => {
    navigate('/NovaRegulacao');
  }


  return (
    <>
      <div className='Header-ListaRegulaçoes'>
        <label className='Title-Tabela'>Lista de Regulações</label>
        <button type="button" onClick={NovaRegulacao}>+ Nova Regulação</button>
      </div>

      <div>
        <table className='Table-Regulacoes'>
          <thead>
            <tr>
              <th>Pront.</th>
              <th>Nome Paciente</th>
              <th>Id.</th>
              <th>Num. Regulação</th>
              <th>Un. Origem</th>
              <th>Un. Destino</th>
              <th>Prio.</th>
              <th>Solicitação Recente</th>
              <th>Data/Hora Acionamento Médico</th>
              <th>Tempo de Espera</th>
              <th>Ajustes</th>
            </tr>
          </thead>
          <tbody>
            {regulacoes.map(regulacao => (
              <tr key={regulacao.id_regulacao}>
                <td>{regulacao.num_prontuario}</td>
                <td>{regulacao.nome_paciente}</td>
                <td>{regulacao.num_idade} Anos</td>
                <td>{regulacao.num_regulacao}</td>
                <td>{regulacao.un_origem}</td>
                <td>{regulacao.un_destino}</td>
                <td>{regulacao.num_prioridade}</td>
                <td>{new Date(regulacao.data_hora_solicitacao_02).toLocaleString()}</td>
                <td>{new Date(regulacao.data_hora_acionamento_medico).toLocaleString()}</td>
                <td>{calcularTempoDeEspera(regulacao.data_hora_solicitacao_02, obterDataHoraAtual())}</td>
                <td className='td-Icons'>
                  <FcInspection className='Icons-Regulacao' />
                  <FcFullTrash className='Icons-Regulacao' />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};


export default Regulacao;