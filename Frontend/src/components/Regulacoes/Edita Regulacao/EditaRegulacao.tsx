import React, { useState, useEffect, FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AxiosError } from 'axios';
import { Snackbar, Alert } from '@mui/material';

/*IMPORT INTERFACES*/
import { DadosPacienteData } from "../../../interfaces/DadosPaciente.ts";
import { UpdateEditRegulacaoData, EditRegulacaoData } from '../../../interfaces/Regulacao.ts';
import { UserData } from '../../../interfaces/UserData.ts';

/*IMPORT COMPONENTS*/
import DadosPaciente from '../../Dados Paciente/DadosPaciente.tsx';

/*IMPORT FUNCTIONS*/
import { getUserData } from '../../../functions/storageUtils.ts';
import { calcularIdade } from '../../../functions/CalcularIdade.ts';

/*IMPORT CSS*/
import './EditaRegulacao.css';

/*IMPORT VARIAVEIS DE AMBIENTE*/
const NODE_URL = import.meta.env.VITE_NODE_SERVER_URL;

const initialFormData: UpdateEditRegulacaoData = {
  id_user: '',
  num_prontuario: null,
  nome_paciente: '',
  data_nascimento: '',
  num_idade: null,
  prioridade: '',
  num_regulacao: null,
  nome_regulador_medico: '',
  data_hora_solicitacao_02: '',
  link: '',
};

const EditaRegulacao: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const location = useLocation(); // Captura o estado enviado via navegação
  const [idRegulacao, setidRegulacao] = useState<number | ''>(''); // Número do prontuário recebido
  const [dadosPaciente, setDadosPaciente] = useState<DadosPacienteData>();
  const [formData, setFormData] = useState<EditRegulacaoData>(initialFormData);

  const [medicos, setMedicos] = useState<string[]>([]); // Lista de médicos da API

  /*SNACKBAR*/
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');

  const navigate = useNavigate(); // Usado para redirecionar após a atualização

  // Captura o número do id regulação ao montar o componente
  useEffect(() => {
    const { id_regulacao } = location.state || {};
    if (id_regulacao) {
      setidRegulacao(parseInt(id_regulacao, 10));
    }
  }, [location]);

  // Busca os dados pelo id_regulacao
  useEffect(() => {
    if (!idRegulacao) return;

    const fetchID = async () => {
      try {
        const response = await axios.get(`${NODE_URL}/api/internal/get/VerificaID`, {
          params: { id_regulacao: idRegulacao },
        });
        const data = response.data.data || null;
        setDadosPaciente(data);

        if (data) {
          // Preenche os campos do formulário com os dados recebidos
          setFormData({
            ...formData,
            num_prontuario: data.num_prontuario,
            nome_paciente: data.nome_paciente,
            data_nascimento: data.data_nascimento,
            num_idade: data.num_idade,
            prioridade: data.prioridade,
            num_regulacao: data.num_regulacao,
            nome_regulador_medico: data.nome_regulador_medico,
            link: data.link,
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
    fetchID();

  }, [idRegulacao]); // Certifique-se de fechar corretamente o useEffect

  // Carrega a lista de médicos ao montar o componente
  useEffect(() => {

    const fetchMedicos = async () => {
      try {
        const response = await axios.get(`${NODE_URL}/api/internal/get/ListaMedicos`);
        const nomes_medicos_list = response.data.data;
        setMedicos(nomes_medicos_list || []); // Supondo que o retorno é { medicos: [] }
      } catch (error: unknown) {
        if (error instanceof AxiosError) {
          console.error('Erro ao carregar lista de médicos.', error);
          showSnackbar(error.response?.data?.message || 'Erro ao carregar lista de médicos.', 'error');
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

    fetchMedicos();
  }, []);

  // Busca os dados do usuário do sessionStorage ao carregar o componente
  useEffect(() => {
    const data = getUserData();
    setUserData(data);
  }, []);

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
      num_idade: name === "data_nascimento" ? calcularIdade(value) : prevFormData.num_idade
    }));
  };

  // Verifica mudança do slect options dos médicos
  const handleSelectChange_medico = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setFormData((prevData) => ({
      ...prevData,
      nome_regulador_medico: value,
    }));
  };

  // Submete os dados atualizados para o backend
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {

      const dataToSubmit = {
        ...formData,
        data_nascimento: formData.data_nascimento.split("T")[0], //Converte a data para o formato yyyy-mm-dd
        id_user: userData?.id_user, // ID do usuário logado
        id_regulacao: idRegulacao, // ID da regulação a ser atualizada
        nome_regulador_nac: userData?.nome, // Nome do regulador NAC
      };

      const response = await axios.put(`${NODE_URL}/api/internal/put/EditaRegulacao`, dataToSubmit);

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
        <label className="Title-Form">Editar Regulação</label>
      </div>
      {dadosPaciente ? (
        <form onSubmit={handleSubmit} className="ComponentForm">
          <div>
            <DadosPaciente dadosPaciente={dadosPaciente} />
          </div>

          <div className="StepContent">
            <div className="line-StepContent">
              <label>Nome do Paciente:</label>
              <input
                type="text"
                name="nome_paciente"
                value={formData.nome_paciente}
                onChange={handleChange}
                required
              />
            </div>
            <div className="line-StepContent">
              <label>Prontuário:</label>
              <div className='div-AtualizarRegulacao'>
                <span className='spanInput-line-StepContent'>
                  <input
                    type="number"
                    name="num_prontuario"
                    value={formData.num_prontuario ?? ''}
                    onChange={handleChange}
                    required
                  />
                </span>
              </div>
            </div>

            <div className='line-StepContent-2'>
              <div className="line-StepContent-sub">
                <label>Data Nascimento:</label>
                <input
                  type="date"
                  name="data_nascimento"
                  value={formData.data_nascimento ? formData.data_nascimento.split("T")[0] : ""} //CONVERTE DA DATA RECEBIDA PELO BANCO/REQUEST E CONVERTE
                  onChange={handleChange}
                  max="2099-12-31" // Restringe anos superiores a 2199
                  required
                />
              </div>

              <div className="line-StepContent-sub">
                <label>Idade:</label>
                <input
                  type="number"
                  name="num_idade"
                  value={formData.num_idade ?? ''}
                  onChange={handleChange}
                  disabled
                  required
                />
              </div>
            </div>

            <div className="line-StepContent-2">
              <div className="line-StepContent-sub">
                <label>Nº Regulação:</label>
                <span className='spanInput-line-StepContent'>
                  <input
                    type="number"
                    name="num_regulacao"
                    value={formData.num_regulacao ?? ''}
                    onChange={handleChange}
                    required

                  />
                </span>
              </div>

              <div className="line-StepContent-sub">
                <label>Prioridade:</label>
                <input
                  type="text"
                  name="prioridade"
                  value={formData.prioridade ?? ''}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="line-StepContent">
              <label>Nome do Médico Regulador:</label>
              <select
                name="nome_regulador_medico"
                value={formData.nome_regulador_medico}
                onChange={handleSelectChange_medico}
                required
              >
                <option value="" disabled> Selecione um médico </option>
                {medicos.map((medico, index) => (
                  <option key={index} value={medico}>
                    {medico}
                  </option>
                ))}
              </select>
            </div>

          </div>

          <button type="submit" className="SubmitButton">Atualizar</button>
        </form>
      ) : (
        <p>Carregando dados da regulação...</p>
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

export default EditaRegulacao;