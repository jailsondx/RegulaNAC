import React, { useState, useEffect, FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Snackbar, Alert } from '@mui/material';
import un_origem from '../../JSON/un_origem.json';
import un_destino from '../../JSON/un_destino.json';
import { getUserData } from '../../functions/storageUtils';

import './AtualizarRegulacao.css';

const NODE_URL = import.meta.env.VITE_NODE_SERVER_URL;

interface Regulacao {
  id_user: string;
  id_regulacao: number;
  num_prontuario: number | null;
  nome_paciente: string;
  num_idade: number | null;
  un_origem: string;
  un_destino: string;
  num_regulacao: number | null;
  nome_regulador_medico: string;
  status_regulacao: string;
}

const AtualizaRegulacao: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [unidadesOrigem, setUnidadesOrigem] = useState([]);
  const [unidadesDestino, setUnidadesDestino] = useState([]);
  const location = useLocation(); // Captura o estado enviado via navegação
  const [numProntuario, setNumProntuario] = useState<number | ''>(''); // Número do prontuário recebido
  const [dadosPront, setDadosPront] = useState<Regulacao | null>(null); // Dados do prontuário retornados
  const [formData, setFormData] = useState({
    un_origem: '',
    un_destino: '',
    data_hora_solicitacao_02: '',
  }); // Estado para os campos editáveis do formulário
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info' as 'success' | 'error' | 'info' | 'warning',
  }); // Gerencia a exibição do Snackbar
  const navigate = useNavigate(); // Usado para redirecionar após a atualização

  // Captura o número do prontuário ao montar o componente
  useEffect(() => {
    const { num_prontuario } = location.state || {};
    if (num_prontuario) {
      setNumProntuario(parseInt(num_prontuario, 10));
    }
  }, [location]);

  // Carregar os dados do arquivo JSON
  useEffect(() => {
    setUnidadesOrigem(un_origem);
    setUnidadesDestino(un_destino);
  }, []);

  // Busca os dados do prontuário pelo número fornecido
  useEffect(() => {
    if (!numProntuario) return;

    const fetchProntuario = async () => {
      try {
        const response = await axios.get(`${NODE_URL}/api/internal/get/VerificaProntuario`, {
          params: { num_prontuario: numProntuario },
        });
        const data = response.data.data || null;
        setDadosPront(data);
        console.log(data);

        if (data) {
          // Preenche os campos do formulário com os dados recebidos
          setFormData({
            un_origem: data.un_origem || '',
            un_destino: data.un_destino || '',
            data_hora_solicitacao_02: data.data_hora_solicitacao_02 || '',
          });
        }
      } catch (error) {
        console.error('Erro ao carregar os dados do prontuário:', error);
        setSnackbar({
          open: true,
          message: 'Erro ao carregar os dados do prontuário.',
          severity: 'error',
        });
      }
    };

    fetchProntuario();
  }, [numProntuario]);

  // Busca os dados do usuário do sessionStorage ao carregar o componente
  useEffect(() => {
    const data = getUserData();
    setUserData(data);
  }, []);

  // Fecha o Snackbar
  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  // Atualiza os campos do formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  // Submete os dados atualizados para o backend
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.put(`${NODE_URL}/api/internal/put/AtualizaRegulacao`, {
        id_user: userData?.id_user, // ID do usuário logado
        id_regulacao: dadosPront?.id_regulacao, // ID da regulação a ser atualizada
        nome_regulador_nac: userData?.nome, // Nome do regulador NAC
        num_prontuario: numProntuario, // Número do prontuário
        num_regulacao: dadosPront?.num_regulacao, // Número da regulação
        ...formData, // Dados atualizados do formulário
      });

      // Exibe mensagem de sucesso e redireciona
      setSnackbar({
        open: true,
        message: response.data.message || 'Regulação atualizada com sucesso.',
        severity: 'success',
      });
      navigate('/ListaRegulacoes', {
        state: {
          snackbar: {
            open: true,
            severity: 'success',
            message: 'Regulação atualizada com sucesso!',
          },
        },
      });
    } catch (error: any) {
      console.error('Erro ao atualizar regulação:', error);

      // Exibe mensagem de erro
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Erro ao atualizar regulação. Tente novamente.',
        severity: 'error',
      });
    }
  };

  return (
    <div>
      <div>
        <label className="Title-Form">Atualizar Regulação</label>
      </div>
      {dadosPront ? (
        <form onSubmit={handleSubmit} className="ComponentForm">
          <div className='DadosPaciente-Border'>
            <label className='TitleDadosPaciente'>Dados Paciente</label>
            <div className='Div-DadosPaciente RegulacaoPaciente'>
              <label>Paciente: {dadosPront.nome_paciente}</label>
              <label>Regulação: {dadosPront.num_regulacao}</label>
              <label>Un. Origem: {dadosPront.un_origem}</label>
              <label>Un. Destino: {dadosPront.un_destino}</label>

            </div>
            <div className='Div-DadosMedico'>
              <label>Médico Regulador: {dadosPront.nome_regulador_medico}</label>
            </div>
          </div>

          <div className="StepContent">
            <div className="line-StepContent">
              <label>Unidade Origem:</label>
              <select
                name="un_origem"
                value={formData.un_origem}
                onChange={handleChange}
                required
              >
                <option value="">Selecione uma unidade</option>
                {unidadesOrigem.map((unidadeOrigem) => (
                  <option key={unidadeOrigem.value} value={unidadeOrigem.value}>
                    {unidadeOrigem.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="line-StepContent">
              <label>Unidade Destino:</label>
              <select
                name="un_destino"
                value={formData.un_destino}
                onChange={handleChange}
                required
              >
                <option value="">Selecione uma unidade</option>
                {unidadesDestino.map((unidadeDestino) => (
                  <option key={unidadeDestino.value} value={unidadeDestino.value}>
                    {unidadeDestino.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="line-StepContent">
              <label>Data e Hora da Nova Solicitação:</label>
              <input
                type="datetime-local"
                name="data_hora_solicitacao_02"
                value={formData.data_hora_solicitacao_02}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <button type="submit" className="SubmitButton">Atualizar</button>
        </form>
      ) : (
        <p>Carregando dados do prontuário...</p>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>

    </div>
  );
};

export default AtualizaRegulacao;