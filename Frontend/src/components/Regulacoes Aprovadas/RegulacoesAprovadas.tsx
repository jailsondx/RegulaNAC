import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from '../Modal/Modal.tsx';
import { Snackbar, Alert } from "@mui/material";
import { FcHome, FcGlobe, FcInTransit } from "react-icons/fc";
import { formatDateToPtBr } from '../../functions/DateTimes';
import { getUserData } from '../../functions/storageUtils';
import SetorOrigem from '../Setor Origem e Destino/SetorOrigem.tsx';

import './Regulacoes.css'

const NODE_URL = import.meta.env.VITE_NODE_SERVER_URL;

interface Regulacao {
  id_regulacao: number;
  num_prontuario: number | null;
  nome_paciente: string;
  un_origem: string;
  un_destino: string;
  num_regulacao: number | null;
  nome_regulador_medico: string;
  data_hora_regulacao_medico: string;
}

const RegulacoesAprovadas: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [regulacoes, setRegulacoes] = useState<Regulacao[]>([]); // Tipo do estado
  const [showModalOrigem, setShowModalOrigem] = useState(false);
  const [currentRegulacao, setCurrentRegulacao] = useState<Regulacao | null>(null);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>("success");

  //FAZ A REQUISIÇÃO DA API PARA PREENCHER A TABELA
  useEffect(() => {
    const fetchRegulacoes = async () => {
      try {
        const response = await axios.get(`${NODE_URL}/api/internal/get/ListaRegulacoesAprovadas`);

        if (response.data && Array.isArray(response.data.data)) {
          setRegulacoes(response.data.data);
        } else {
          console.error('Dados inesperados:', response.data);
        }
      } catch (error: any) {
        console.error('Erro ao carregar regulações:', error);
        setRegulacoes([]); // Garante que regulacoes seja sempre um array
      }
    };

    fetchRegulacoes();
  }, []);

  //Pega dados do SeassonStorage User
  useEffect(() => {
    const data = getUserData();
    setUserData(data);
  }, []);

  /*MODAIS*/

  const handleOpenModalOrigem = (regulacao: Regulacao) => {
    setCurrentRegulacao(regulacao);
    setShowModalOrigem(true);
  };

  const handleCloseModal = () => {
    setShowModalOrigem(false);
    //window.location.reload(); // Recarregar a página ao fechar o modal
  };


  /*SNACKBARS*/
  const handleSnackbarClose = (): void => {
    setSnackbarOpen(false);
  };

  const showSnackbar = (
    message: string,
    severity: "success" | "error"
  ): void => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };


  return (
    <>
      <div className='Header-ListaRegulaçoes'>
        <label className='Title-Tabela'>Regulações Aprovadas</label>
      </div>

      <div>
        <table className='Table-Regulacoes'>
          <thead>
            <tr>
              <th>Pront.</th>
              <th>Nome Paciente</th>
              <th>Num. Regulação</th>
              <th>Un. Origem</th>
              <th>Un. Destino</th>
              <th>Médico Regulador</th>
              <th>Data/Hora da Autorização</th>

              {userData?.tipo !== "Medico" && (
                <th>Ações</th>
              )}

            </tr>
          </thead>
          <tbody>
            {regulacoes.map(regulacao => (
              <tr key={regulacao.id_regulacao}>
                <td>{regulacao.num_prontuario}</td>
                <td className="td-NomePaciente">{regulacao.nome_paciente}</td>
                <td>{regulacao.num_regulacao}</td>
                <td>{regulacao.un_origem}</td>
                <td>{regulacao.un_destino}</td>
                <td>{regulacao.nome_regulador_medico}</td>
                <td>{formatDateToPtBr(regulacao.data_hora_regulacao_medico)}</td>

                {userData?.tipo !== "Medico" && (
                  <td className="td-Icons">
                    <FcHome className="Icon Icons-Regulacao" onClick={() => handleOpenModalOrigem(regulacao)} />
                    <FcGlobe className="Icon Icons-Regulacao" />
                    <FcInTransit className="Icon Icons-Regulacao" />
                  </td>
                )}

              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModalOrigem && currentRegulacao && (
        <Modal show={showModalOrigem} onClose={handleCloseModal} title='Setor de Origem'>
          <SetorOrigem
            id_regulacao={currentRegulacao.id_regulacao}
            nome_paciente={currentRegulacao.nome_paciente}
            num_regulacao={currentRegulacao.num_regulacao}
            un_origem={currentRegulacao.un_origem}
            un_destino={currentRegulacao.un_destino}
            nome_regulador_medico={currentRegulacao.nome_regulador_medico}
            showSnackbar={showSnackbar} // Passa o controle do Snackbar
          />
        </Modal>
      )}


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


export default RegulacoesAprovadas;