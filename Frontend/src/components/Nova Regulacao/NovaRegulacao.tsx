import React, { useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FcCheckmark, FcDislike, FcHighPriority } from "react-icons/fc";
import { formatDateToPtBr } from '../../functions/DateTimes';
import './NovaRegulacao.css';

const NODE_URL = import.meta.env.VITE_NODE_SERVER_URL;

interface FormDataNovaRegulacao {
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
  num_prontuario: null,
  nome_paciente: '',
  num_idade: null,
  un_origem: '',
  un_destino: '',
  num_prioridade: null,
  data_hora_solicitacao_01: '',
  data_hora_solicitacao_02: '',
  nome_regulador_nac: 'Teste Regulador',
  num_regulacao: null,
  nome_regulador_medico: '',
  data_hora_acionamento_medico: '',
  status_regulacao: 'Aberto - Aguardando Regulacao Medica'
};





const NovaRegulacao: React.FC = () => {
  const [formData, setFormData] = useState<FormDataNovaRegulacao>(initialFormData);
  const navigate = useNavigate();
  const [message, setMessage] = useState<string>('');
  const [iconStatusProntOk, setIconStatusProntOk] = useState<boolean>(false);
  const [iconStatusProntDeny, setIconStatusProntDeny] = useState<boolean>(false);
  const [iconStatusRegOk, setIconStatusRegOk] = useState<boolean>(false);
  const [iconStatusRegDeny, setIconStatusRegDeny] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [showAtualizarButton, setShowAtualizarButton] = useState<boolean>(false);

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
    if (!formData.num_prontuario) {
      setError('Prontuário é obrigatório.');
      return false;
    }
    if (!formData.nome_paciente.trim()) {
      setError('O nome do paciente é obrigatório.');
      return false;
    }
    if (formData.num_idade === null || formData.num_idade <= 0) {
      setError('num_idade deve ser maior que zero.');
      return false;
    }
    if (!formData.un_origem.trim()) {
      setError('A unidade solicitante é obrigatória.');
      return false;
    }
    if (!formData.un_destino.trim()) {
      setError('A unidade solicitante é obrigatória.');
      return false;
    }
    if (formData.num_prioridade === null || formData.num_prioridade <= 0) {
      setError('A num_prioridade deve ser maior que zero.');
      return false;
    }
    if (!formData.num_regulacao) {
      setError('O número da regulação é obrigatório.');
      return false;
    }
    if (!formData.nome_regulador_medico.trim()) {
      setError('O nome do médico regulador é obrigatório.');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const NovaRegulacao = await axios.post(`${NODE_URL}/api/internal/post/NovaRegulacao`, formData);

      const response = NovaRegulacao.data;
      console.log(response.message);

      setMessage('Regulação cadastrada com sucesso!');
      setError('');
      setFormData(initialFormData); // Resetar o formulário
      setCurrentStep(1); // Voltar ao início
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erro ao cadastrar regulação. Por favor, tente novamente.');
      setMessage('');
    }
  };

  const handleVerificaProntuario = async (numProntuario: number): Promise<void> => {
    if (!numProntuario) {
      setError('Prontuário é obrigatório.');
      setShowAtualizarButton(false);
      setMessage('');
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
        setError('');
        setShowAtualizarButton(message === 'Regulação pendente em aberto');
      } else {
        setIconStatusProntOk(true);
        setIconStatusProntDeny(false);
        setError('');
        setShowAtualizarButton(false);
      }
      //setMessage(message);

    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao verificar prontuário.');
      setMessage('');
      setShowAtualizarButton(false);
    }
  };

  const handleVerificaRegulacao = async (numRegulacao: number): Promise<void> => {
    if (!numRegulacao) {
      setError('Prontuário é obrigatório.');
      setShowAtualizarButton(false);
      setMessage('');
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
        setError('');
      } else {
        setIconStatusRegOk(true);
        setIconStatusRegDeny(false);
        setError('');
        setShowAtualizarButton(false);
      }
      //setMessage(message);

    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao verificar prontuário.');
      setMessage('');
      setShowAtualizarButton(false);
    }
  };


  const handleAtualizarRegulacao = (): void => {
    if (!formData.num_prontuario) {
      setError('Prontuário é obrigatório para atualizar a regulação.');
      return;
    }
    // Enviando dados de forma oculta
    navigate('/AtualizaRegulacao', {
      state: { num_prontuario: formData.num_prontuario },
    });
  };

  const nextStep = (): void => {
    if (showAtualizarButton) {
      setError('Não é possível criar uma nova regulação para um prontuário com regulação pendente.');
      return;
    }

    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const previousStep = (): void => setCurrentStep((prev) => Math.max(prev - 1, 1));

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
                  <label>Prontuário: {iconStatusProntOk && (<FcCheckmark />)} {iconStatusProntDeny && (<FcHighPriority />)} </label>
                  <div className='div-AtualizarRegulacao'>
                    <input
                      type="number"
                      name="num_prontuario"
                      value={formData.num_prontuario ?? ''}
                      onChange={handleChange}
                      required
                    />
                    {showAtualizarButton && (
                      <button type="submit" className='button-prioridade-red' onClick={handleAtualizarRegulacao}>
                        Atualizar Regulação
                      </button>
                    )}
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
                  <input
                    type="text"
                    name="nome_regulador_medico"
                    value={formData.nome_regulador_medico}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="line-StepContent-2">
                  <div className="line-StepContent-sub">
                    <label>Nº Regulação: {iconStatusRegOk && (<FcCheckmark />)} {iconStatusRegDeny && (<FcHighPriority />)} </label>
                    <input
                      type="number"
                      name="num_regulacao"
                      value={formData.num_regulacao ?? ''}
                      onChange={handleChange}
                      required
                    />
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
                  <li><strong>Prontuário:</strong> {formData.num_prontuario}</li>
                  <li><strong>Nome do Paciente:</strong> {formData.nome_paciente}</li>
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
    </>

  );
};

export default NovaRegulacao;
