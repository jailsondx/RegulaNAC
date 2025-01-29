import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import axios from 'axios';
import { getUserData } from '../../functions/storageUtils';

import './Transporte.css';

const NODE_URL = import.meta.env.VITE_NODE_SERVER_URL;

interface Props {
    nome_paciente: string;
    num_regulacao: number | null;
    un_origem: string;
    un_destino: string;
    id_regulacao: number;
    nome_regulador_medico: string;
    onClose: () => void;
    showSnackbar: (message: string, severity: 'success' | 'error' | 'info' | 'warning') => void;
};

interface FormDataTransporte {
    id_user: string;
    nome_colaborador: string;
    data_hora_acionamento: string;
};

const initialFormData: FormDataTransporte = {
    id_user: '',
    nome_colaborador: '',
    data_hora_acionamento: '',
};

const Transporte01: React.FC<Props> = ({ id_regulacao, nome_paciente, num_regulacao, un_origem, un_destino, nome_regulador_medico, onClose, showSnackbar, }) => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [formData, setFormData] = useState<FormDataTransporte>(initialFormData);

    //Pega dados do Seasson Storage
    useEffect(() => {
        const data = getUserData();
        setUserData(data);
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
                id_user: userData?.id_user || '',
                id_regulacao,
            };

            const response = await axios.post(`${NODE_URL}/api/internal/post/Transporte`, dataToSubmit);

            if (response.status === 200) {
                showSnackbar(response.data?.message || 'Regulação Aprovada - Transporte: Sucesso!', 'success');
                onClose();
            } else {
                showSnackbar(response.data?.message || 'Regulação Aprovada - Transporte: Erro!', 'error');
            }
        } catch (error: any) {
            showSnackbar(error.response?.data?.message || 'Erro ao enviar os dados!', 'error');
        }
    };

    return (
        <>
            <div className="DadosPaciente-Border">
                <label className="TitleDadosPaciente">Dados Paciente</label>
                <div className="Div-DadosPaciente RegulacaoPaciente">
                    <label>Paciente: {nome_paciente}</label>
                    <label>Regulação: {num_regulacao}</label>
                    <label>Un. Origem: {un_origem}</label>
                    <label>Un. Destino: {un_destino}</label>
                </div>
                <div className="Div-DadosMedico RegulacaoPaciente">
                    <label>Médico Regulador: {nome_regulador_medico}</label>
                </div>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="div-Transporte">
                    <div className="StepContent">
                        <div className="Transporte-line">
                            <label>Nome do Responsável pelo Transporte:</label>
                            <input
                                type="text"
                                name="nome_colaborador"
                                value={formData.nome_colaborador}
                                onChange={handleChange}
                                required
                            />
                        </div>

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
                    </div>
                </div>
                <button type="submit">Finalizar</button>
            </form>
        </>
    );
};

export default Transporte01;
