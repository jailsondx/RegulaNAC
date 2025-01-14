import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Snackbar, Alert } from '@mui/material';
import { FcCheckmark, FcLeave } from "react-icons/fc";
import { formatDateToPtBr } from '../../functions/DateTimes';
import { getUserData } from '../../functions/storageUtils';
import './NovaRegulacao.css';

const NODE_URL = import.meta.env.VITE_NODE_SERVER_URL;

interface FormDataNovaRegulacao {
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

const initialFormData: FormDataNovaRegulacao = {
  id_user: '',
  num_prontuario: null,
  nome_paciente: '',
  num_idade: null,
  un_origem: '',
  un_destino: '',
  num_prioridade: null,
  data_hora_solicitacao_01: '',
  data_hora_solicitacao_02: '',
  nome_regulador_nac: '',
  num_regulacao: null,
  nome_regulador_medico: '',
  data_hora_acionamento_medico: '',
  status_regulacao: 'Aberto - Aguardando Regulacao Medica'
};





const NovaRegulacao: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [formData, setFormData] = useState<FormDataNovaRegulacao>(initialFormData);
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

  
  useEffect(() => {
    // Carrega a lista de médicos ao montar o componente
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

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
        const dataToSubmit = {
            ...formData,
            id_user: userData?.id_user, // Use o operador de encadeamento opcional para evitar erros se `userData` for `null`
            nome_regulador_nac: userData?.nome,
        };

        const NovaRegulacao = await axios.post(`${NODE_URL}/api/internal/post/NovaRegulacao`, dataToSubmit);

        const response = NovaRegulacao.data;

        // Exibir mensagem de sucesso
        setSnackbar({
            open: true,
            message: response.message || 'Regulação cadastrada com sucesso',
            severity: 'success',
        });

        setFormData(initialFormData); // Resetar o formulário
        setCurrentStep(1); // Voltar ao início
    } catch (error: any) {
        console.error('Erro ao cadastrar regulação:', error);

        // Exibir mensagem de erro
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

      const { message } = response.data; console.log({ message });

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

      const { message } = response.data; console.log({ message });

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

      <div className="ComponentForm NovaRegulacao">
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
                      {iconStatusProntOk && (<FcCheckmark className='Icon-Status-NovaRegulacao' title='Prontuário OK'/>)} {iconStatusProntDeny && (<FcLeave className='Icon-Status-NovaRegulacao' title='Prontuário com Pendência'/>)} 
                      {showAtualizarButton && (
                        <button type="button" className='btn button-warning' onClick={handleAtualizarRegulacao}>
                          Atualizar Regulação
                        </button>
                      )}
                    </span>
                  </div>
                </div>

                <div className="line-StepContent">
                  <label>Idade:</label>
                  <input
                    type="number"
                    name="num_idade"
                    value={formData.num_idade ?? ''}
                    onChange={handleChange}
                    required
                  />
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
                      type="number"
                      name="num_prioridade"
                      value={formData.num_prioridade ?? ''}
                      onChange={handleChange}
                      required
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
                  <li><strong>Data Hora 1ª Solicitação:</strong> {formatDateToPtBr(formData.data_hora_solicitacao_01)}</li>
                  <li><strong>Prioridade:</strong> {formData.num_prioridade}</li>
                  <li><strong>Nº Regulação:</strong> {formData.num_regulacao}</li>
                  <li><strong>Nome do Médico Regulador:</strong> {formData.nome_regulador_medico}</li>
                  <li><strong>Data Hora Acionamento Médico:</strong> {formatDateToPtBr(formData.data_hora_acionamento_medico)}</li>
                </ul>
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
