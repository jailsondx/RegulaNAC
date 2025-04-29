import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AxiosError } from 'axios';
import { Snackbar, Alert } from "@mui/material";


/*IMPORT INTERFACES*/
import { UserData } from '../../../interfaces/UserData';
interface ReportData {
    startDate?: string;
    endDate?: string;
    outcome?: string;
    originUnit?: string;
    destinationUnit?: string;
    nacRegulator?: string;
    regulatingDoctor?: string;
  }

/*IMPORT COMPONENTS*/


/*IMPORT FUNCTIONS*/
import { getUserData } from '../../../functions/storageUtils';

/*IMPORT CSS*/
import '../Relatorios.css';

/*IMPORT VARIAVEIS DE AMBIENTE*/
const NODE_URL = import.meta.env.VITE_NODE_SERVER_URL;

const Relatorios: React.FC = () => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [formData, setFormData] = useState<ReportData>({});
    const [showError, setShowError] = useState(false);


    /*SNACKBAR*/
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>("success");


    //Pega dados do Seasson Storage
    useEffect(() => {
        const data = getUserData();
        setUserData(data);
    }, []);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setShowError(false);
      };
    
      const validateForm = (): boolean => {
        return Object.values(formData).some(value => value && value.trim() !== '');
      };
    
      /*
      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
          setShowError(true);
          return;
        }
    
        try {
            const dataToSubmit = {
                ...formData,
                id_user: userData?.id_user, // Use o operador de encadeamento opcional para evitar erros se `userData` for `null`
            };
          const response = await axios.post(`${NODE_URL}/api/internal/report`, dataToSubmit);
    
          console.log('Dados recebidos:', response.data);
          // Aqui você pode processar os dados do relatório
    
        } catch (error) {
          console.error('Erro na requisição:', error);
          // Adicione aqui o tratamento de erros
        }
      };
      */

      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
    
        if (!validateForm()) {
            setShowError(true);
            return;
        }
    
        try {
            const dataToSubmit = {
                ...formData,
                id_user: userData?.id_user,
            };
    
            // Configura o axios para receber a resposta como um blob (arquivo)
            const response = await axios.post(`${NODE_URL}/api/internal/report`, dataToSubmit)
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Relatorio.csv`); // Nome do arquivo que será baixado
            document.body.appendChild(link);
            link.click();

            // Verifica se o link ainda tem um nó pai antes de removê-lo
            if (link.parentNode) {
                link.parentNode.removeChild(link);
            }
    
            // Exibe uma mensagem de sucesso
            showSnackbar('Relatório gerado e download iniciado com sucesso!', 'success');
        } catch (error: unknown) {
              if (error instanceof AxiosError) {
                console.error('Erro ao gerar o relatório:', error);
                showSnackbar('Erro ao gerar o relatório.', 'error');
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
            <div className='Component'>
                Relatórios

                <div className="report-container">
      <form onSubmit={handleSubmit} className="report-form">
        {showError && <div className="error-message">Preencha pelo menos um campo para gerar o relatório</div>}

        <div className="form-group">
          <label>Data de Solicitação INICIO:</label>
          <input
            type="date"
            name="data_Solicitacao_Inicio"
            onChange={handleChange}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label>Data de Solicitação FIM:</label>
          <input
            type="date"
            name="data_Solicitacao_Fim"
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Data de Finalização:</label>
          <input
            type="date"
            name="data_Finalizacao"
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Desfecho:</label>
          <input
            type="text"
            name="desfecho"
            onChange={handleChange}
            className="form-input"
            placeholder="Selecione o desfecho"
          />
        </div>

        <div className="form-group">
          <label>Unidade de Origem:</label>
          <input
            type="text"
            name="un_origem"
            onChange={handleChange}
            className="form-input"
            placeholder="Digite a unidade de origem"
          />
        </div>

        <div className="form-group">
          <label>Unidade de Destino:</label>
          <input
            type="text"
            name="un_destino"
            onChange={handleChange}
            className="form-input"
            placeholder="Digite a unidade de destino"
          />
        </div>

        <div className="form-group">
          <label>Regulador NAC:</label>
          <input
            type="text"
            name="nome_responsavel_nac"
            onChange={handleChange}
            className="form-input"
            placeholder="Digite o regulador NAC"
          />
        </div>

        <div className="form-group">
          <label>Médico Regulador:</label>
          <input
            type="text"
            name="nome_regulador_medico"
            onChange={handleChange}
            className="form-input"
            placeholder="Digite o médico regulador"
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
  );

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


export default Relatorios;