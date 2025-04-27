import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import axios from 'axios';
import { AxiosError } from 'axios';
import { TiBookmark } from "react-icons/ti";

/*IMPORT COMPONENTS*/
import DadosPaciente from '../Dados Paciente/DadosPaciente';

/*IMPORT FUNCTIONS*/
import { getUserData } from '../../functions/storageUtils';
import { formatDateTimeToPtBr } from '../../functions/DateTimes';

/*IMPORT INTERFACES*/
import { UserData } from '../../interfaces/UserData';
import { DadosPacienteData } from '../../interfaces/DadosPaciente';
import { TransporteDatesData } from '../../interfaces/Transporte';
import { AtrasoLeitoOptions } from '../../interfaces/Transporte';

/*IMPORT JSON*/
import atrasoleito from '../../JSON/atraso.json';

/*IMPORT CSS*/
import '../Modal/Modal-Inputs.css';

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
    data_hora_chegada_destino: '',
    justificativa_atraso_leito: '',
    observacao: [] as string[], // <- Aqui agora é um array de strings
};

const Transporte02: React.FC<Props> = ({ dadosPaciente, onClose, showSnackbar }) => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [formData, setFormData] = useState<TransporteDatesData>(initialFormData);
    const [horaLeito, setHoraLeito] = useState<string>('');
    const [currentStep, setCurrentStep] = useState<number>(1);
    const [justificativa_atraso_leito, setJustificaticaAtrasoLeito] = useState<string>('');
    const [diferencaHoras, setDiferencaHoras] = useState<number>(0);
    const [optionsAtrasoLeito, setOptionsAtrasoLeito] = useState<AtrasoLeitoOptions[]>([]);

    //CHAMADA DE API PARA GERAR A LISTA DE REGULAÇÕES
    useEffect(() => {
        const fetchHoraLeito = async () => {
            try {
                const response = await axios.get(`${NODE_URL}/api/internal/get/RecebeHoraLeito`, {
                    params: { idRegulacao: dadosPaciente.id_regulacao }
                });

                if (response.status === 200) {
                    const dataHora = response.data.data?.data_hora_liberacao_leito;
                    setHoraLeito(dataHora);
                } else {
                    console.error('Dados inesperados:', response.data);
                }
            } catch (error: unknown) {
                // Verifica se o erro é uma instância de AxiosError
                if (error instanceof AxiosError) {
                    // Se o erro tiver uma resposta, você pode tratar a mensagem de erro (caso haja)
                    console.error('Erro ao carregar regulações:', error.response?.data?.message || error.message);
                } else {
                    // Caso o erro não seja um AxiosError, loga a mensagem do erro genérico
                    console.error('Erro desconhecido ao carregar regulações:', error);
                }
            }

        };

        fetchHoraLeito();
    }, []);

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
    const calculateTimeDifference = () => {
        if (horaLeito && formData.data_hora_chegada_destino) {
            const liberacaoLeito = new Date(horaLeito).getTime();
            const chegadaDestino = new Date(formData.data_hora_chegada_destino).getTime();
            const diferencaMs = chegadaDestino - liberacaoLeito;
            const diferencaHoras = diferencaMs / (1000 * 60 * 60); // Converter milissegundos para horas
            setDiferencaHoras(diferencaHoras);
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const { value, checked } = e.target;

        setFormData((prevState) => {
            const newObservacao = checked
                ? [...(prevState.observacao || []), value] // se marcou, adiciona
                : (prevState.observacao || []).filter((item) => item !== value); // se desmarcou, tira

            return {
                ...prevState,
                observacao: newObservacao,
            };
        });
    };


    const validateForm = (): boolean => {
        if (!formData.data_hora_chegada_origem.trim() || !formData.data_hora_saida_origem.trim() || !formData.data_hora_chegada_destino.trim()) {
            showSnackbar('Todas as datas e horários são obrigatórios!', 'warning');
            return false;
        }

        if (diferencaHoras >= 2 && !justificativa_atraso_leito.trim()) {
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
                justificativa_atraso_leito: justificativa_atraso_leito ?? null, // Inclui a observação apenas se necessário
                id_user: userData?.id_user,
                id_regulacao: dadosPaciente.id_regulacao,
                observacao: Array.isArray(formData.observacao) ? formData.observacao.join(', ') : formData.observacao,
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
        calculateTimeDifference(); // Atualiza a diferença de horas ao avançar para o próximo passo
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
                <div className="modal-input">
                    {currentStep === 1 && (
                        <div className="StepContent">
                            <div className="modal-input-line">
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

                            <div className="modal-input-line">
                                <label>Saída do Técnico do Setor de Origem:</label>
                                <input
                                    type="datetime-local"
                                    name="data_hora_saida_origem"
                                    value={formData.data_hora_saida_origem}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="StepContent">
                            <div className="modal-input-line">
                                <label>Chegada do Paciente no Setor de Destino:</label>
                                <input
                                    type="datetime-local"
                                    name="data_hora_chegada_destino"
                                    value={formData.data_hora_chegada_destino}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="StepContent">
                            <div className="modal-input-line">
                                <label>Hora de Liberação do Leito: {formatDateTimeToPtBr(horaLeito)}</label>
                                <label><p>Motivo do Atraso: Obrigatório caso o tempo de ocupação do leito for maior que 2h</p></label>
                                <select
                                    name="justificativa_atraso_leito"
                                    value={justificativa_atraso_leito}
                                    onChange={(e) => setJustificaticaAtrasoLeito(e.target.value)}
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

                            {/* Mostra textarea se o motivo for "outro" */}
                            {justificativa_atraso_leito === 'ATRASO NA PREPARAÇÃO DO LEITO' && (
                                <div className="modal-input-line">
                                    <label>Descreva o motivo do atraso:</label>
                                    <textarea
                                        className="modal-input-textarea"
                                        name="observacao"
                                        value={formData.observacao}
                                        onChange={handleChange}
                                        placeholder="Descreva o motivo..."
                                        required
                                    />
                                </div>
                            )}

                            {justificativa_atraso_leito === 'ATRASO NO PREPARO DO PACIENTE' && (
                                <div className="modal-input-line">
                                    <label>Selecione o motivo do atraso:</label>
                                    <select
                                        className="modal-input-select"
                                        name="observacao"
                                        value={formData.observacao}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">SELECIONE O MOTIVO</option>
                                        <option value="AIH">AIH</option>
                                        <option value="BANHO">BANHO</option>
                                        <option value="CURATIVO">CURATIVO</option>
                                        <option value="EVOLUÇÃO MÉDICA">EVOLUÇÃO MÉDICA</option>
                                        <option value="MEDICAÇÃO">MEDICAÇÃO</option>
                                        <option value="PROCEDIMENTOS">PROCEDIMENTOS</option>
                                    </select>
                                </div>
                            )}

                            {justificativa_atraso_leito === 'REALIZANDO PROCEDIMENTO' && (
                                <div className="modal-input-line">
                                    <label>Selecione o motivo do atraso:</label>
                                    <div className="modal-input-checkbox-group">
                                        <label>
                                            <input
                                                type="checkbox"
                                                name="observacao"
                                                value="EXAME"
                                                checked={formData.observacao?.includes('EXAME')}
                                                onChange={handleCheckboxChange}

                                            />
                                            EXAME
                                        </label>
                                        <label>
                                            <input
                                                type="checkbox"
                                                name="observacao"
                                                value="DIÁLISE"
                                                checked={formData.observacao?.includes('DIÁLISE')}
                                                onChange={handleCheckboxChange}
                                            />
                                            DIÁLISE
                                        </label>
                                        <label>
                                            <input
                                                type="checkbox"
                                                name="observacao"
                                                value="TRANSFUSÃO"
                                                checked={formData.observacao?.includes('TRANSFUSÃO')}
                                                onChange={handleCheckboxChange}
                                            />
                                            TRANSFUSÃO
                                        </label>
                                        <label>
                                            <input
                                                type="checkbox"
                                                name="observacao"
                                                value="PROCEDIMENTO CIRÚRGICO"
                                                checked={formData.observacao?.includes('PROCEDIMENTO CIRÚRGICO')}
                                                onChange={handleCheckboxChange}
                                            />
                                            PROCEDIMENTO CIRÚRGICO
                                        </label>
                                    </div>
                                </div>
                            )}

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