import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Snackbar, Alert } from '@mui/material';
import { FcCheckmark, FcLeave } from "react-icons/fc";

/*IMPORT INTERFACES*/
import { NovaRegulacaoData } from '../../interfaces/Regulacao';
import { UserData } from '../../interfaces/UserData';

/*IMPORT COMPONENTS*/

/*IMPORT FUNCTIONS*/
import { formatDateTimeToPtBr } from '../../functions/DateTimes';
import { getUserData } from '../../functions/storageUtils';
import { calcularIdade } from '../../functions/CalcularIdade';
import { getDay, getMonth, getYear } from '../../functions/DateTimes';

/*IMPORT CSS*/
import './NovaRegulacao.css';

/*IMPORT JSON*/
import un_origem from '../../JSON/un_origem.json';
import un_destino from '../../JSON/un_destino.json';

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
  nome_regulador_nac: '',
  num_regulacao: null,
  nome_regulador_medico: '',
  data_hora_acionamento_medico: '',
  status_regulacao: '',
  link: ''
};

const NovaRegulacao: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [unidadesOrigem, setUnidadesOrigem] = useState([]);
  const [unidadesDestino, setUnidadesDestino] = useState([]);
  const [formData, setFormData] = useState<NovaRegulacaoData>(initialFormData);
  const [medicos, setMedicos] = useState<string[]>([]); // Lista de médicos da API
  const navigate = useNavigate();
  const [iconStatusProntOk, setIconStatusProntOk] = useState<boolean>(false);
  const [iconStatusProntDeny, setIconStatusProntDeny] = useState<boolean>(false);
  const [iconStatusRegOk, setIconStatusRegOk] = useState<boolean>(false);
  const [iconStatusRegDeny, setIconStatusRegDeny] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [showAtualizarButton, setShowAtualizarButton] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' as 'success' | 'error' | 'info' | 'warning' });

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
      } catch (err: any) {
        setError(err.response?.data?.message || 'Erro ao carregar lista de médicos.');
      }
    };

    fetchMedicos();
  }, []);

  //Pega dados do SeassonStorage User
  useEffect(() => {
    const data = getUserData();
    setUserData(data);
  }, []);

  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

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
      default:
        break;
    }

    // Exibir erro ou retornar sucesso
    if (invalidField) {
      setSnackbar({ open: true, message: invalidField, severity: 'warning' });
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
      setSnackbar({
        open: true,
        message: response.data.message || 'Arquivo enviado com sucesso!',
        severity: 'success',
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Erro ao enviar arquivo. Tente novamente.',
        severity: 'error',
      });
      throw new Error('Erro ao enviar o arquivo');
    }
  };
  
  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    
    // Valida o formulário primeiro
    if (!validateForm()) return;
    
    try {
      const dataToSubmit = {
        ...formData,
        id_user: userData?.id_user, // Use o operador de encadeamento opcional para evitar erros se `userData` for `null`
        nome_regulador_nac: userData?.nome,
      };
  
      // Envia o formulário primeiro
      const response = await axios.post(`${NODE_URL}/api/internal/post/NovaRegulacao`, dataToSubmit);
  
      // Verifica se há arquivo e, caso haja, faz o upload
      if (file) {
        await uploadFile(dataToSubmit.data_hora_solicitacao_01, dataToSubmit.num_regulacao);  // Espera o upload do arquivo ser concluído antes de prosseguir
      }
  
      // Se tudo ocorrer bem, exibe a resposta
      setSnackbar({
        open: true,
        message: response.data.message || 'Regulação cadastrada com sucesso',
        severity: 'success',
      });
  
      // Limpeza de dados após o sucesso
      setFormData(initialFormData);
      setFile(null); // Reseta o arquivo após o envio
      setCurrentStep(1); // Reinicia o passo no processo, caso haja
  
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Erro ao cadastrar regulação. Por favor, tente novamente.',
        severity: 'error',
      });
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

    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao verificar prontuário.');
      setShowAtualizarButton(false);
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

    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao verificar prontuário.');
      setShowAtualizarButton(false);
    }
  };

  const handleAtualizarRegulacao = (): void => {
    if (!formData.num_prontuario) {
      setSnackbar({ open: true, message: 'Prontuário é obrigatório para atualizar a regulação', severity: 'warning' });
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
      setSnackbar({ open: true, message: 'Não é possivel abrir uma nova regulação para paciente com regulação pendente em aberto, revise o Nº PRONTUARIO', severity: 'warning' });
      return;
    }

    if (iconStatusRegDeny) {
      setSnackbar({ open: true, message: 'Não é possivel abrir uma nova regulação para paciente com regulação pendente em aberto, revise o Nº REGULAÇÃO', severity: 'warning' });
      return;
    }

    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const previousStep = (): void => {
    if (iconStatusRegDeny) {
      setSnackbar({ open: true, message: 'Não é possivel abrir uma nova regulação para paciente com regulação pendente em aberto, revise o Nº REGULAÇÃO', severity: 'warning' });
      return;
    }

    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }

  return (
    <>
      <div>
        <label className='Title-Form'>Nova Regulação</label>
      </div>

      <div className="ComponentForm">
        <div className="Steps">
          <div className={`Step ${currentStep === 1 ? 'active' : ''}`}>Paciente</div>
          <div className={`Step ${currentStep === 2 ? 'active' : ''}`}>Localidades</div>
          <div className={`Step ${currentStep === 3 ? 'active' : ''}`}>Regulação</div>
          <div className={`Step ${currentStep === 4 ? 'active' : ''}`}>Confirmação</div>
        </div>
        <form className="Form-NovaRegulacao" onSubmit={handleSubmit}>
          <div className="Form-NovaRegulacao-Inputs">
            {currentStep === 1 && (
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
                      {iconStatusProntOk && (<FcCheckmark className='Icon-Status-NovaRegulacao' title='Prontuário OK' />)} {iconStatusProntDeny && (<FcLeave className='Icon-Status-NovaRegulacao' title='Prontuário com Pendência' />)}
                      {showAtualizarButton && (
                        <button type="button" className='btn button-warning' onClick={handleAtualizarRegulacao}>
                          Atualizar Regulação
                        </button>
                      )}
                    </span>
                  </div>
                </div>

                <div className='line-StepContent-2'>
                  <div className="line-StepContent-sub">
                    <label>Data Nascimento:</label>
                    <input
                      type="date"
                      name="data_nascimento"
                      value={formData.data_nascimento}
                      onChange={handleChange}
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

                
              </div>
            )}

            {currentStep === 2 && (
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
                  <label>Data e Hora da 1ª Solicitação:</label>
                  <input
                    type="datetime-local"
                    name="data_hora_solicitacao_01"
                    value={formData.data_hora_solicitacao_01}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="StepContent">
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

                      />{iconStatusRegOk && (<FcCheckmark className='Icon-Status-NovaRegulacao' />)} {iconStatusRegDeny && (<FcLeave className='Icon-Status-NovaRegulacao' />)}
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
                  <label>Data e Hora do Acionamento do Médico:</label>
                  <input
                    type="datetime-local"
                    name="data_hora_acionamento_medico"
                    value={formData.data_hora_acionamento_medico}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="StepContent">
                <label>Confira as informações antes de finalizar:</label>
                <ul>
                  <li><strong>Nome do Paciente:</strong> {formData.nome_paciente}</li>
                  <li><strong>Prontuário:</strong> {formData.num_prontuario}</li>
                  <li><strong>Idade:</strong> {formData.num_idade} Anos</li>
                  <li><strong>Unidade Origem:</strong> {formData.un_origem}</li>
                  <li><strong>Unidade Destino:</strong> {formData.un_destino}</li>
                  <li><strong>Data Hora 1ª Solicitação:</strong> {formatDateTimeToPtBr(formData.data_hora_solicitacao_01)}</li>
                  <li><strong>Prioridade:</strong> {formData.prioridade}</li>
                  <li><strong>Nº Regulação:</strong> {formData.num_regulacao}</li>
                  <li><strong>Nome do Médico Regulador:</strong> {formData.nome_regulador_medico}</li>
                  <li><strong>Data Hora Acionamento Médico:</strong> {formatDateTimeToPtBr(formData.data_hora_acionamento_medico)}</li>
                </ul>

                <div className="line-StepContent">
                  <label>Enviar PDF da Regulação:</label>
                  <input type="file" accept="application/pdf" onChange={handleFileChange} required/>
                </div>
              </div>
            )}

          </div>
          {error}
          <div className="Form-NovaRegulacao-Buttons">
            {currentStep > 1 && <button type="button" onClick={previousStep}>Voltar</button>}
            {currentStep < 4 && <button type="button" onClick={nextStep}>Avançar</button>}
            {currentStep === 4 && <button type="submit">Finalizar</button>}
          </div>
        </form>

      </div>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>

    </>
  );
};

export default NovaRegulacao;