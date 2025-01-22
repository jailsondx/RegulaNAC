import React, { useState, ChangeEvent, FormEvent, Suspense, useEffect } from 'react';
import axios from 'axios';
import { getUserData } from '../../functions/storageUtils';

const NODE_URL = import.meta.env.VITE_NODE_SERVER_URL;

interface Props {
  id_user: string;
  nome_paciente: number;
  num_regulacao: number;
  un_origem: string;
  un_destino: string;
  id_regulacao: number;
  nome_regulador_medico: string;
  onClose: () => void; // Adicionado
  showSnackbar: (message: string, severity: 'success' | 'error') => void; // Nova prop
}

interface FormDataRegulacaoMedico {
  id_user: string;
  vaga_autorizada: boolean;
  num_leito: number | null;
  justificativa_neg: string;
  nome_regulador_medico: string;
  data_hora_regulacao_medico: string;
  justificativa_tempo30: string;
}

const initialFormData: FormDataRegulacaoMedico = {
  id_user: '',
  vaga_autorizada: true,
  num_leito: null,
  justificativa_neg: '',
  nome_regulador_medico: '',
  data_hora_regulacao_medico: '',
  justificativa_tempo30: '',
};

const NovaRegulacaoMedicoAprovada: React.FC<Props> = ({ id_regulacao, nome_paciente, num_regulacao, un_origem, un_destino, nome_regulador_medico, onClose, showSnackbar }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [formData, setFormData] = useState<FormDataRegulacaoMedico>(initialFormData);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');


    //Pega dados do SeassonStorage User
    useEffect(() => {
      const data = getUserData();
      setUserData(data);
    }, []);


  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value, type } = e.target;
    const fieldValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setFormData((prevState) => ({
      ...prevState,
      [name]: fieldValue,
    }));
  };

  const validateForm = (): boolean => {
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
            id_user: userData?.id_user,
            id_regulacao,
            nome_regulador_medico: userData?.nome,
        };

        const response = await axios.post(`${NODE_URL}/api/internal/post/RegulacaoMedico`, dataToSubmit);

        // Mensagem com base na resposta da API
        showSnackbar(
            response.data?.message || 'Regulação médica cadastrada com sucesso!',
            'success'
        );

        if (onClose) {
            onClose(); // Fecha o modal
        }
    } catch (error: any) {
        console.error('Erro ao cadastrar regulação médica:', error);

        // Mensagem de erro com base na resposta da API
        showSnackbar(
            error.response?.data?.message || 'Erro ao cadastrar regulação médica. Por favor, tente novamente.',
            'error'
        );
    }
};

  
  
  

  return (
    <div>
      <div className='DadosPaciente-Border'>
        <label className='TitleDadosPaciente'>Dados Paciente</label>
        <div className='Div-DadosPaciente RegulacaoMedica-Aprovada'>
          <label>Paciente: { nome_paciente }</label>
          <label>Regulação: { num_regulacao }</label>
          <label>Un. Origem: { un_origem }</label>
          <label>Un. Destino: { un_destino }</label>
          
        </div>
        <div className='Div-DadosMedico RegulacaoMedica-Aprovada'>
          <label>Médico Regulador: { nome_regulador_medico }</label>
        </div>
      </div>
      

      

      <form onSubmit={handleSubmit}>
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
          <div className='nome_regulador_medico'>
            <label>Médico Aprovador:</label>
            <input
              type="text"
              name="nome_regulador_medico"
              value={userData?.nome}
              onChange={handleChange}
              required
              readOnly
            />
          </div>
        </div>
       
        <div className='justificativa'>
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
