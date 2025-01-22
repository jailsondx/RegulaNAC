import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import axios from 'axios';
import { getUserData } from '../../functions/storageUtils';

import './SetorOrigemDestino.css';

const NODE_URL = import.meta.env.VITE_NODE_SERVER_URL;

interface Props {
    nome_paciente: number;
    num_regulacao: number;
    un_origem: string;
    un_destino: string;
    id_regulacao: number;
    nome_regulador_medico: string;
    onClose: () => void;
    setSnackbar: (snackbarData: { open: boolean; message: string; severity: 'success' | 'error' | 'warning' }) => void; // Modificado para usar o novo formato
}

interface FormDataRegulacaoAprovada {
    id_user: string;
    un_origem: string;
    nome_colaborador: string;
    data_hora_comunicacao: string;
    preparo_leito: string;
}

const SetorDestino: React.FC<Props> = ({ id_regulacao, nome_paciente, num_regulacao, un_origem, un_destino, nome_regulador_medico, onClose, setSnackbar }) => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [formData, setFormData] = useState<FormDataRegulacaoAprovada>({
        id_user: '',
        un_origem: un_origem,
        nome_colaborador: '',
        data_hora_comunicacao: '',
        preparo_leito: '',
    });

    //INICIALIZAR OS DADOS DA SEASSONSTORAGE
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
            setSnackbar({ open: true, message: 'Colaborador é obrigatório', severity: 'warning' });
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
                id_regulacao,
                un_destino: un_destino,
            };

            const response = await axios.post(`${NODE_URL}/api/internal/post/RegulacaoDestino`, dataToSubmit);

            if (response.status === 200) {
                setSnackbar({
                    open: true,
                    message: response.data?.message || 'Regulação Aprovada - Destino: Sucesso!',
                    severity: 'success',
                });
                onClose();
            } else {
                setSnackbar({
                    open: true,
                    message: response.data?.message || 'Erro ao inserir Regulação Aprovada - Origem',
                    severity: 'error',
                });
            }
        } catch (error: any) {
            setSnackbar({
                open: true, 
                message: 'Erro ao enviar dados', 
                severity: 'error' 
            });
        }
    };

    return (
        <>
            <div className="DadosPaciente-Border">
                <label className="TitleDadosPaciente">Dados Paciente</label>
                <div className="Div-DadosPaciente RegulacaoMedica-Aprovada">
                    <label>Paciente: {nome_paciente}</label>
                    <label>Regulação: {num_regulacao}</label>
                    <label>Un. Origem: {un_origem}</label>
                    <label>Un. Destino: {un_destino}</label>
                </div>
                <div className="Div-DadosMedico RegulacaoMedica-Aprovada">
                    <label>Médico Regulador: {nome_regulador_medico}</label>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="div-SetorOrigemDestino">
                    <div className="subdiv-SetorOrigemDestino">
                        <div className="SetorOrigemDestino-line">
                            <label>Nome do Colaborador que recebeu a comunicação:</label>
                            <input
                                type="text"
                                name="nome_colaborador"
                                value={formData.nome_colaborador ?? ''}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="subdiv-SetorOrigemDestino">
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
                <button type="submit">Autorizar</button>
            </form>
        </>
    );
};

export default SetorDestino;
