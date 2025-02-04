import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import axios from 'axios';
import { AxiosError } from 'axios';

/*IMPORT FUNCTIONS*/
import { getUserData } from '../../functions/storageUtils';

/*IMPORT INTERFACES*/
import { UserData } from '../../interfaces/UserData';
import { DadosPacienteData } from '../../interfaces/DadosPaciente';
import { OrigemData } from '../../interfaces/Transporte';

/*IMPORT CSS*/
import './SetorOrigemDestino.css';


const NODE_URL = import.meta.env.VITE_NODE_SERVER_URL;

interface Props {
    dadosPaciente: DadosPacienteData;
    onClose: () => void; // Adicionado
    showSnackbar: (message: string, severity: 'success' | 'error' | 'info' | 'warning') => void; // Nova prop
};

const initialFormData: OrigemData = {
    id_user: '',
    nome_colaborador: '',
    un_origem: '',
    data_hora_comunicacao: '',
    preparo_leito: '',
};

const SetorOrigem: React.FC<Props> = ({ dadosPaciente, onClose, showSnackbar }) => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [formData, setFormData] = useState<OrigemData>({
        ...initialFormData, // Espalha os valores iniciais
        un_origem: dadosPaciente.un_origem, // Sobrescreve apenas 'un_origem'
    });


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
        if (!formData.nome_colaborador.trim()) {
            // Mensagem SNACKBAR
            showSnackbar(
                'Colaborador é obrigatório!',
                'warning'
            );
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
            };

            const response = await axios.post(`${NODE_URL}/api/internal/post/RegulacaoOrigem`, dataToSubmit);
           
            if(response.status === 200){
                // Mensagem com base na resposta da API
                showSnackbar(
                    response.data?.message || 'Regulação Aprovada - Origem: Sucesso!',
                    'success'
                );
                onClose(); // Fecha o modal
            } else{
                // Mensagem com base na resposta da API
                showSnackbar(
                    response.data?.message || 'Regulação Aprovada - Origem: Erro!',
                    'error'
                );
            }

        } catch (error: unknown) {
            if (error instanceof AxiosError && error.response) {
              const { data } = error.response;
              
              // Mensagem com base na resposta da API
              showSnackbar(
                data?.message || 'Erro desconhecido. Por favor, tente novamente.',
                'error'
              );
            } else {
              // Se o erro não for um AxiosError ou não tiver uma resposta
              showSnackbar(
                'Erro na requisição. Por favor, verifique sua conexão ou tente novamente.',
                'error'
              );
            }
          }
    };

    return (
        <>
      <div className='DadosPaciente-Border'>
        <label className='TitleDadosPaciente'>Dados Paciente</label>
        <div className='Div-DadosPaciente RegulacaoPaciente'>
          <label>Paciente: { dadosPaciente.nome_paciente }</label>
          <label>Regulação: { dadosPaciente.num_regulacao }</label>
          <label>Un. Origem: { dadosPaciente.un_origem }</label>
          <span>
            <label>Un. Destino: { dadosPaciente.un_destino }</label>
            <label>Leito: { dadosPaciente.num_leito }</label>
          </span>

          
          
        </div>
        <div className='Div-DadosMedico RegulacaoPaciente'>
          <label>Médico Regulador: { dadosPaciente.nome_regulador_medico }</label>
        </div>
      </div>

            <form onSubmit={handleSubmit}>
                <div className='div-SetorOrigemDestino'>
                    <div className='subdiv-SetorOrigemDestino'>
                        <div className="SetorOrigemDestino-line">
                            <label>Nome do Colaborador que recebeu a comunicação:</label>
                            <input
                                type="text"
                                name="nome_colaborador"
                                value={formData.nome_colaborador ?? ''}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    
                    <div className='subdiv-SetorOrigemDestino'>
                        <div className="SetorOrigemDestino-line">
                            <label>Data e Hora do Acionamento:</label>
                            <input
                                type="datetime-local"
                                name="data_hora_comunicacao"
                                className="SetorOrigemDestino-line-input"
                                value={formData.data_hora_comunicacao}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="SetorOrigemDestino-line">
                            <label>Preparo do Leito:</label>
                            <input
                                type="text"
                                name="preparo_leito"
                                className="SetorOrigemDestino-line-input"
                                value={formData.preparo_leito}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                   
                </div>
                <button type="submit">Cadastrar Origem</button>
            </form>
        </>
    );
};

export default SetorOrigem;
