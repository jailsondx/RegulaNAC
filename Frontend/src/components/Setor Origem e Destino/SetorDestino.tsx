import React, { useState, ChangeEvent, FormEvent, Suspense, useEffect } from 'react';
import axios from 'axios';
import { getUserData } from '../../functions/storageUtils';

import './SetorOrigemDestino.css';

const NODE_URL = import.meta.env.VITE_NODE_SERVER_URL;

interface Props {
    nome_paciente: string;
    num_regulacao: number | null;
    un_origem: string;
    un_destino: string;
    id_regulacao: number;
    nome_regulador_medico: string;
    showSnackbar: (message: string, severity: 'success' | 'error' | 'info' | 'warning') => void; // Nova prop
}


interface FormDataRegulacaoAprovada {
    id_user: string;
    un_destino: string;
    nome_colaborador: string;
    data_hora_comunicacao: string;
}


const SetorDestino: React.FC<Props> = ({ id_regulacao, nome_paciente, num_regulacao, un_origem, un_destino, nome_regulador_medico, onClose, showSnackbar }) => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [formData, setFormData] = useState<FormDataRegulacaoAprovada>({
        id_user: '',
        un_destino: un_destino, // Use o valor de un_origem recebido nas props
        nome_colaborador: '',
        data_hora_comunicacao: '',
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
                id_regulacao,
                un_destino: un_destino,
            };

            const response = await axios.post(`${NODE_URL}/api/internal/post/RegulacaoDestino`, dataToSubmit);
            if(response.status == 200){
                // Mensagem com base na resposta da API
                showSnackbar(
                    response.data?.message || 'Regulação Aprovada - Destino: Sucesso!',
                    'success'
                );
                onClose(); // Fecha o modal
            }else{
                // Mensagem com base na resposta da API
                showSnackbar(
                    response.data?.message || 'Regulação Aprovada - Destino: Erro!',
                    'error'
                );
            }

        } catch (error: any) {
                // Mensagem com base na resposta da API
                showSnackbar(
                    error.response?.data?.message || 'CATCH ROUTER RegulacaoDestino',
                     'error'
                 );
        }
    };

    return (
        <>
      <div className='DadosPaciente-Border'>
        <label className='TitleDadosPaciente'>Dados Paciente</label>
        <div className='Div-DadosPaciente RegulacaoPaciente'>
          <label>Paciente: { nome_paciente }</label>
          <label>Regulação: { num_regulacao }</label>
          <label>Un. Destino: { un_origem }</label>
          <label>Un. Destino: { un_destino }</label>
          
        </div>
        <div className='Div-DadosMedico RegulacaoPaciente'>
          <label>Médico Regulador: { nome_regulador_medico }</label>
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

                    </div>

                   
                </div>
                <button type="submit">Cadastrar Destino</button>
            </form>
        </>
    );
};

export default SetorDestino;
