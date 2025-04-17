import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import axios from 'axios';
import { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { Snackbar, Alert } from '@mui/material';

/*IMPORT COMPONENTES*/
import { Passo1 } from './Passo1';
import { Passo2 } from './Passo2';
import { Passo3 } from './Passo3';

/*IMPORT INTERFACES*/
import { UserData } from '../../../../../interfaces/UserData';
import { Vinculada } from '../../../../../interfaces/RegulacaoExtena';

/*IMPORT FUNCTIONS*/
import { calcularIdade } from '../../../../../functions/CalcularIdade';
import { ProgressBar } from './ProgressBar';
import { getUserData } from '../../../../../functions/storageUtils';


/*IMPORT VARIAVEIS DE AMBIENTE*/
const NODE_URL = import.meta.env.VITE_NODE_SERVER_URL;

const initialFormData: Vinculada = {
    id_user: null,
    nome_paciente: '',
    data_nascimento: '',
    num_idade: null,
    num_regulacao: null,
    num_prontuario: null,
    data_hora_chegada: '',
    status: ''
};

const RegulacaoExObsVinculada: React.FC = () => {
    const [userData, setUserData] = useState<UserData | null>(null);
    //const userUsername = userData?.login || ''; // Nome do usuário
    //const userTipo = userData?.tipo || ''; // Tipo de usuário
    const [formData, setFormData] = useState<Vinculada>(initialFormData);
    const navigate = useNavigate();
    const [iconStatusProntOk, setIconStatusProntOk] = useState<boolean>(false);
    const [iconStatusProntDeny, setIconStatusProntDeny] = useState<boolean>(false);
    const [iconStatusRegOk, setIconStatusRegOk] = useState<boolean>(false);
    const [iconStatusRegDeny, setIconStatusRegDeny] = useState<boolean>(false);
    const [currentStep, setCurrentStep] = useState<number>(1);
    const [showAtualizarButton, setShowAtualizarButton] = useState<boolean>(false);

    /*SNACKBAR*/
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>("success");

    //Pega dados do SeassonStorage User
    useEffect(() => {
        const data = getUserData();
        setUserData(data);
    }, []);

    const validateForm = (): boolean => {
        let invalidField: string | null = null;

        // Identificar o campo inválido
        switch (true) {
            case !formData.nome_paciente.trim():
                invalidField = 'O nome do paciente é obrigatório.';
                break;
            case !formData.num_prontuario:
                invalidField = 'Prontuário é obrigatório.';
                break;
            case formData.num_idade === null:
                invalidField = 'Idade é obrigatória.';
                break;
            case !formData.num_regulacao:
                invalidField = 'O número da regulação é obrigatório.';
                break;
            default:
                break;
        }

        // Exibir erro ou retornar sucesso
        if (invalidField) {
            showSnackbar(invalidField || 'Revise os Campos', 'warning');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: FormEvent): Promise<void> => {
        e.preventDefault();

        // Valida o formulário primeiro
        if (!validateForm()) return;

        try {
            const dataToSubmit = {
                ...formData,
                id_user: userData?.id_user, // Use o operador de encadeamento opcional para evitar erros se `userData` for `null`
                nome_regulador_nac: userData?.nome,
            };

            // Envia o formulário primeiro
            const response = await axios.post(`${NODE_URL}/api/internal/post/NovaRegulacao/Externa/ObstetricaVinculada`, dataToSubmit);


            // Se tudo ocorrer bem, exibe a resposta
            showSnackbar(response.data.message || 'Regulaçao Inserida:', 'success');
            // Se tudo ocorrer bem, exibe a resposta
            //enviarMensagem('Nova Regulaçao Solicitadas: ' + formData.num_regulacao);

            // Limpeza de dados após o sucesso
            setFormData(initialFormData);
            setIconStatusProntOk(false);
            setIconStatusProntDeny(false);
            setCurrentStep(1); // Reinicia o passo no processo, caso haja

        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                console.error(error.response?.data?.message || 'Erro ao cadastrar regulação. Por favor, tente novamente.', error);
                showSnackbar(error.response?.data?.message || 'Erro ao cadastrar regulação. Por favor, tente novamente.', 'error');
            } else if (error instanceof Error) {
                // Se o erro for do tipo genérico `Error`, trate-o também
                console.error('Erro desconhecido:', error.message);
                showSnackbar('Erro desconhecido:', 'error');
            } else {
                // Caso o erro seja de um tipo inesperado
                console.error('Erro inesperado:', error);
                showSnackbar('Erro inesperado:', 'error');
            }
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
        const { name, value, type } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: type === 'number' ? (value ? Number(value) : null) : value,
            num_idade: name === "data_nascimento" ? calcularIdade(value) : prevState.num_idade
        }));

        if (name === 'num_prontuario' && value) {
            handleVerificaProntuario(Number(value));
        }

        if (name === 'num_regulacao' && value) {
            handleVerificaRegulacao(Number(value));
        }
    };

    const handleVerificaProntuario = async (numProntuario: number): Promise<void> => {
        if (!numProntuario) {
            //setSnackbar({ open: true, message: 'Prontuário é obrigatório', severity: 'info' });
            setShowAtualizarButton(false);
            return;
        }

        try {
            const response = await axios.get(`${NODE_URL}/api/internal/get/VerificaProntuario`, {
                params: { num_prontuario: numProntuario },
            });

            const { message } = response.data;

            if (message === 'Regulação pendente em aberto') {
                setIconStatusProntOk(false);
                setIconStatusProntDeny(true);
                setShowAtualizarButton(message === 'Regulação pendente em aberto');
            } else {
                setIconStatusProntOk(true);
                setIconStatusProntDeny(false);
                setShowAtualizarButton(false);
            }

        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                console.error(error.response?.data?.message || 'Erro ao verificar prontuário.', error);
                showSnackbar(error.response?.data?.message || 'Erro ao verificar prontuário.', 'error');
                setShowAtualizarButton(false);
            } else if (error instanceof Error) {
                // Se o erro for do tipo genérico `Error`, trate-o também
                console.error('Erro desconhecido:', error.message);
                showSnackbar('Erro desconhecido:', 'error');
                setShowAtualizarButton(false);
            } else {
                // Caso o erro seja de um tipo inesperado
                console.error('Erro inesperado:', error);
                showSnackbar('Erro inesperado:', 'error');
                setShowAtualizarButton(false);
            }
        }
    };

    const handleVerificaProntuarioAutoComplete = async (numProntuario: number): Promise<void> => {
        if (!numProntuario) {
            //setSnackbar({ open: true, message: 'Prontuário é obrigatório', severity: 'info' });
            setShowAtualizarButton(false);
            return;
        }

        try {
            const response = await axios.get(`${NODE_URL}/api/internal/get/VerificaProntuarioAutoComplete`, {
                params: { num_prontuario: numProntuario },
            });

            const status = response.status;
            const nomePaciente = response.data.data.nome_paciente;
            const dataNascimento = response.data.data.data_nascimento;
            const idade = response.data.data.num_idade;

            if (status === 200) {
                // Atualizando o estado corretamente
                setFormData((prevData) => ({
                    ...prevData, // Mantém os outros campos inalterados
                    nome_paciente: nomePaciente, // Atualiza o nome do paciente
                    data_nascimento: dataNascimento.split("T")[0], // Atualiza a data de nascimento
                    num_idade: idade, // Atualiza a idade
                }));
            }

        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                console.error(error.response?.data?.message || 'Erro ao verificar prontuário.', error);
                showSnackbar(error.response?.data?.message || 'Erro ao verificar prontuário.', 'error');
                setShowAtualizarButton(false);
            } else if (error instanceof Error) {
                // Se o erro for do tipo genérico `Error`, trate-o também
                console.error('Erro desconhecido:', error.message);
                showSnackbar('Erro desconhecido:', 'error');
                setShowAtualizarButton(false);
            } else {
                // Caso o erro seja de um tipo inesperado
                console.error('Erro inesperado:', error);
                showSnackbar('Erro inesperado:', 'error');
                setShowAtualizarButton(false);
            }
        }
    };

    const handleVerificaRegulacao = async (numRegulacao: number): Promise<void> => {
        if (!numRegulacao) {
            //setSnackbar({ open: true, message: 'Nº de Regulação é obrigatório', severity: 'info' });
            setShowAtualizarButton(false);
            setIconStatusRegOk(false);
            setIconStatusRegDeny(false);
            return;
        }

        try {
            const response = await axios.get(`${NODE_URL}/api/internal/get/VerificaRegulacao`, {
                params: { num_regulacao: numRegulacao },
            });

            const { message } = response.data;

            if (message === 'Regulação pendente em aberto') {
                setIconStatusRegOk(false);
                setIconStatusRegDeny(true);
            } else {
                setIconStatusRegOk(true);
                setIconStatusRegDeny(false);
                setShowAtualizarButton(false);
            }

        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                console.error(error.response?.data?.message || 'Erro ao verificar regulação.', error);
                showSnackbar(error.response?.data?.message || 'Erro ao verificar regulação.', 'error');
                setShowAtualizarButton(false);
            } else if (error instanceof Error) {
                // Se o erro for do tipo genérico `Error`, trate-o também
                console.error('Erro desconhecido:', error.message);
                showSnackbar('Erro desconhecido:', 'error');
                setShowAtualizarButton(false);
            } else {
                // Caso o erro seja de um tipo inesperado
                console.error('Erro inesperado:', error);
                showSnackbar('Erro inesperado:', 'error');
                setShowAtualizarButton(false);
            }
        }
    };

    const handleAtualizarRegulacao = (): void => {
        if (!formData.num_prontuario) {
            showSnackbar('Prontuário é obrigatório para atualizar a regulação', 'warning');
            return;
        }
        // Enviando dados de forma oculta
        navigate('/AtualizaRegulacao', {
            state: { num_prontuario: formData.num_prontuario },
        });
    };


    /*PASSOS*/
    const nextStep = (): void => {
        if (showAtualizarButton) {
            showSnackbar('Não é possivel abrir uma nova regulação para paciente com regulação pendente em aberto, revise o Nº PRONTUARIO', 'warning');
            return;
        }

        if (iconStatusRegDeny) {
            showSnackbar('Não é possivel abrir uma nova regulação para paciente com regulação pendente em aberto, revise o Nº REGULAÇÃO', 'warning');
            return;
        }

        setCurrentStep((prev) => Math.min(prev + 1, 4));
    };

    const previousStep = (): void => {
        if (iconStatusRegDeny) {
            showSnackbar('Não é possivel abrir uma nova regulação para paciente com regulação pendente em aberto, revise o Nº REGULAÇÃO', 'warning');
            return;
        }
        setCurrentStep((prev) => Math.max(prev - 1, 1));
    }

    /*SNACKBARS*/
    const handleSnackbarClose = (): void => {
        setSnackbarOpen(false);
    };

    const showSnackbar = (
        message: string,
        severity: 'success' | 'error' | 'info' | 'warning'
    ): void => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    return (
        <>
            <div>
                <ProgressBar currentStep={currentStep} />
            </div>
            <form className="Form-NovaRegulacao" onSubmit={handleSubmit}>
                <div className="Form-NovaRegulacao-Inputs">
                    {currentStep === 1 && (
                        <Passo1
                            formData={formData}
                            handleChange={handleChange}
                            handleVerificaProntuarioAutoComplete={handleVerificaProntuarioAutoComplete}
                            handleAtualizarRegulacao={handleAtualizarRegulacao}
                            iconStatusProntOk={iconStatusProntOk}
                            iconStatusProntDeny={iconStatusProntDeny}
                            showAtualizarButton={showAtualizarButton}
                        />
                    )}

                    {currentStep === 2 && (
                        <Passo2
                            formData={formData}
                            handleChange={handleChange}
                            iconStatusRegOk={iconStatusRegOk}
                            iconStatusRegDeny={iconStatusRegDeny}
                        />
                    )}

                    {currentStep === 3 && (
                        <Passo3
                            formData={formData}
                        />
                    )}
                </div>

                {/* Botões ficam fora dos subcomponentes */}
                <div className="Div-Buttons End">
                    {currentStep > 1 && <button type="button" onClick={previousStep}>Voltar</button>}
                    {currentStep < 3 && <button type="button" onClick={nextStep}>Avançar</button>}
                    {currentStep === 3 && <button type="submit">Finalizar</button>}
                </div>
            </form>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity={snackbarSeverity}
                    sx={{ width: "100%" }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>

        </>
    );
};


export default RegulacaoExObsVinculada;