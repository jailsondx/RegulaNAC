import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import axios from 'axios';
import { AxiosError } from 'axios';

/*IMPORT FUNCTIONS*/
import { getUserData } from '../../functions/storageUtils';

/*IMPORT INTERFACES*/
import { UserData } from '../../interfaces/UserData';
import { DadosPacienteData } from '../../interfaces/DadosPaciente';
import { DesfechoData } from '../../interfaces/Desfecho';
import { DesfechoOptions } from '../../interfaces/Desfecho';
import { CriticidadeOptions } from '../../interfaces/Desfecho';

/*IMPORT CSS*/

/*IMPORT JSON*/
import desfecho from '../../JSON/desfecho.json';
import criticidade from '../../JSON/criticidade.json';

/*IMPORT VARIAVEIS DE AMBIENTE*/
const NODE_URL = import.meta.env.VITE_NODE_SERVER_URL;

interface PropsDadosPaciente {
    dadosPaciente: DadosPacienteData;
    onClose: () => void;
    showSnackbar: (message: string, severity: 'success' | 'error' | 'info' | 'warning') => void;
}

const initialFormData: DesfechoData = {
    id_user: '',
    id_regulacao: null,
    desfecho: '',
    criticidade: '',
    fastmedic: ''
};

const Desfecho: React.FC<PropsDadosPaciente> = ({ dadosPaciente, onClose, showSnackbar }) => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [formData, setFormData] = useState<DesfechoData>(initialFormData);
    const [optionsDesfecho, setDesfecho] = useState<DesfechoOptions[]>([]);
    const [optionsCriticidade, setCriticidade] = useState<CriticidadeOptions[]>([]);

    //INICIALIZA OS DADOS DO USUARIO
    useEffect(() => {
        const data = getUserData();
        setUserData(data);
    }, []);

    //PREENCHE O SELECT COM OS DADOS DO JSON
    useEffect(() => {
        setDesfecho(desfecho as DesfechoOptions[]);
        setCriticidade(criticidade as CriticidadeOptions[]);
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
        if (!formData.desfecho.trim()) {
            showSnackbar('Desfecho é obrigatório!', 'warning');
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
            };

            const response = await axios.post(`${NODE_URL}/api/internal/post/RegulacaoDesfecho`, dataToSubmit);
            if (response.status === 200) {
                showSnackbar(response.data?.message || 'Desfecho registrado com sucesso!', 'success');
                onClose();
            } else {
                showSnackbar(response.data?.message || 'Erro ao registrar desfecho', 'error');
            }
        } catch (error: unknown) {
            if (error instanceof AxiosError && error.response) {
                showSnackbar(error.response.data?.message || 'Erro desconhecido', 'error');
            } else {
                showSnackbar('Erro na requisição. Verifique sua conexão.', 'error');
            }
        }
    };

    return (
        <>
            <div className='DadosPaciente-Border'>
                <label className='TitleDadosPaciente'>Dados Paciente</label>
                <div className='Div-DadosPaciente RegulacaoPaciente'>
                    <label>Paciente: {dadosPaciente.nome_paciente}</label>
                    <label>Regulação: {dadosPaciente.num_regulacao}</label>
                    <label>Un. Destino: {dadosPaciente.un_origem}</label>
                    <span>
                        <label>Un. Destino: {dadosPaciente.un_destino}</label>
                        <label>Leito: {dadosPaciente.num_leito}</label>
                    </span>
                </div>
                <div className='Div-DadosMedico RegulacaoPaciente'>
                    <label>Médico Regulador: {dadosPaciente.nome_regulador_medico}</label>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className='div-Desfecho'>
                    <div className='subdiv-Desfecho'>
                        <div className="Desfecho-line">
                            <label>Desfecho:</label>
                            <select
                                name="desfecho"
                                value={formData.desfecho}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Selecione o Desfecho</option>
                                {optionsDesfecho.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="Desfecho-line">
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
                <button type="submit">Cadastrar Desfecho</button>
            </form>
        </>
    );
};

export default Desfecho;