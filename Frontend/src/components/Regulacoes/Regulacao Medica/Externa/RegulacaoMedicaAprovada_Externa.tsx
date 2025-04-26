import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import axios from 'axios';
import { AxiosError } from 'axios';

/*IMPORT COMPONENTS*/
import DadosPaciente_Externo from '../../../Dados Paciente/DadosPaciente_Externo';

/*IMPORT INTERFACES*/
import { UserData } from '../../../../interfaces/UserData';
import { DadosPacienteExternoData } from '../../../../interfaces/DadosPaciente';
import { RegulacaoMedicoData } from '../../../../interfaces/Regulacao';

/*IMPORT FUNCTIONS*/
import { getUserData } from '../../../../functions/storageUtils';

/*IMPORT CSS*/
import '../../../Modal/Modal-Inputs.css';

/*IMPORT VARIAVEIS DE AMBIENTE*/
const NODE_URL = import.meta.env.VITE_NODE_SERVER_URL;

interface Props {
  dadosPaciente: DadosPacienteExternoData;
  tempoEspera: string; // Tempo de espero pelo TimeTracker
  onClose: () => void; // Função de fechado Modal + Snackbar status
  showSnackbar: (message: string, severity: 'success' | 'error' | 'info' | 'warning') => void; // valores para controle do snackbar
}

const initialFormData: RegulacaoMedicoData = {
  id_user: '',
  vaga_autorizada: true,
  num_leito: '',
  extra: false,
  justificativa_neg: '',
  nome_regulador_medico: '',
  data_hora_regulacao_medico: '',
  justificativa_tempo30: '',
};

const NovaRegulacaoMedicoAprovada_Externa: React.FC<Props> = ({ dadosPaciente, tempoEspera, onClose, showSnackbar }) => {
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
    if (!formData.num_leito) {
      showSnackbar('O campo "Número do Leito" é obrigatório.', 'error');
      return false;
    }

    // Verifica o tempo e se a justificativa é necessária
    const [hours, minutes] = tempoEspera.split(/h|m/).map(Number);
    if ((hours > 0 || minutes >= 30) && !formData.justificativa_tempo30?.trim()) {
      showSnackbar('Para tempos de espera acima de 30 minutos, a Justificativa é obrigatória.', 'info');
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
        id_user: userData?.id_user,
        id_regulacao: dadosPaciente.id_regulacao,
        nome_regulador_medico: userData?.nome,
      };

      const response = await axios.post(`${NODE_URL}/api/internal/post/RegulacaoMedico`, dataToSubmit);

      if (response.status == 200) {
        // Mensagem com base na resposta da API
        showSnackbar(
          response.data?.message || 'Regulação Médica - Aprovada com Sucesso!',
          'success'
        );
        onClose(); // Fecha o modal
      } else {
        // Mensagem com base na resposta da API
        showSnackbar(
          response.data?.message || 'Regulação Médica - Aprovada: Erro!',
          'error'
        );
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
      <div>
        <DadosPaciente_Externo dadosPaciente={dadosPaciente} />
      </div>

      <form onSubmit={handleSubmit}>
        <div className='modal-input'>
          <div className='modal-input-line2'>
            <div className='num_leito'>
              <label>Nº do Leito:</label>
              <input
                type="number"
                name="num_leito"
                className='num_leito'
                value={formData.num_leito ?? ''}
                onChange={handleChange}
                required
              />
            </div>
            <div className="extra">
              <span>Extra?</span>
              <input
                type="checkbox"
                id="extraCheckbox"
                name="extra"
                checked={formData.extra}
                onChange={handleChange}
              />
              <label htmlFor="extraCheckbox"></label>
            </div>

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
          
          <div className="modal-input-line">
            <label>Justificativa de Tempo +30min:</label>
            <textarea
              className="modal-input-textarea"
              name="justificativa_tempo30"
              value={formData.justificativa_tempo30}
              onChange={handleChange}
            />
          </div>
        </div>


        <button type="submit">Autorizar</button>
      </form>
    </div>
  );
};

export default NovaRegulacaoMedicoAprovada_Externa;
