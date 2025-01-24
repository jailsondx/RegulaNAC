import React, { useState, useEffect, FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Snackbar, Alert } from '@mui/material';
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