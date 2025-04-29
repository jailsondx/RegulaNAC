import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import axios from 'axios';
import { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { Snackbar, Alert } from '@mui/material';

/*IMPORT INTERFACES*/
import { NovaRegulacaoData } from '../../../../interfaces/Regulacao';
import { UserData } from '../../../../interfaces/UserData';
import { UnidadeData } from '../../../../interfaces/Unidade';

/*IMPORT COMPONENTS*/
import { ProgressBar } from './ProgressBar';
import { Passo1 } from './Passo1';
import { Passo2 } from './Passo2';
import { Passo3 } from './Passo3';
import { Passo4 } from './Passo4';

/*IMPORT FUNCTIONS*/
import { getUserData } from '../../../../functions/storageUtils';
import { calcularIdade } from '../../../../functions/CalcularIdade';
import { getDay, getMonth, getYear } from '../../../../functions/DateTimes';

/*IMPORT UTILS*/
import { useSocket } from '../../../../Utils/useSocket';

/*IMPORT CSS*/
import '../NovaRegulacao.css';

/*IMPORT JSON*/
import un_origem from '../../../../JSON/un_origem.json';
import un_destino from '../../../../JSON/un_destino.json';


/*IMPORT VARIAVEIS DE AMBIENTE*/
const NODE_URL = import.meta.env.VITE_NODE_SERVER_URL;

const initialFormData: NovaRegulacaoData = {
  id_user: '',
  num_prontuario: null,
  nome_paciente: '',
  data_nascimento: '',
  num_idade: null,
  un_origem: '',
  un_destino: '',
  prioridade: '',
  data_hora_solicitacao_01: '',
  data_hora_solicitacao_02: '',
  qtd_solicitacoes: 1,
  nome_responsavel_nac: '',
  num_regulacao: null,
  nome_regulador_medico: '',
  data_hora_acionamento_medico: '',
  status_regulacao: '',
  link: ''
};

const NovaRegulacao: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const userUsername = userData?.login || ''; // Nome do usuário
  const userTipo = userData?.tipo || ''; // Tipo de usuário
  const [file, setFile] = useState<File | null>(null);
  const [unidadesOrigem, setUnidadesOrigem] = useState<UnidadeData[]>([]);
  const [unidadesDestino, setUnidadesDestino] = useState<UnidadeData[]>([]);
  const [formData, setFormData] = useState<NovaRegulacaoData>(initialFormData);
  const [medicos, setMedicos] = useState<string[]>([]); // Lista de médicos da API
  const navigate = useNavigate();
  const [iconStatusProntOk, setIconStatusProntOk] = useState<boolean>(false);
  const [iconStatusProntDeny, setIconStatusProntDeny] = useState<boolean>(false);
  const [iconStatusRegOk, setIconStatusRegOk] = useState<boolean>(false);
  const [iconStatusRegDeny, setIconStatusRegDeny] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [showAtualizarButton, setShowAtualizarButton] = useState<boolean>(false);

  //VERIFICAÇÃO DE UN ORIGEM
  //const requiredUnidadesOBS = ['COI', 'COII', 'COII']; // ou só 'UTI', 'COI' se quiser verificar por "começa com"
  //const isValueOrigemOBS = requiredUnidadesOBS.includes(formData.un_origem);
  const requiredUnidades = ['UTI ADULTO I', 'UTI ADULTO II', 'UTI ADULTO III', 'UTI ADULTO IV']; // ou só 'UTI', 'COI' se quiser verificar por "começa com"
  const isValueDestino = requiredUnidades.includes(formData.un_destino);


  /*SNACKBAR*/
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>("success");

  // Carregar os dados do arquivo JSON
  useEffect(() => {
    setUnidadesOrigem(un_origem);
    setUnidadesDestino(un_destino);
  }, []);

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

  //Pega dados do SeassonStorage User
  useEffect(() => {
    const data = getUserData();
    setUserData(data);
  }, []);

  //Função para fazer o envio de mensagem para o socket
  const { enviarMensagem } = useSocket(userUsername, userTipo, (mensagem) => {
    showSnackbar(mensagem, 'warning');
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value, type } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: type === 'number' ? (value ? Number(value) : null) : value,
      num_idade: name === "data_nascimento" ? calcularIdade(value) : prevState.num_idade
    }));

    if (name === 'num_prontuario' && value) {
      handleVerificaProntuario(Number(value));
    }

    if (name === 'num_regulacao' && value) {
      handleVerificaRegulacao(Number(value));
    }
  };

  const validateForm = (): boolean => {
    let invalidField: string | null = null;

    // Identificar o campo inválido
    switch (true) {
      case !formData.nome_paciente.trim():
        invalidField = 'O nome do paciente é obrigatório.';
        break;
      case !formData.num_prontuario:
        invalidField = 'Prontuário é obrigatório.';
        break;
      case formData.num_idade === null:
        invalidField = 'Idade é obrigatória.';
        break;
      case !formData.un_origem.trim():
        invalidField = 'A unidade de origem é obrigatória.';
        break;
      case !formData.un_destino.trim():
        invalidField = 'A unidade de destino é obrigatória.';
        break;
      case !formData.data_hora_solicitacao_01.trim():
        invalidField = 'Date e Hora da solicitação é obrigatória.';
        break;
      case !formData.num_regulacao:
        invalidField = 'O número da regulação é obrigatório.';
        break;
      case !formData.nome_regulador_medico.trim():
        invalidField = 'O nome do médico regulador é obrigatório.';
        break;
      case !formData.data_hora_acionamento_medico.trim():
        invalidField = 'Date e Hora do Acionamendo Médico é obrigatória.';
        break;
      case isValueDestino && !(formData.prioridade?.trim() || ''):
        invalidField = 'Prioridade é obrigatório.';
        break;
      default:
        break;
    }

    // Exibir erro ou retornar sucesso
    if (invalidField) {
      showSnackbar(invalidField || 'Revise os Campos', 'warning');
      return false;
    }
    return true;
  };

  //Handle para capturar o arquivo PDF
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const uploadFile = async (datetime: string, numRegulacao: number) => {
    const year = getYear(datetime);
    const month = getMonth(datetime);
    const day = getDay(datetime);

    const formDataUpload = new FormData();
    formDataUpload.append('year', year);
    formDataUpload.append('month', month);
    formDataUpload.append('day', day);
    formDataUpload.append('file', file!);
    formDataUpload.append('num_regulacao', numRegulacao.toString());

    try {
      const response = await axios.post(`${NODE_URL}/api/internal/upload/uploadPDF`, formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      showSnackbar('Arquivo enviado com sucesso.', 'success');
      return response.data.filename;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        console.error('Erro ao enviar o arquivo:', error);
        showSnackbar(error.response?.data?.message || 'Erro ao enviar o arquivo.', 'error');
      } else if (error instanceof Error) {
        console.error('Erro desconhecido:', error.message);
        showSnackbar('Erro desconhecido ao enviar o arquivo.', 'error');
      } else {
        console.error('Erro inesperado:', error);
        showSnackbar('Erro inesperado ao enviar o arquivo.', 'error');
      }
      return null;
    }
  };

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      let uploadedFilename = '';

      // Se for CRESUS e tiver arquivo para upload
      if (formData.num_regulacao && file) {
        uploadedFilename = await uploadFile(formData.data_hora_solicitacao_01 || '', formData.num_regulacao);
      }

      const dataToSubmit = {
        ...formData,
        id_user: userData?.id_user,
        nome_responsavel_nac: userData?.nome,
        data_hora_solicitacao_02: formData.data_hora_solicitacao_01,
        link: uploadedFilename || null,
      };

      const response = await axios.post(
        `${NODE_URL}/api/internal/post/NovaRegulacao`,
        dataToSubmit
      );

      showSnackbar(response.data.message || 'Regulação inserida com sucesso.', 'success');
      enviarMensagem('Nova Regulação Solicitada: Nº' + formData.num_regulacao);

      // Limpar dados após sucesso
      setFormData(initialFormData);
      setIconStatusProntOk(false);
      setIconStatusProntDeny(false);
      setCurrentStep(1);

    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        console.error(error.response?.data?.message || 'Erro ao cadastrar regulação.', error);
        showSnackbar(error.response?.data?.message || 'Erro ao cadastrar regulação.', 'error');
      } else if (error instanceof Error) {
        console.error('Erro desconhecido:', error.message);
        showSnackbar('Erro desconhecido ao cadastrar regulação.', 'error');
      } else {
        console.error('Erro inesperado:', error);
        showSnackbar('Erro inesperado ao cadastrar regulação.', 'error');
      }
    }
  };

  const handleVerificaProntuario = async (numProntuario: number): Promise<void> => {
    if (!numProntuario) {
      //setSnackbar({ open: true, message: 'Prontuário é obrigatório', severity: 'info' });
      setShowAtualizarButton(false);
      return;
    }

    try {
      const response = await axios.get(`${NODE_URL}/api/internal/get/VerificaProntuario`, {
        params: { num_prontuario: numProntuario },
      });

      const { message } = response.data;

      if (message === 'Regulação pendente em aberto') {
        setIconStatusProntOk(false);
        setIconStatusProntDeny(true);
        setShowAtualizarButton(message === 'Regulação pendente em aberto');
      } else {
        setIconStatusProntOk(true);
        setIconStatusProntDeny(false);
        setShowAtualizarButton(false);
      }

    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        console.error(error.response?.data?.message || 'Erro ao verificar prontuário.', error);
        showSnackbar(error.response?.data?.message || 'Erro ao verificar prontuário.', 'error');
        setShowAtualizarButton(false);
      } else if (error instanceof Error) {
        // Se o erro for do tipo genérico `Error`, trate-o também
        console.error('Erro desconhecido:', error.message);
        showSnackbar('Erro desconhecido:', 'error');
        setShowAtualizarButton(false);
      } else {
        // Caso o erro seja de um tipo inesperado
        console.error('Erro inesperado:', error);
        showSnackbar('Erro inesperado:', 'error');
        setShowAtualizarButton(false);
      }
    }
  };

  const handleVerificaProntuarioAutoComplete = async (numProntuario: number): Promise<void> => {
    if (!numProntuario) {
      //setSnackbar({ open: true, message: 'Prontuário é obrigatório', severity: 'info' });
      setShowAtualizarButton(false);
      return;
    }

    try {
      const response = await axios.get(`${NODE_URL}/api/internal/get/VerificaProntuarioAutoComplete`, {
        params: { num_prontuario: numProntuario },
      });

      const status = response.status;
      const nomePaciente = response.data.data.nome_paciente;
      const dataNascimento = response.data.data.data_nascimento;
      const idade = response.data.data.num_idade;

      if (status === 200) {
        // Atualizando o estado corretamente
        setFormData((prevData) => ({
          ...prevData, // Mantém os outros campos inalterados
          nome_paciente: nomePaciente, // Atualiza o nome do paciente
          data_nascimento: dataNascimento.split("T")[0], // Atualiza a data de nascimento
          num_idade: idade, // Atualiza a idade
        }));
      }

    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        console.error(error.response?.data?.message || 'Erro ao verificar prontuário.', error);
        showSnackbar(error.response?.data?.message || 'Erro ao verificar prontuário.', 'error');
        setShowAtualizarButton(false);
      } else if (error instanceof Error) {
        // Se o erro for do tipo genérico `Error`, trate-o também
        console.error('Erro desconhecido:', error.message);
        showSnackbar('Erro desconhecido:', 'error');
        setShowAtualizarButton(false);
      } else {
        // Caso o erro seja de um tipo inesperado
        console.error('Erro inesperado:', error);
        showSnackbar('Erro inesperado:', 'error');
        setShowAtualizarButton(false);
      }
    }
  };

  const handleVerificaRegulacao = async (numRegulacao: number): Promise<void> => {
    if (!numRegulacao) {
      //setSnackbar({ open: true, message: 'Nº de Regulação é obrigatório', severity: 'info' });
      setShowAtualizarButton(false);
      return;
    }

    try {
      const response = await axios.get(`${NODE_URL}/api/internal/get/VerificaRegulacao`, {
        params: { num_regulacao: numRegulacao },
      });

      const { message } = response.data;

      if (message === 'Regulação pendente em aberto') {
        setIconStatusRegOk(false);
        setIconStatusRegDeny(true);
      } else {
        setIconStatusRegOk(true);
        setIconStatusRegDeny(false);
        setShowAtualizarButton(false);
      }

    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        console.error(error.response?.data?.message || 'Erro ao verificar regulação.', error);
        showSnackbar(error.response?.data?.message || 'Erro ao verificar regulação.', 'error');
        setShowAtualizarButton(false);
      } else if (error instanceof Error) {
        // Se o erro for do tipo genérico `Error`, trate-o também
        console.error('Erro desconhecido:', error.message);
        showSnackbar('Erro desconhecido:', 'error');
        setShowAtualizarButton(false);
      } else {
        // Caso o erro seja de um tipo inesperado
        console.error('Erro inesperado:', error);
        showSnackbar('Erro inesperado:', 'error');
        setShowAtualizarButton(false);
      }
    }
  };

  const handleAtualizarRegulacao = (): void => {
    if (!formData.num_prontuario) {
      showSnackbar('Prontuário é obrigatório para atualizar a regulação', 'warning');
      return;
    }
    // Enviando dados de forma oculta
    navigate('/AtualizaRegulacao', {
      state: { num_prontuario: formData.num_prontuario },
    });
  };

  const handleSelectChange_medico = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setFormData((prevData) => ({
      ...prevData,
      nome_regulador_medico: value,
    }));
  };

  const nextStep = (): void => {
    if (showAtualizarButton) {
      showSnackbar('Não é possivel abrir uma nova regulação para paciente com regulação pendente em aberto, revise o Nº PRONTUARIO', 'warning');
      return;
    }

    if (iconStatusRegDeny) {
      showSnackbar('Não é possivel abrir uma nova regulação para paciente com regulação pendente em aberto, revise o Nº REGULAÇÃO', 'warning');
      return;
    }

    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const previousStep = (): void => {
    if (iconStatusRegDeny) {
      showSnackbar('Não é possivel abrir uma nova regulação para paciente com regulação pendente em aberto, revise o Nº REGULAÇÃO', 'warning');
      return;
    }
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }

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
      <div>
        <label className='Title-Form'>Nova Regulação</label>
      </div>
      
      <div className="ComponentForm">
        <div>
          <ProgressBar currentStep={currentStep} />
        </div>

        <form className="Form-NovaRegulacao" onSubmit={handleSubmit}>
          <div className="Form-NovaRegulacao-Inputs">
            {currentStep === 1 && (
              <Passo1
                formData={formData}
                handleChange={handleChange}
                handleVerificaProntuarioAutoComplete={handleVerificaProntuarioAutoComplete}
                handleAtualizarRegulacao={handleAtualizarRegulacao}
                iconStatusProntOk={iconStatusProntOk}
                iconStatusProntDeny={iconStatusProntDeny}
                showAtualizarButton={showAtualizarButton}
              />
            )}
            {currentStep === 2 && (
              <Passo2
                formData={formData}
                handleChange={handleChange}
                unidadesOrigem={unidadesOrigem}
                unidadesDestino={unidadesDestino}
              />
            )}
            {currentStep === 3 && (
              <Passo3
                formData={formData}
                handleChange={handleChange}
                handleSelectChange_medico={handleSelectChange_medico}
                medicos={medicos}
                isValueDestino={isValueDestino}
                iconStatusRegOk={iconStatusRegOk}
                iconStatusRegDeny={iconStatusRegDeny}
              />
            )}
            {currentStep === 4 && (
              <Passo4
                formData={formData}
                handleFileChange={handleFileChange}
              />
            )}
          </div>

          {/* Botões ficam fora dos subcomponentes */}
          <div className="Div-Buttons End">
            {currentStep > 1 && <button type="button" onClick={previousStep}>Voltar</button>}
            {currentStep < 4 && <button type="button" onClick={nextStep}>Avançar</button>}
            {currentStep === 4 && <button type="submit">Finalizar</button>}
          </div>
        </form>
      </div>


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

    </>
  );
};

export default NovaRegulacao;