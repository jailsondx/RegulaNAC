import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import axios from 'axios';
import { AxiosError } from 'axios';
import { TiBookmark } from "react-icons/ti";

/*IMPORT COMPONENTS*/
import DadosPaciente from '../Dados Paciente/DadosPaciente';

/*IMPORT FUNCTIONS*/
import { getUserData } from '../../functions/storageUtils';

/*IMPORT INTERFACES*/
import { UserData } from '../../interfaces/UserData';
import { DadosPacienteData } from '../../interfaces/DadosPaciente';
import { TransporteDatesData } from '../../interfaces/Transporte';
import { AtrasoLeitoOptions } from '../../interfaces/Transporte';

/*IMPORT JSON*/
import atrasoleito from '../../JSON/atraso.json';

/*IMPORT CSS*/
import './Transporte.css';

/*IMPORT VARIAVEIS DE AMBIENTE*/
const NODE_URL = import.meta.env.VITE_NODE_SERVER_URL;

interface Props {
    dadosPaciente: DadosPacienteData;
    onClose: () => void;
    showSnackbar: (message: string, severity: 'success' | 'error' | 'info' | 'warning') => void;
};

const initialFormData: TransporteDatesData = {
    data_hora_chegada_origem: '',
    data_hora_saida_origem: '',
    data_hora_liberacao_leito: '',
    data_hora_chegada_destino: '',
    observacao: ''
};

const Transporte02: React.FC<Props> = ({ dadosPaciente, onClose, showSnackbar }) => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [formData, setFormData] = useState<TransporteDatesData>(initialFormData);
    const [currentStep, setCurrentStep] = useState<number>(1);
    const [observacao, setObservacao] = useState<string>('');
    const [diferencaHoras, setDiferencaHoras] = useState<number>(0);
    const [optionsAtrasoLeito, setOptionsAtrasoLeito] = useState<AtrasoLeitoOptions[]>([]);

    // Pega dados do Session Storage
    useEffect(() => {
        const data = getUserData();
        setUserData(data);
    }, []);

    // CARREGA OS DADOS JSON
    useEffect(() => {
        setOptionsAtrasoLeito(atrasoleito);
    }, []);

    // Calcula a diferença entre os horários
    useEffect(() => {
        if (formData.data_hora_liberacao_leito && formData.data_hora_chegada_destino) {
            const liberacaoLeito = new Date(formData.data_hora_liberacao_leito).getTime();
            const chegadaDestino = new Date(formData.data_hora_chegada_destino).getTime();
            const diferencaMs = chegadaDestino - liberacaoLeito;
            const diferencaHoras = diferencaMs / (1000 * 60 * 60); // Converter milissegundos para horas
            setDiferencaHoras(diferencaHoras);
        }
    }, [formData.data_hora_liberacao_leito, formData.data_hora_chegada_destino]);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const validateForm = (): boolean => {
        if (!formData.data_hora_chegada_origem.trim() || !formData.data_hora_saida_origem.trim() || !formData.data_hora_liberacao_leito.trim() || !formData.data_hora_chegada_destino.trim()) {
            showSnackbar('Todas as datas e horários são obrigatórios!', 'warning');
            return false;
        }

        if (diferencaHoras >= 2 && !observacao.trim()) {
            showSnackbar('A observação é obrigatória quando a diferença entre os horários é igual ou maior a 2 horas.', 'warning');
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
                observacao: diferencaHoras >= 2 ? observacao : null, // Inclui a observação apenas se necessário
                id_user: userData?.id_user,
                id_regulacao: dadosPaciente.id_regulacao,
            };

            const response = await axios.put(`${NODE_URL}/api/internal/put/Transporte`, dataToSubmit);

            if (response.status === 200) {
                showSnackbar(response.data?.message || 'Regulação Aprovada - Transporte: Sucesso!', 'success');
                onClose();
            } else {
                showSnackbar(response.data?.message || 'Regulação Aprovada - Transporte: Erro!', 'error');
            }
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                showSnackbar(error.response?.data?.message || 'Erro ao enviar os dados!', 'error');
            } else {
                showSnackbar('Erro desconhecido ao enviar os dados. Tente novamente.', 'error');
            }
        }
    };

    const nextStep = (): void => {
        setCurrentStep((prev) => Math.min(prev + 1, 4));
    };

    const previousStep = (): void => {
        setCurrentStep((prev) => Math.max(prev - 1, 1));
    };

    return (
        <>
            <div>
                <DadosPaciente dadosPaciente={dadosPaciente} />
            </div>

            <div className="Steps">
                <div className={`Step ${currentStep === 1 ? 'active' : ''}`}><TiBookmark />Transporte Origem</div>
                <div className={`Step ${currentStep === 2 ? 'active' : ''}`}><TiBookmark />Transporte Destino</div>
                <div className={`Step ${currentStep === 3 ? 'active' : ''}`}><TiBookmark />Liberação do Leito</div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="div-Transporte">
                    {currentStep === 1 && (
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

                    {currentStep === 2 && (
                        <div className="StepContentTransporte">
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

                    {currentStep === 3 && (
                        <div className="StepContentTransporte">
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

                            <div className="Transporte-line">
                                <label>Observação: Obrigatório caso o tempo de ocupação do leito for maior que 2h</label>
                                <select
                                    name="observacao"
                                    value={observacao}
                                    onChange={(e) => setObservacao(e.target.value)}
                                    required={diferencaHoras >= 2} // Torna obrigatório se a diferença ≥ 2h
                                >
                                    <option value="">Selecione o Motivo</option>
                                    {optionsAtrasoLeito.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                </div>
                <div className="Div-Buttons End">
                    {currentStep > 1 && <button type="button" onClick={previousStep}>Voltar</button>}
                    {currentStep < 3 && <button type="button" onClick={nextStep}>Avançar</button>}
                    {currentStep === 3 && <button type="submit">Finalizar</button>}
                </div>
            </form>
        </>
    );
};

export default Transporte02;