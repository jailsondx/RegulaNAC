import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import axios from 'axios';
import desfecho from '../../JSON/desfecho.json';
import criticidade from '../../JSON/criticidade.json';
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
    data_hora_chegada_origem: string;
    data_hora_saida_origem: string;
    data_hora_chegada_destino: string;
    desfecho: string;
    criticidade: string;
};

const initialFormData: FormDataTransporte = {
    id_user: '',
    nome_colaborador: '',
    data_hora_acionamento: '',
    data_hora_chegada_origem: '',
    data_hora_saida_origem: '',
    data_hora_chegada_destino: '',
    desfecho: '',
    criticidade: ''
};

const Transporte: React.FC<Props> = ({ id_regulacao, nome_paciente, num_regulacao, un_origem, un_destino, nome_regulador_medico, onClose, showSnackbar, }) => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [optionsDesfecho, setDesfecho] = useState([]);
    const [optionsCriticidade, setCriticidade] = useState([]);
    const [formData, setFormData] = useState<FormDataTransporte>(initialFormData);
    const [currentStep, setCurrentStep] = useState<number>(1);

    // Carregar os dados do arquivo JSON
    useEffect(() => {
        setDesfecho(desfecho);
        setCriticidade(criticidade);
    }, []);

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

            const response = await axios.post(`${NODE_URL}/api/internal/post/TransporteEDesfecho`, dataToSubmit);

            if (response.status === 200) {
                showSnackbar(response.data?.message || 'Regulação Aprovada - Transporte/Desfecho: Sucesso!', 'success');
                onClose();
            } else {
                showSnackbar(response.data?.message || 'Regulação Aprovada - Transporte/Desfecho: Erro!', 'error');
            }
        } catch (error: any) {
            showSnackbar(error.response?.data?.message || 'Erro ao enviar os dados!', 'error');
        }
    };

    const nextStep = (): void => {
        setCurrentStep((prev) => Math.min(prev + 1, 4));
    };

    const previousStep = (): void => {
        setCurrentStep((prev) => Math.max(prev - 1, 1));
    }

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

            <div className="Steps">
                <div className={`Step ${currentStep === 1 ? 'active' : ''}`}>Transporte</div>
                <div className={`Step ${currentStep === 2 ? 'active' : ''}`}>Origem</div>
                <div className={`Step ${currentStep === 3 ? 'active' : ''}`}>Destino</div>
                <div className={`Step ${currentStep === 4 ? 'active' : ''}`}>Desfecho</div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="div-Transporte">
                    {currentStep === 1 && (
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
                    )}

                    {currentStep === 2 && (
                        <div className="StepContent">
                            <div className="Transporte-line">
                                <label>Chegada do Técnico no Setor de Origem:</label>
                                <input
                                    type="datetime-local"
                                    name="data_hora_chegada_origem"
                                    className="data_hora_transporte"
                                    value={formData.data_hora_chegada_origem}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="Transporte-line">
                                <label>Saída do Técnico do Setor de Origem:</label>
                                <input
                                    type="datetime-local"
                                    name="data_hora_saida_origem"
                                    className="data_hora_transporte"
                                    value={formData.data_hora_saida_origem}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="StepContent">
                            <div className="Transporte-line">
                                <label>Chegada do Paciente no Setor de Destino:</label>
                                <input
                                    type="datetime-local"
                                    name="data_hora_chegada_destino"
                                    className="data_hora_transporte"
                                    value={formData.data_hora_chegada_destino}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {currentStep === 4 && (
                        <div className="StepContent">
                            <div className="Transporte-line">
                                <label>Desfecho:</label>
                                <select
                                    name="desfecho"
                                    value={formData.desfecho}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Selecione Desfecho</option>
                                    {optionsDesfecho.map((optionsDesfecho) => (
                                        <option key={optionsDesfecho.value} value={optionsDesfecho.value}>
                                            {optionsDesfecho.label}
                                        </option>
                                    ))}
                                </select>
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
                                    {optionsCriticidade.map((optionsCriticidade) => (
                                        <option key={optionsCriticidade.value} value={optionsCriticidade.value}>
                                            {optionsCriticidade.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}


                </div>
                <div className="Form-NovaRegulacao-Buttons">
                    {currentStep > 1 && <button type="button" onClick={previousStep}>Voltar</button>}
                    {currentStep < 4 && <button type="button" onClick={nextStep}>Avançar</button>}
                    {currentStep === 4 && <button type="submit">Finalizar</button>}
                </div>
            </form>
        </>
    );
};

export default Transporte;
