import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import axios from 'axios';
import { AxiosError } from 'axios';

/*IMPORT COMPONENTS*/
import DadosPaciente from '../Dados Paciente/DadosPaciente';

/*IMPORT FUNCTIONS*/
import { getUserData } from '../../functions/storageUtils';

/*IMPORT INTERFACES*/
import { UserData } from '../../interfaces/UserData';
import { DadosPacienteData } from '../../interfaces/DadosPaciente';
import { TransporteData } from '../../interfaces/Transporte';
import { CriticidadeOptions } from '../../interfaces/Desfecho';

/*IMPORT JSON*/
import criticidade from '../../JSON/criticidade.json';

/*IMPORT CSS*/
import '../Modal/Modal-Inputs.css';

/*IMPORT VARIAVEIS DE AMBIENTE*/
const NODE_URL = import.meta.env.VITE_NODE_SERVER_URL;

interface Props {
    dadosPaciente: DadosPacienteData;
    onClose: () => void;
    showSnackbar: (message: string, severity: 'success' | 'error' | 'info' | 'warning') => void;
};

const initialFormData: TransporteData = {
    id_user: '',
    nome_colaborador: '',
    data_hora_acionamento: '',
    data_hora_liberacao_leito: '',
    criticidade: '',
};

const Transporte01: React.FC<Props> = ({ dadosPaciente, onClose, showSnackbar, }) => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [formData, setFormData] = useState<TransporteData>(initialFormData);
    const [optionsCriticidade, setOptionsCriticidade] = useState<CriticidadeOptions[]>([]);


    //Pega dados do Seasson Storage
    useEffect(() => {
        const data = getUserData();
        setUserData(data);
    }, []);

    useEffect(() => {
        setOptionsCriticidade(criticidade);
    }, []);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const validateForm = (): boolean => {
        if (!formData.nome_colaborador.trim()) {
            showSnackbar('Colaborador é obrigatório!', 'warning');
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

            const response = await axios.post(`${NODE_URL}/api/internal/post/Transporte`, dataToSubmit);

            if (response.status === 200) {
                showSnackbar(response.data?.message || 'Regulação Aprovada - Transporte: Sucesso!', 'success');
                onClose();
            } else {
                showSnackbar(response.data?.message || 'Regulação Aprovada - Transporte: Erro!', 'error');
            }
        } catch (error: unknown) {
            // Verifica se o erro é uma instância de AxiosError
            if (error instanceof AxiosError) {
                // Exibe a mensagem de erro da resposta ou a mensagem padrão
                showSnackbar(error.response?.data?.message || 'Erro ao enviar os dados!', 'error');
            } else {
                // Se o erro não for do tipo AxiosError, exibe uma mensagem genérica
                showSnackbar('Erro desconhecido ao enviar os dados. Tente novamente.', 'error');
            }
        }
    };

    return (
        <>
            <div>
                <DadosPaciente dadosPaciente={dadosPaciente} />
            </div>

            <form onSubmit={handleSubmit}>
                <div className="modal-input">
                        <div className="modal-input-line">
                            <label>Nome do Responsável pelo Transporte:</label>
                            <input
                                type="text"
                                name="nome_colaborador"
                                value={formData.nome_colaborador}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className='modal-input-line2'>
                            <div className="Transporte-line">
                                <label>Acionamento do Transporte:</label>
                                <input
                                    type="datetime-local"
                                    name="data_hora_acionamento"
                                    className="data_hora_transporte"
                                    value={formData.data_hora_acionamento}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="Transporte-line">
                                <label>Criticidade:</label>
                                <select
                                    name="criticidade"
                                    value={formData.criticidade}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Selecione Criticidade</option>
                                    {optionsCriticidade.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                        </div>

                        <div className="Transporte-line">
                            <label>Hora da liberação do leito:</label>
                            <input
                                type="datetime-local"
                                name="data_hora_liberacao_leito"
                                className="data_hora_transporte"
                                value={formData.data_hora_liberacao_leito}
                                onChange={handleChange}
                                required
                            />
                        </div>
                </div>
                <button type="submit">Finalizar</button>
            </form>
        </>
    );
};

export default Transporte01;
