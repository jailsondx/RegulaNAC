import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import axios from 'axios';
import { AxiosError } from 'axios';

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
};

const Transporte02: React.FC<Props> = ({ dadosPaciente, onClose, showSnackbar, }) => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [formData, setFormData] = useState<TransporteDatesData>(initialFormData);
    const [currentStep, setCurrentStep] = useState<number>(1);

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
        if (!formData.data_hora_chegada_origem.trim() || !formData.data_hora_saida_origem.trim() || !formData.data_hora_liberacao_leito.trim() || !formData.data_hora_chegada_destino.trim()) {
            showSnackbar('Todas as datas e horário são obrigatórios!', 'warning');
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

            const response = await axios.put(`${NODE_URL}/api/internal/put/Transporte`, dataToSubmit);

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
                    <label>Paciente: {dadosPaciente.nome_paciente}</label>
                    <label>Regulação: {dadosPaciente.num_regulacao}</label>
                    <label>Un. Origem: {dadosPaciente.un_origem}</label>
                    <span >
                        <label>Un. Destino: {dadosPaciente.un_destino}</label>
                        <label>Leito: {dadosPaciente.num_leito}</label>
                    </span>
                </div>
                <div className="Div-DadosMedico RegulacaoPaciente">
                    <label>Médico Regulador: {dadosPaciente.nome_regulador_medico}</label>
                </div>
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
                        <div className="StepContent">
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
                    )}



                </div>
                <div className="Form-NovaRegulacao-Buttons">
                    {currentStep > 1 && <button type="button" onClick={previousStep}>Voltar</button>}
                    {currentStep < 2 && <button type="button" onClick={nextStep}>Avançar</button>}
                    {currentStep === 2 && <button type="submit">Finalizar</button>}
                </div>
            </form>
        </>
    );
};

export default Transporte02;
