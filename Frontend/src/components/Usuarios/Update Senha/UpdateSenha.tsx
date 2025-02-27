import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Snackbar, Alert } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

/*IMPORT INTERFACE*/
import { UpdateSenhaData } from '../../../interfaces/Cadastro';

/*IMPORT CSS*/
import '../Usuarios.css';

const NODE_URL = import.meta.env.VITE_NODE_SERVER_URL;

const UpdateSenha: React.FC = () => {
    const location = useLocation();
    const login = location.state?.login ?? 'Not Found';
    const navigate = useNavigate();

    const [formData, setFormData] = useState<UpdateSenhaData>({
        login: location.state?.login ?? '',
        senha: '',
    });
    

    /*SNACKBAR*/
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>("success");

    useEffect(() => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            login: login
        }));
    }, [login]);

    // Atualiza os campos do formulário
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await axios.put(`${NODE_URL}/api/internal/put/UpdateSenha`, formData);

            if (response.status === 200) {
                showSnackbar(response.data.message || 'Senha atualizada com Sucesso', 'success');
                navigate('/Login', { state: { snackbarMessage: response.data.message || 'Senha atualizada com Sucesso', snackbarSeverity: 'success' } });
            } else {
                showSnackbar('Erro ao atualizar', 'error');
            }
        } catch (err) {
            if (axios.isAxiosError(err) && err.response) {
                showSnackbar(err.response.data.message || 'Erro ao atualizar senha', 'error');
            } else {
                showSnackbar('Erro inesperado. Tente novamente mais tarde.', 'error');
            }
        }
    };

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
            <div className='Screen-Login'>
                <div className='Component-Login'>

                    <div className='div-direita'>
                        <div className="login-container">
                            <h1>Nova Senha</h1>
                            <form onSubmit={handleSubmit}>
                                <div>
                                    <input
                                        type="text"
                                        name="login"
                                        value={formData.login}
                                        onChange={handleChange}
                                        placeholder="Login"
                                        required
                                        autoComplete="off"
                                        disabled
                                    />
                                </div>

                                <div>
                                    <input
                                        type="password"
                                        name="senha"
                                        value={formData.senha}
                                        onChange={handleChange}
                                        placeholder="Senha"
                                        required
                                    />
                                </div>

                                <div className='Div-Buttons Central'>
                                    <button type="submit">Atualizar</button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className='div-esquerda BG'>
                        <div className='Circulo'>
                            <img className='Logo' src='/Logo/RegulaNAC.png' alt="Logo" />
                        </div>
                    </div>

                </div>
            </div>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity={snackbarSeverity}
                    variant="filled"
                    sx={{ width: "100%" }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </>
    );
};

export default UpdateSenha;
