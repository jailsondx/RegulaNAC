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
import { DestinoData } from '../../interfaces/Transporte';

/*IMPORT CSS*/
import '../Modal/Modal-Inputs.css';

/*IMPORT VARIAVEIS DE AMBIENTE*/
const NODE_URL = import.meta.env.VITE_NODE_SERVER_URL;

interface Props {
    dadosPaciente: DadosPacienteData;
    onClose: () => void; // Adicionado
    showSnackbar: (message: string, severity: 'success' | 'error' | 'info' | 'warning') => void; // Nova prop
}

const initialFormData: DestinoData = {
    id_user: null,
    un_destino: '', // Use o valor de un_destino recebido nas Props
    nome_colaborador: '',
    data_hora_comunicacao: '',
};



const SetorDestino: React.FC<Props> = ({ dadosPaciente, onClose, showSnackbar }) => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [formData, setFormData] = useState<DestinoData>({
        ...initialFormData, // Espalha os valores iniciais
        un_destino: dadosPaciente.un_destino, // Sobrescreve apenas 'un_destino' com valor padrão
    });


    //Pega dados do SeassonStorage User
    useEffect(() => {
        const data = getUserData();
        setUserData(data);
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
        if (!formData.nome_colaborador.trim()) {
            // Mensagem SNACKBAR
            showSnackbar(
                'Colaborador é obrigatório!',
                'warning'
            );
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

            const response = await axios.post(`${NODE_URL}/api/internal/post/RegulacaoDestino`, dataToSubmit);
            if (response.status == 200) {
                // Mensagem com base na resposta da API
                showSnackbar(
                    response.data?.message || 'Regulação Aprovada - Destino: Sucesso!',
                    'success'
                );
                onClose(); // Fecha o modal
            } else {
                // Mensagem com base na resposta da API
                showSnackbar(
                    response.data?.message || 'Regulação Aprovada - Destino: Erro!',
                    'error'
                );
            }

        } catch (error: unknown) {
            if (error instanceof AxiosError && error.response) {
                const { data } = error.response;

                // Mensagem com base na resposta da API
                showSnackbar(
                    data?.message || 'Erro desconhecido. Por favor, tente novamente.',
                    'error'
                );
            } else {
                // Se o erro não for um AxiosError ou não tiver uma resposta
                showSnackbar(
                    'Erro na requisição. Por favor, verifique sua conexão ou tente novamente.',
                    'error'
                );
            }
        }
    };

    return (
        <>
            <div>
                <DadosPaciente dadosPaciente={dadosPaciente} />
            </div>

            <form onSubmit={handleSubmit}>
                <div className='modal-input'>
                    <div className="modal-input-line">
                        <label>Nome do Colaborador que recebeu a comunicação:</label>
                        <input
                            type="text"
                            name="nome_colaborador"
                            value={formData.nome_colaborador ?? ''}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="modal-input-line">
                        <label>Data e Hora do Acionamento:</label>
                        <input
                            type="datetime-local"
                            name="data_hora_comunicacao"
                            className='input-dateTime'
                            value={formData.data_hora_comunicacao}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>
                <button type="submit">Cadastrar Destino</button>
            </form>
        </>
    );
};

export default SetorDestino;
