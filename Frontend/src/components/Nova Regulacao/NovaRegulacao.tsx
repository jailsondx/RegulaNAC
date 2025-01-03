import React, { useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
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
  data_hora_acionamento_medico: ''
};

const NovaRegulacao: React.FC = () => {
  const [formData, setFormData] = useState<FormDataNovaRegulacao>(initialFormData);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<number>(1);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value, type } = e.target;

    setFormData((prevState) => ({
      ...prevState,
      [name]: type === 'number' ? (value === '' ? null : parseFloat(value)) : value,
    }));
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
      const NovaRegulacaoData = await axios.post(`${NODE_URL}/api/internal/post/NovaRegulacao`, formData);
      setMessage('Regulação cadastrada com sucesso!');
      setError('');
      setFormData(initialFormData); // Resetar o formulário
      setCurrentStep(1); // Voltar ao início
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erro ao cadastrar regulação. Por favor, tente novamente.');
      setMessage('');
    }    
  };

  const nextStep = (): void => setCurrentStep((prev) => Math.min(prev + 1, 4));
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
                <label>Prontuário:</label>
                <input
                  type="number"
                  name="num_prontuario"
                  value={formData.num_prontuario ?? ''}
                  onChange={handleChange}
                  required
                />
              </div>
             
              <div className="line-StepContent">
                <label>num_idade:</label>
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
                  <option value="unidade1">Unidade 1</option>
                  <option value="unidade2">Unidade 2</option>
                  <option value="unidade3">Unidade 3</option>
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
                  <option value="unidade1">Unidade 1</option>
                  <option value="unidade2">Unidade 2</option>
                  <option value="unidade3">Unidade 3</option>
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
                  <label>Nº Regulação:</label>
                  <input
                    type="number"
                    name="num_regulacao"
                    value={formData.num_regulacao ?? ''}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="line-StepContent-sub">
                  <label>num_prioridade:</label>
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
                <li><strong>num_idade:</strong> {formData.num_idade}</li>
                <li><strong>Unidade Origem:</strong> {formData.un_origem}</li>
                <li><strong>Unidade Destino:</strong> {formData.un_destino}</li>
                <li><strong>Data Hora 1ª Solicitação:</strong> {formData.data_hora_solicitacao_01}</li>
                <li><strong>num_prioridade:</strong> {formData.num_prioridade}</li>
                <li><strong>Nº Regulação:</strong> {formData.num_regulacao}</li>
                <li><strong>Nome do Médico Regulador:</strong> {formData.nome_regulador_medico}</li>
                <li><strong>Data Hora Acionamento Médico:</strong> {formData.data_hora_acionamento_medico}</li>
              </ul>
            </div>
          )}

        </div>

        <div className="Form-NovaRegulacao-Buttons">
          {currentStep > 1 && <button type="button" onClick={previousStep}>Voltar</button>}
          {currentStep < 4 && <button type="button" onClick={nextStep}>Avançar</button>}
          {currentStep === 4 && <button type="submit">Finalizar</button>}
        </div>
      </form>
      
      </div>
        {message && <div className="message success">{message}</div>}
        {error && <div className="message error">{error}</div>}
    
    </>
   
  );
};

export default NovaRegulacao;
