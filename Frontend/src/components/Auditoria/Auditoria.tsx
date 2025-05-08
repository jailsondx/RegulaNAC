import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { Snackbar, Alert, Button, Box } from "@mui/material";

/* IMPORT INTERFACES */

/* IMPORT FUNCTIONS */
import { formatDateTimeToPtBr } from '../../functions/DateTimes';

/*IMPORT CSS*/
import './Auditoria.css';


/* VARIÁVEIS DE AMBIENTE */
const NODE_URL = import.meta.env.VITE_NODE_SERVER_URL;

interface ReportData {
    num_prontuario: number; // Agora só estamos aceitando o número do prontuário
}

interface AuditoriaRecord {
    id_auditoria: number;
    DT_insert: string;
    id_user: number;
    nome_responsavel_nac: string;
    tabela_afetada: string;
    acao: string;
    num_regulacao: number;
    num_prontuario: number;
}

interface Props {
    title: string;
}

const Auditoria: React.FC<Props> = ({ title }) => {
    const [formData, setFormData] = useState<ReportData>({ num_prontuario: 0 });
    const [auditoriaData, setAuditoriaData] = useState<AuditoriaRecord[]>([]);

    /* SNACKBAR */
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>("success");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await axios.post(`${NODE_URL}/api/internal/report/Auditoria`, formData);
            setAuditoriaData(response.data.data); // Recebe os dados de auditoria e os armazena no estado
            showSnackbar(response.data.message, 'success');
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                console.error('Erro ao buscar o prontuário:', error);
                showSnackbar(error.response?.data?.message || 'Erro ao buscar o prontuário.', 'error');
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
            <div className="Component start">
                <div className="Header-ListaRegulaçoes">
                    <label className="Title-Tabela">{title}</label>
                </div>



                {/* Formulário para digitar o número do prontuário */}
                <form onSubmit={handleSubmit}>
                    <label>Nº Prontuario</label>
                    <input  
                        type='text'
                        value={formData.num_prontuario}
                        onChange={(e) => setFormData({ ...formData, num_prontuario: Number(e.target.value) })}
                        required
                    />
                    <Box mt={2}>
                        <Button type="submit" variant="contained" color="primary">
                            Buscar Prontuario
                        </Button>
                    </Box>
                </form>

                {/* Exibe os dados de auditoria */}
                {auditoriaData.length > 0 && (
                    <div className="AuditoriaResults">
                        <table className='Table-Regulacoes'>
                            <thead>
                                <tr>
                                    <th>Data de Registro</th>
                                    <th>Usuário</th>
                                    <th>Ação</th>
                                    <th>Número da Regulacao</th>
                                    <th>Número do Prontuário</th>
                                </tr>
                            </thead>
                            <tbody>
                                {auditoriaData.map((record) => (
                                    <tr key={record.id_auditoria}>
                                        <td>{formatDateTimeToPtBr(record.DT_insert)}</td>
                                        <td>{record.nome_responsavel_nac}</td>

                                        <td>
                                            {record.acao === 'INSERT' &&(
                                                <label>NOVA REGULAÇÃO</label>
                                            )}
                                            {record.acao === 'DELETE' &&(
                                                <label>REGULAÇÃO APAGADA</label>
                                            )}
                                        </td>

                                        <td>{record.num_regulacao}</td>
                                        <td>{record.num_prontuario}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
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

export default Auditoria;
