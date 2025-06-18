import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import axios, { AxiosError } from 'axios';

/*IMPORT COMPONENTS*/
import DadosPaciente from '../Dados Paciente/DadosPaciente';

/*IMPORT FUNCTIONS*/
import { getUserData } from '../../functions/storageUtils';

/*IMPORT INTERFACES*/
import { UserData } from '../../interfaces/UserData';
import { DadosPacienteData } from '../../interfaces/DadosPaciente';
import { DesfechoData, DesfechoOptions } from '../../interfaces/Desfecho';
import { RegulacaoData } from '../../interfaces/Regulacao';


/*IMPORT VARIAVEIS DE AMBIENTE*/
const NODE_URL = import.meta.env.VITE_NODE_SERVER_URL;

interface Props {
    dadosPaciente: DadosPacienteData;
    forcado: boolean;
    onClose: () => void;
    desfechoExistente?: RegulacaoData | null; // <- NOVA PROP
    showSnackbar: (message: string, severity: 'success' | 'error' | 'info' | 'warning') => void;
}

const initialFormData: DesfechoData = {
    id_user: null,
    id_regulacao: null,
    desfecho: '',
    forcado: false,
    fastmedic: null
};

const Fastmedic: React.FC<Props> = ({ dadosPaciente, forcado, onClose, showSnackbar, desfechoExistente }) => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [formData, setFormData] = useState<DesfechoData>({ ...initialFormData, forcado });
    const [desfechoCanceladoSelecionado, setDesfechoCanceladoSelecionado] = useState<string>('');
    const [optionsDesfechoCancelado, setOptionsDesfechoCancelado] = useState<DesfechoOptions[]>([]);

    useEffect(() => {
        setUserData(getUserData());

        //setOptionsDesfechoCancelado(desfechoCancelado);
        axios.get('/JSON/desfechoCancelado.json')
            .then((res) => {
                setOptionsDesfechoCancelado(res.data);  // Atualiza o estado com os dados do JSON
            })
            .catch(() => {
                showSnackbar('Erro ao carregar os dados dos Cancelamentos', 'error');  // Se ocorrer erro, atualiza o estado
            });

        if (desfechoExistente) {
            setFormData(prev => ({
                ...prev,
                desfecho: desfechoExistente.desfecho || '',
                fastmedic: desfechoExistente.fastmedic ?? '',
            }));
        }
    }, [desfechoExistente, dadosPaciente]);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'desfecho' && value !== 'CANCELADO') {
            setDesfechoCanceladoSelecionado('');
        }
    };

    const validateForm = (): boolean => {
        if (!formData.fastmedic || !formData.fastmedic.trim()) {
            showSnackbar('Alocação de Leito é obrigatória!', 'warning');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: FormEvent): Promise<void> => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const dataToSubmit = {
                id_user: userData?.id_user,
                id_regulacao: dadosPaciente.id_regulacao,
                fastmedic: formData.fastmedic
            };

            const response = await axios.put(`${NODE_URL}/api/internal/put/Fastmedic`, dataToSubmit);
            if (response.status === 200) {
                showSnackbar(response.data?.message || 'Fastmedic registrado com sucesso!', 'success');
                onClose();
            } else {
                showSnackbar(response.data?.message || 'Erro ao registrar Fastmedic', 'error');
            }
        } catch (error) {
            if (error instanceof AxiosError && error.response) {
                showSnackbar(error.response.data?.message || 'Erro desconhecido', 'error');
            } else {
                showSnackbar('Erro na requisição. Verifique sua conexão.', 'error');
            }
        }
    };

    return (
        <>
            <DadosPaciente dadosPaciente={dadosPaciente} />

            <form onSubmit={handleSubmit}>
                <div className="div-Desfecho">
                    <div className='Desfecho-line-2'>
                        <div className="Desfecho-line">
                            <label>Desfecho:</label>
                            <input
                                type='text'
                                name="desfecho"
                                value={formData.desfecho}
                                disabled
                            >
                            </input>
                        </div>

                        {formData.desfecho === 'CANCELADO' && (
                            <div className="Desfecho-line">
                                <label>Motivo do Cancelamento:</label>
                                <select
                                    name="desfechoCancelado"
                                    value={desfechoCanceladoSelecionado}
                                    onChange={(e) => setDesfechoCanceladoSelecionado(e.target.value)}
                                    disabled
                                >
                                    <option value="">Selecione o motivo</option>
                                    {optionsDesfechoCancelado.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="Desfecho-line w50">
                        <label>Leito Alocado:</label>
                        <select
                            name="fastmedic"
                            value={formData.fastmedic ?? ''}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Selecione a Alocação de Leito - Fastmedic</option>
                            <option value="SIM">SIM</option>
                            <option value="NAO">NÃO</option>
                        </select>
                    </div>
                </div>

                <p>*O desfecho irá encerrar essa regulação, essa ação não pode ser desfeita.</p>
                <button type="submit">Cadastrar Alocação de Leito no Fastmedic</button>
            </form>
        </>
    );
};

export default Fastmedic;
