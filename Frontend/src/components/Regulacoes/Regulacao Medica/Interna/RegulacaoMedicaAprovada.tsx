import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import axios from 'axios';
import { AxiosError } from 'axios';

/*IMPORT COMPONENTS*/
import DadosPaciente from '../../../Dados Paciente/DadosPaciente';

/*IMPORT INTERFACES*/
import { UserData } from '../../../../interfaces/UserData';
import { DadosPacienteData } from '../../../../interfaces/DadosPaciente';
import { RegulacaoMedicoData } from '../../../../interfaces/Regulacao';
import { UnidadeData } from '../../../../interfaces/Unidade';

/*IMPORT FUNCTIONS*/
import { getUserData } from '../../../../functions/storageUtils';

/*IMPORT UTILS*/
import { useSocket } from '../../../../Utils/useSocket';

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
  num_leito: '',
  extra: false,
  justificativa_neg: '',
  nome_regulador_medico: '',
  autorizacao: '',
  data_hora_regulacao_medico: '',
  justificativa_tempo30: '',
  un_destino: ''
};

const NovaRegulacaoMedicoAprovada: React.FC<Props> = ({ dadosPaciente, tempoEspera, onClose, showSnackbar }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const userUsername = userData?.login || ''; // Nome do usuário
  const userTipo = userData?.tipo || ''; // Tipo de usuário
  const [unidadesUTI, setUnidadesUTI] = useState<UnidadeData[]>([]);
  const [unidadesClinicaMedica, setUnidadesClinicaMedica] = useState<UnidadeData[]>([]);
  const [formData, setFormData] = useState<RegulacaoMedicoData>(initialFormData);


  //Pega dados do SeassonStorage User
  useEffect(() => {
    const data = getUserData();
    setUserData(data);
  }, []);

  // Carregar os dados do arquivo JSON
  useEffect(() => {
    //setUnidadesUTI(UTI_adulto);
    axios.get('/JSON/UTI_adulto.json')
    .then((res) => {
      setUnidadesUTI(res.data);  // Atualiza o estado com os dados do JSON
    })
    .catch(() => {
      showSnackbar('Erro ao carregar os dados Setores de Origem','error');  // Se ocorrer erro, atualiza o estado
    });

    //setUnidadesClinicaMedica(clinica_medica);
    axios.get('/JSON/clinica_medica.json')
    .then((res) => {
      setUnidadesClinicaMedica(res.data);  // Atualiza o estado com os dados do JSON
    })
    .catch(() => {
      showSnackbar('Erro ao carregar os dados Setores de Origem','error');  // Se ocorrer erro, atualiza o estado
    });
  }, []);

  //Função para fazer o envio de mensagem para o socket
  const { enviarMensagem } = useSocket(userUsername, userTipo, (mensagem) => {
    showSnackbar(mensagem, 'warning');
  });


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

    if (!formData.autorizacao) {
      showSnackbar('O campo Autorização é obrigatório.', 'error');
      return false;
    }

    if (dadosPaciente.un_destino === 'UTI ADULTO' || dadosPaciente.un_destino === 'CLINICA MEDICA') {
      if (!formData.un_destino) {
        showSnackbar('O campo de UNIDADE é obrigatório.', 'error');
        return false;
      }
    }

    // Regex para capturar horas e minutos em qualquer ordem ou presença
    const regex = /(?:(\d+)\s*h)?\s*(?:(\d+)\s*min)?/i;
    const match = tempoEspera.match(regex);
    const hours = match && match[1] ? parseInt(match[1]) : 0;
    const minutes = match && match[2] ? parseInt(match[2]) : 0;

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
        enviarMensagem('Regulação Nº' + dadosPaciente.id_regulacao + ' Aprovada');
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
        <DadosPaciente dadosPaciente={dadosPaciente} />
      </div>

      <form onSubmit={handleSubmit}>
        <div className='modal-input'>
          <div className='modal-input-line'>
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

          <div className='modal-input-line2'>
            <div>
              <label>Autorização:</label>
              <select
                className='select-destino'
                name="autorizacao"
                value={formData.autorizacao}
                onChange={handleChange}
                required
              >
                <option value="">Selecione...</option>
                <option value="AUTORIZADO">Autorizado</option>
                <option value="PRE-AUTORIZADO 1">Pré Autorizado 1</option>
                <option value="PRE-AUTORIZADO 2">Pré Autorizado 2</option>
                <option value="PRE-AUTORIZADO 3">Pré Autorizado 3</option>
                <option value="PRE-AUTORIZADO 4">Pré Autorizado 4</option>
                <option value="PRE-AUTORIZADO 5">Pré Autorizado 5</option>
                <option value="PRE-AUTORIZADO 6">Pré Autorizado 6</option>
                <option value="PRE-AUTORIZADO 7">Pré Autorizado 7</option>
                <option value="PRE-AUTORIZADO 8">Pré Autorizado 8</option>
                <option value="PRE-AUTORIZADO 9">Pré Autorizado 9</option>
                <option value="PRE-AUTORIZADO 10">Pré Autorizado 10</option>
              </select>
            </div>

            {dadosPaciente.un_destino === 'UTI ADULTO' && (
              <div>
                <label>UTI:</label>
                <select
                  className='select-destino'
                  name="un_destino"
                  value={formData.un_destino || ''}
                  onChange={handleChange}
                >
                  <option value="">Selecione...</option>
                  {unidadesUTI.map((item, index) => (
                    <option key={index} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {dadosPaciente.un_destino === 'CLINICA MEDICA' && (
              <div>
                <label>CM:</label>
                <select
                  className='select-destino'
                  name="un_destino"
                  value={formData.un_destino || ''}
                  onChange={handleChange}
                >
                  <option value="">Selecione...</option>
                  {unidadesClinicaMedica.map((item, index) => (
                    <option key={index} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

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
          </div>

          <div className="modal-input-line">
            <label>Justificativa de Tempo +30min: <i>Tempo Decorrido: {tempoEspera}</i></label>
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

export default NovaRegulacaoMedicoAprovada;
