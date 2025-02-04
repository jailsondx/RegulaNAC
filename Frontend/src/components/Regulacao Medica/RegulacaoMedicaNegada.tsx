import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import axios from 'axios';
import { AxiosError } from 'axios';


/*IMPORT INTERFACES*/
import { UserData } from '../../interfaces/UserData';
import { DadosPacienteData } from '../../interfaces/DadosPaciente';
import { RegulacaoMedicoData } from '../../interfaces/Regulacao';

/*IMPORT FUNCTIONS*/
import { getUserData } from '../../functions/storageUtils';

/*IMPORT VARIAVEIS DE AMBIENTE*/
const NODE_URL = import.meta.env.VITE_NODE_SERVER_URL;

interface Props {
  dadosPaciente: DadosPacienteData;
  tempoEspera: string; // Tempo de espero pelo TimeTracker
  onClose: () => void; // Função de fechado Modal + Snackbar status
  showSnackbar: (message: string, severity: 'success' | 'error' | 'info' | 'warning') => void; // valores para controle do snackbar
}


const initialFormData: RegulacaoMedicoData = {
  id_user: '',
  vaga_autorizada: true,
  num_leito: null,
  justificativa_neg: '',
  nome_regulador_medico: '',
  data_hora_regulacao_medico: '',
  justificativa_tempo30: '',
};

const NovaRegulacaoMedicoNegada: React.FC<Props> = ({ dadosPaciente, onClose, showSnackbar }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [formData, setFormData] = useState<RegulacaoMedicoData>(initialFormData);

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
    // Valida número do leito
    if (!formData.justificativa_neg) {
      showSnackbar('O campo "Justificativa" é obrigatório.', 'error');
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
        id_regulacao: dadosPaciente.id_regulacao,
        nome_regulador_medico: userData?.nome,
      };

      const response = await axios.post(`${NODE_URL}/api/internal/post/RegulacaoMedico`, dataToSubmit);

      // Verifica o status e exibe a mensagem de sucesso
      showSnackbar(
        response.data?.message || 'Regulação médica cadastrada com sucesso!',
        'success'
      );

      if (onClose) {
        onClose(); // Fecha o modal
      }
    } catch (error: unknown) {
      // Verifique se o erro é uma instância de AxiosError antes de acessar propriedades específicas
      if (error instanceof AxiosError) {
        console.error('Erro ao cadastrar regulação médica:', error);
    
        // Exibe mensagem de erro retornada pela API ou mensagem padrão
        showSnackbar(
          error.response?.data?.message || 'Erro ao cadastrar regulação médica. Por favor, tente novamente.',
          'error'
        );
      } else {
        // Se não for um erro do Axios, trata-se de outro tipo de erro
        console.error('Erro desconhecido:', error);
        showSnackbar('Erro desconhecido. Por favor, tente novamente.', 'error');
      }
    }
  };


  return (
    <div>
      <div className='DadosPaciente-Border'>
        <label className='TitleDadosPaciente'>Dados Paciente</label>
        <div className='Div-DadosPaciente RegulacaoPaciente'>
          <label>Paciente: {dadosPaciente.nome_paciente}</label>
          <label>Regulação: {dadosPaciente.num_regulacao}</label>
          <label>Un. Origem: {dadosPaciente.un_origem}</label>
          <label>Un. Destino: {dadosPaciente.un_destino}</label>

        </div>
        <div className='Div-DadosMedico RegulacaoPaciente'>
          <label>Médico Regulador: {dadosPaciente.nome_regulador_medico}</label>
        </div>
      </div>


      <form onSubmit={handleSubmit}>
        <div className='Div-RegulacaoMedica-AprovadaNegada'>
          
          <div className='nome_regulador_medico'>
            <label>Médico:</label>
            <input
              type="text"
              name="nome_regulador_medico"
              value={userData?.nome}
              onChange={handleChange}
              required
              disabled
            />
          </div>
        </div>

        <div className='justificativa'>
          <label>Justificativa de Negação:</label>
          <textarea
            name="justificativa_neg"
            value={formData.justificativa_neg}
            onChange={handleChange}
            required
          />
        </div>

      
        <button type="submit" className='button-red'>Negar</button>
      </form>
    </div>
  );
};

export default NovaRegulacaoMedicoNegada;
