import React, { useState, ChangeEvent, FormEvent, Suspense } from 'react';
import axios from 'axios';

const NODE_URL = import.meta.env.VITE_NODE_SERVER_URL;

interface Props {
  nome_paciente: number;
  num_regulacao: number;
  un_origem: string;
  un_destino: string;
  id_regulacao: number;
}


interface FormDataRegulacaoMedico {
  vaga_autorizada: boolean;
  num_leito: number | null;
  justificativa_neg: string;
  nome_medico_destino: string;
  data_hora_regulacao_medico: string;
  justificativa_tempo30: string;
}

const initialFormData: FormDataRegulacaoMedico = {
  vaga_autorizada: true,
  num_leito: null,
  justificativa_neg: '',
  nome_medico_destino: '',
  data_hora_regulacao_medico: '',
  justificativa_tempo30: '',
};

const NovaRegulacaoMedicoAprovada: React.FC<Props> = ({ id_regulacao, nome_paciente, num_regulacao, un_origem, un_destino }) => {
  const [formData, setFormData] = useState<FormDataRegulacaoMedico>(initialFormData);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value, type } = e.target;
    const fieldValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setFormData((prevState) => ({
      ...prevState,
      [name]: fieldValue,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.nome_medico_destino.trim()) {
      setError('O nome do médico de destino é obrigatório.');
      return false;
    }
    if (!formData.num_leito.trim()) {
      setError('Leito é obrigatório.');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const dataToSubmit = {
        ...formData,
        id_regulacao
      };
      await axios.post(`${NODE_URL}/api/internal/post/RegulacaoMedico`, dataToSubmit);
      setMessage('Regulação médica cadastrada com sucesso!');
      setError('');
      window.location.reload();
      //setFormData(initialFormData); // Resetar o formulário
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erro ao cadastrar regulação médica. Por favor, tente novamente.');
      setMessage('');
    }
  };

  return (
    <div>
      <label>Dados Paciente</label>
      <div className='Div-DadosPaciente-RegulacaoMedica-Aprovada'>
        <label>Paciente: { nome_paciente }</label>
        <label>Regulação: { num_regulacao }</label>
        <label>Un. Origem: { un_origem }</label>
        <label>Un. Destino: { un_destino }</label>
      </div>
      

      <form onSubmit={handleSubmit} className='Form-RegulacaoMedica-Aprovada'>
        <div className='Div-RegulacaoMedica-Aprovada'>
          <div className='num_leito'>
            <label>Número do Leito:</label>
            <input
              type="number"
              name="num_leito"
              className='num_leito'
              value={formData.num_leito ?? ''}
              onChange={handleChange}
            />
          </div>
          <div className='nome_medico_destino'>
            <label>Nome do Médico de Destino:</label>
            <input
              type="text"
              name="nome_medico_destino"
              value={formData.nome_medico_destino}
              onChange={handleChange}
              required
            />
          </div>
        </div>
       
        <div className='justificativa_tempo30'>
          <label>Justificativa de Tempo 30:</label>
          <textarea
            name="justificativa_tempo30"
            value={formData.justificativa_tempo30}
            onChange={handleChange}
          />
        </div>
        <button type="submit">Autorizar</button>
      </form>
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default NovaRegulacaoMedicoAprovada;
