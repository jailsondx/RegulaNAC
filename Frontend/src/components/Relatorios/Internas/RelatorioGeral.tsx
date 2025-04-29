import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { Snackbar, Alert } from "@mui/material";

/* IMPORT INTERFACES */

/* IMPORT FUNCTIONS */

/*IMPORT CSS*/
import '../Relatorios.css';

/* VARIÁVEIS DE AMBIENTE */
const NODE_URL = import.meta.env.VITE_NODE_SERVER_URL;

interface ReportData {
    startDate: string;
    endDate: string;
}

interface Props {
    title: string;
}

const RelatorioGeral: React.FC<Props> = ({ title }) => {
    const [formData, setFormData] = useState<ReportData>({ startDate: '', endDate: '' });
    const [showError, setShowError] = useState(false);

    /* SNACKBAR */
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>("success");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setShowError(false);
    };

    const validateForm = (): boolean => {
        return formData.startDate.trim() !== '' && formData.endDate.trim() !== '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            setShowError(true);
            return;
        }

        try {
            const response = await axios.post(`${NODE_URL}/api/internal/report/Geral`, formData, {
                responseType: 'blob', // para receber arquivo
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'Relatorio_Geral.csv');
            document.body.appendChild(link);
            link.click();
            if (link.parentNode) {
                link.parentNode.removeChild(link);
            }

            showSnackbar('Relatório gerado e download iniciado com sucesso!', 'success');
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                console.error('Erro ao gerar o relatório:', error);
                showSnackbar('Erro ao gerar o relatório.', 'error');
            } else if (error instanceof Error) {
                console.error('Erro desconhecido:', error.message);
                showSnackbar('Erro desconhecido.', 'error');
            } else {
                console.error('Erro inesperado:', error);
                showSnackbar('Erro inesperado.', 'error');
            }
        }
    };

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
            <div className="Component">
                <h2>{title}</h2>
                <div className="report-container">
                    <form onSubmit={handleSubmit} className="report-form">
                        {showError && (
                            <div className="error-message">
                                Preencha a data de início e de fim para gerar o relatório.
                            </div>
                        )}

                        <div className="form-group">
                            <label>Data de Início:</label>
                            <input
                                type="date"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleChange}
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label>Data de Fim:</label>
                            <input
                                type="date"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleChange}
                                className="form-input"
                            />
                        </div>

                        <button
                            type="submit"
                            className="submit-button"
                            disabled={!validateForm()}
                        >
                            Gerar Relatório
                        </button>
                        
                    </form>
                    
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
                    sx={{ width: "100%" }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </>
    );
};

export default RelatorioGeral;
