import React, { useState, useEffect, FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Snackbar, Alert } from '@mui/material';
import { getUserData } from '../../functions/storageUtils';
import { formatDateToPtBr } from '../../functions/DateTimes';

import './AtualizarRegulacao.css';

const NODE_URL = import.meta.env.VITE_NODE_SERVER_URL;

interface Regulacao {
  id_user: string;
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
  status_regulacao: string;
}

const AtualizaRegulacao: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const location = useLocation();
  const [numProntuario, setNumProntuario] = useState<number | ''>('');
  const [dadosPront, setDadosPront] = useState<Regulacao | null>(null);
  const [formData, setFormData] = useState({
    un_origem: '',
    un_destino: '',
    data_hora_solicitacao_02: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' as 'success' | 'error' | 'info' | 'warning' });
  const navigate = useNavigate();

  useEffect(() => {
    const { num_prontuario } = location.state || {};
    if (num_prontuario) {
      setNumProntuario(parseInt(num_prontuario, 10));
    }
  }, [location]);

  useEffect(() => {
    if (!numProntuario) return;

    const fetchProntuario = async () => {
      try {
        const response = await axios.get(`${NODE_URL}/api/internal/get/VerificaProntuario`, {
          params: { num_prontuario: numProntuario },
        });
        const data = response.data.data || null;
        setDadosPront(data);

        if (data) {
          // Pré-carrega os valores dos selects no estado formData
          setFormData({
            un_origem: data.un_origem || '',
            un_destino: data.un_destino || '',
            data_hora_solicitacao_02: data.data_hora_solicitacao_02 || '',
          });
        }
        setError(null);
      } catch (error: any) {
        console.error('Erro ao carregar regulações:', error);
        setError('Erro ao carregar os dados do prontuário.');
      }
    };

    fetchProntuario();
  }, [numProntuario]);

  //Pega dados do SeassonStorage User
  useEffect(() => {
    const data = getUserData();
    setUserData(data);
  }, []);

  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const AtualizaRegulacaoAPI = await axios.put(`${NODE_URL}/api/internal/put/AtualizaRegulacao`, {
        id_user: userData?.id_user, // Use o operador de encadeamento opcional para evitar erros se `userData` for `null`
        num_prontuario: numProntuario,
        num_regulacao: dadosPront.num_regulacao,
        ...formData,
      });

      const response = AtualizaRegulacaoAPI.data;

      // Exibir mensagem de sucesso
      setSnackbar({
        open: true,
        message: response.message || 'Regulação cadastrada com sucesso',
        severity: 'success',
      });

      navigate('/Regulacoes', {
        state: {
          snackbar: {
            open: true,
            severity: 'success', // ou 'error', 'info', etc.
            message: 'Regulação atualizada com sucesso!',
          },
        },
      });

    } catch (error) {
      console.error('Erro ao atualizar regulação:', error);

      // Exibir mensagem de erro
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Erro ao cadastrar regulação. Por favor, tente novamente.',
        severity: 'error',
      });
    }
  };

  return (
    <div>
      <div>
        <label className="Title-Form">Atualizar Regulação</label>
      </div>



      {error && <p style={{ color: 'red' }}>{error}</p>}
      {dadosPront ? (
        <form onSubmit={handleSubmit} className="ComponentForm">
          <div className='DadosPaciente-Border'>
            <label className='TitleDadosPaciente'>Dados Paciente</label>
            <div className='Div-DadosPaciente RegulacaoMedica-Aprovada'>
              <label>Paciente: {dadosPront.nome_paciente}</label>
              <label>Regulação: {dadosPront.num_regulacao}</label>
              <label>Un. Origem: {dadosPront.un_origem}</label>
              <label>Un. Destino: {dadosPront.un_destino}</label>

            </div>
            <div className='Div-DadosMedico RegulacaoMedica-Aprovada'>
              <label>Médico de Destino: {dadosPront.nome_regulador_medico}</label>
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
                <option value="">Selecione uma unidade</option>
                <option value="AVC AG">AVC AG</option>
                <option value="ACV SUB">ACV SUB</option>
                <option value="CCI">CCI</option>
                <option value="CCII">CCII</option>
                <option value="CCIII">CCIII</option>
                <option value="CMI">CMI</option>
                <option value="CMII">CMII</option>
                <option value="CO">CO</option>
                <option value="COII">COII</option>
                <option value="COIII">COIII</option>
                <option value="CPN">CPN</option>
                <option value="INTER I">INTER I</option>
                <option value="OIA II">OIA II</option>
                <option value="UCE">UCE</option>
                <option value="UTI I">UTI I</option>
                <option value="UTI II">UTI II</option>
                <option value="UTI III">UTI III</option>
                <option value="UTI IV">UTI IV</option>
                <option value="UTI PED">UTI PED</option>
                <option value="MED">MED</option>
                <option value="OBA CIR">OBA CIR</option>
                <option value="OBA CP">OBA CP</option>
                <option value="OBA TD">OBA TD</option>
                <option value="OBA VAS">OBA VAS</option>
                <option value="OBA CL">OBA CL</option>
                <option value="PI">PI</option>
                <option value="PO">PO</option>
                <option value="RA">RA</option>
                <option value="CCG">CCG</option>
                <option value="EMERG">EMERG</option>
                <option value="TRIAGEM">TRIAGEM</option>
                <option value="SCMS">SCMS</option>
                <option value="EXTERNO REG">EXTERNO REG</option>
                <option value="EXTERNA ARTERIO">EXTERNA ARTERIO</option>
                <option value="OBP CP">OBP CP</option>
                <option value="AMB">AMB</option>
                <option value="HEMO">HEMO</option>
                <option value="HC-EXTERNO">HC-EXTERNO</option>
                <option value="EXTERNA EMBOL.">EXTERNA EMBOL.</option>
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
                <option value="AVC">AVC</option>
                <option value="Clinica Cirugica 1 - Vascular">Clinica Cirugica 1 - Vascular</option>
                <option value="Clinica Cirugica 2 - Geral">Clinica Cirugica 2 - Geral</option>
                <option value="Clinica Cirugica 3 - Neuro">Clinica Cirugica 3 - Neuro</option>
                <option value="Clinica Medica">Clinica Medica</option>
                <option value="UCE">UCE</option>
                <option value="UTI Adulto">UTI Adulto</option>
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
        !error && <p>Carregando dados do prontuário...</p>
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
