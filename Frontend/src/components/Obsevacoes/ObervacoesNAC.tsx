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
import { ObservacaoData } from '../../interfaces/Obervacao';

/*IMPORT CSS*/
import '../Modal/Modal-Inputs.css';


/*IMPORT VARIAVEIS DE AMBIENTE*/
const NODE_URL = import.meta.env.VITE_NODE_SERVER_URL;

interface Props {
    dadosPaciente: DadosPacienteData;
    observacaoTexto: string;
    onClose: () => void; // Adicionado
    showSnackbar: (message: string, severity: 'success' | 'error' | 'info' | 'warning') => void; // Nova prop
}

const initialFormData: ObservacaoData = {
    id_user: null,
    id_regulacao: null,
    nome: '',
    observacaoTexto: ''
};



const ObservacoesNAC: React.FC<Props> = ({ dadosPaciente, onClose, observacaoTexto, showSnackbar }) => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [formData, setFormData] = useState<ObservacaoData>({
        ...initialFormData,
        observacaoTexto: observacaoTexto ?? ''  // Usa '' se observacaoTexto for undefined
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
        if (!formData.observacaoTexto.trim()) {
            showSnackbar('Texto é obrigatório!', 'warning');
            return false;
        }
        if (!dadosPaciente.id_regulacao) {
            showSnackbar('ID da regulação não encontrado!', 'warning');
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
                nome: userData?.nome
            };

            const response = await axios.post(`${NODE_URL}/api/internal/post/Observacao`, dataToSubmit);
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

    // Verificar o tipo de usuário
    const selectedUserViewer = sessionStorage.getItem('userViewer'); // Obter o userViewer
    const isVisibleButton = (userData?.tipo === 'GERENCIA' || userData?.tipo === 'AUX. ADMINISTRATIVO') && 
    (selectedUserViewer === 'GERENCIA' || selectedUserViewer === 'AUX. ADMINISTRATIVO');

    

    return (
        <>
            <div>
                <DadosPaciente dadosPaciente={dadosPaciente} />
            </div>

            <form onSubmit={handleSubmit}>
                <div className='modal-input'>
                    <div className="modal-input-line">
                        <label>Observação:</label>
                        <textarea
                            className="modal-input-textarea observacao"
                            name="observacaoTexto"
                            value={formData.observacaoTexto}
                            onChange={handleChange}
                            required
                            // Torna o campo editável ou não com base nas condições
                            readOnly={!(isVisibleButton)}  // Torna o campo somente leitura se a condição não for atendida
                        />
                    </div>
                </div>

                {/* Renderiza o botão apenas se a condição for atendida */}
                {isVisibleButton && (
                    <button type="submit">Cadastrar Observação</button>
                )}
            </form>
        </>
    );
};

export default ObservacoesNAC;
