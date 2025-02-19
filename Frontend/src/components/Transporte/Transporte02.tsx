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
import { TransporteDatesData } from '../../interfaces/Transporte';

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

    // Pega dados do Session Storage
    useEffect(() => {
        const data = getUserData();
        setUserData(data);
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
                <div className={`Step ${currentStep === 1 ? 'active' : ''}`}>Transporte Origem</div>
                <div className={`Step ${currentStep === 2 ? 'active' : ''}`}>Transporte Destino</div>
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
                        <div className="StepContent2">
                            <div>
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

                            <div>
                                <div className="Transporte-line">
                                    <label>Observação:</label>
                                    <textarea
                                        name="observacao"
                                        value={observacao}
                                        onChange={(e) => setObservacao(e.target.value)}
                                        placeholder="Observação obrigatório caso o tempo seja maior do que 2h"
                                        required={diferencaHoras >= 2} // Torna obrigatório se a diferença ≥ 2h
                                    />
                                </div>
                            </div>

                        </div>
                    )}
                </div>
                <div className="Div-Buttons End">
                    {currentStep > 1 && <button type="button" onClick={previousStep}>Voltar</button>}
                    {currentStep < 2 && <button type="button" onClick={nextStep}>Avançar</button>}
                    {currentStep === 2 && <button type="submit">Finalizar</button>}
                </div>
            </form>
        </>
    );
};

export default Transporte02;