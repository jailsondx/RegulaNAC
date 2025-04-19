import React, { useState, useEffect, FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AxiosError } from 'axios';
import { Snackbar, Alert } from '@mui/material';

/*IMPORT INTERFACES*/
import { DadosPacienteData } from "../../../interfaces/DadosPaciente.ts";
import { UpdateRegulacaoData, PartialUpdateRegulacaoData } from '../../../interfaces/Regulacao.ts';
import { UnidadeData } from '../../../interfaces/Unidade.ts';
import { UserData } from '../../../interfaces/UserData.ts';

/*IMPORT COMPONENTS*/
import DadosPaciente from '../../Dados Paciente/DadosPaciente.tsx';

/*IMPORT FUNCTIONS*/
import { getUserData } from '../../../functions/storageUtils.ts';
import { getDay, getMonth, getYear } from '../../../functions/DateTimes.ts';

/*IMPORT CSS*/
import './AtualizarRegulacao.css';

/*IMPORT JSON*/
import un_origem from '../../../JSON/un_origem.json';
import un_destino from '../../../JSON/un_destino.json';

/*IMPORT VARIAVEIS DE AMBIENTE*/
const NODE_URL = import.meta.env.VITE_NODE_SERVER_URL;

const initialFormData: UpdateRegulacaoData = {
  id_user: '',
  num_prontuario: null,
  un_origem: '',
  un_destino: '',
  num_leito: null,
  data_hora_solicitacao_02: '',
  link: '',
};


const AtualizaRegulacao: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [file, setFile] = useState<File>();
  const [unidadesOrigem, setUnidadesOrigem] = useState<UnidadeData[]>([]);
  const [unidadesDestino, setUnidadesDestino] = useState<UnidadeData[]>([]);
  const location = useLocation(); // Captura o estado enviado via navegação
  const [numProntuario, setNumProntuario] = useState<number | ''>(''); // Número do prontuário recebido
  const [dadosPaciente, setDadosPaciente] = useState<DadosPacienteData>();
  const [formData, setFormData] = useState<PartialUpdateRegulacaoData>(initialFormData);

  /*SNACKBAR*/
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');

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
        setDadosPaciente(data);

        if (data) {
          // Preenche os campos do formulário com os dados recebidos
          setFormData({
            un_origem: data.un_origem,
            un_destino: data.un_destino,
            data_hora_solicitacao_02: ''
          });
        }
      } catch (error: unknown) {
        if (error instanceof AxiosError && error.response) {
          const { status, data } = error.response;

          // Tratar diferentes status de erro
          switch (status) {
            case 400:
              showSnackbar(data?.message || 'Parâmetros inválidos. Verifique os dados.', 'error');
              break;
            case 404:
              showSnackbar(data?.message || 'Prontuário não encontrado.', 'error');
              break;
            case 500:
              showSnackbar(data?.message || 'Erro no servidor ao buscar o prontuário.', 'error');
              break;
            default:
              showSnackbar(data?.message || 'Erro desconhecido. Tente novamente.', 'error');
              break;
          }
        } else {
          // Caso o erro não tenha uma resposta ou seja de outro tipo
          showSnackbar('Erro na requisição. Tente novamente.', 'error');
        }
      }
    };

    // Chama a função
    fetchProntuario();

  }, [numProntuario]); // Certifique-se de fechar corretamente o useEffect

  // Busca os dados do usuário do sessionStorage ao carregar o componente
  useEffect(() => {
    const data = getUserData();
    setUserData(data);
  }, []);

  //Handle para capturar o arquivo PDF
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const uploadFile = async (datetime: string, numRegulacao: number) => {
    const year = getYear(datetime);
    const month = getMonth(datetime);
    const day = getDay(datetime);

    const formData = new FormData();
    formData.append('year', year);
    formData.append('month', month);
    formData.append('day', day);
    formData.append('file', file!);
    formData.append('num_regulacao', numRegulacao.toString()); // Adicionando num_regulacao no corpo da requisição

    try {
      const response = await axios.post(`${NODE_URL}/api/internal/upload/uploadPDF`, formData, {
        params: { numRegulacao }, // Passando numRegulacao através de params
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Resposta de sucesso
      showSnackbar(response.data.message || 'Arquivo enviado com sucesso!', 'success');
    } catch (error: unknown) {
      // Verifica se o erro é uma instância de AxiosError
      if (error instanceof AxiosError) {
        // Se o erro tiver uma resposta, exibe a mensagem de erro da API
        showSnackbar(error.response?.data?.message || 'Erro ao enviar arquivo. Tente novamente.', 'error');
      } else {
        // Se o erro não for do tipo AxiosError, exibe uma mensagem genérica
        showSnackbar('Erro inesperado ao enviar o arquivo. Tente novamente.', 'error');
      }

      // Lança um novo erro para garantir que o fluxo de controle seja interrompido
      throw new Error('Erro ao enviar o arquivo');
    }
  };


  const showSnackbar = (
    message: string,
    severity: 'success' | 'error' | 'info' | 'warning'
  ): void => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // Fecha o Snackbar
  const handleSnackbarClose = (): void => {
    setSnackbarOpen(false);
  };

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

      const dataToSubmit = {
        ...formData,
        id_user: userData?.id_user, // ID do usuário logado
        id_regulacao: dadosPaciente?.id_regulacao, // ID da regulação a ser atualizada
        nome_responsavel_nac: userData?.nome, // Nome do regulador NAC
        num_prontuario: numProntuario, // Número do prontuário
        num_regulacao: dadosPaciente?.num_regulacao, // Número da regulação
      };

      // Verifica se num_regulacao é válido
      if (dataToSubmit.num_regulacao != null) {
        // Verifica se há arquivo e, caso haja, faz o upload
        if (file) {
          await uploadFile(dataToSubmit.data_hora_solicitacao_02, dataToSubmit.num_regulacao);
        }
      } else {
        console.error('Número de regulação inválido.');
        // Opcional: mostrar uma mensagem para o usuário
      }

      const response = await axios.put(`${NODE_URL}/api/internal/put/AtualizaRegulacao`, dataToSubmit);

      // Exibe mensagem de sucesso e redireciona
      showSnackbar(response.data.message || 'Regulação atualizada com sucesso.', 'success');
      navigate('/ListaRegulacoes', {
        state: {
          snackbar: {
            open: true,
            severity: 'success',
            message: 'Regulação atualizada com sucesso!',
          },
        },
      });
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        console.error(error.response?.data?.message || 'Erro ao atualizar regulação. Por favor, tente novamente.', error);
        showSnackbar(error.response?.data?.message || 'Erro ao atualizar regulação. Por favor, tente novamente.', 'error');
      } else if (error instanceof Error) {
        // Se o erro for do tipo genérico `Error`, trate-o também
        console.error('Erro desconhecido:', error.message);
        showSnackbar('Erro desconhecido:', 'error');
      } else {
        // Caso o erro seja de um tipo inesperado
        console.error('Erro inesperado:', error);
        showSnackbar('Erro inesperado:', 'error');
      }
    }

  };

  return (
    <div>
      <div>
        <label className="Title-Form">Atualizar/Renovar Regulação</label>
      </div>
      {dadosPaciente ? (
        <form onSubmit={handleSubmit} className="ComponentForm">
          <div>
            <DadosPaciente dadosPaciente={dadosPaciente} />
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
            <div className="line-StepContent upload">
              <label>Enviar PDF da Regulação:</label>
              <input type="file" accept="application/pdf" onChange={handleFileChange} required />
            </div>
          </div>
          <button type="submit" className="SubmitButton">Atualizar</button>
        </form>
      ) : (
        <p>Carregando dados do prontuário...</p>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

    </div>
  );
};

export default AtualizaRegulacao;