import React, { useState, useEffect } from "react";
import axios from "axios";
import Modal from "../Modal/Modal.tsx";
import { Snackbar, Alert } from "@mui/material";
import NovaRegulacaoMedicoAprovada from "./RegulacaoMedicaAprovada.tsx";
import NovaRegulacaoMedicoNegada from "./RegulacaoMedicaNegada.tsx";
import { FcApproval, FcBadDecision } from "react-icons/fc";

import "./RegulacaoMedica.css";

const NODE_URL = import.meta.env.VITE_NODE_SERVER_URL;

interface Regulacao {
  id_regulacao: number;
  num_prontuario: number | null;
  nome_paciente: string;
  num_idade: number | null;
  un_origem: string;
  un_destino: string;
  num_prioridade: number | null;
  data_hora_solicitacao_01: string;
  data_hora_solicitacao_02: string;
  nome_regulador_nac: string;
  num_regulacao: number | null;
  nome_regulador_medico: string;
  data_hora_acionamento_medico: string;
}

const RegulacaoMedica: React.FC = () => {
  const [regulacoes, setRegulacoes] = useState<Regulacao[]>([]);
  const [showModalApproved, setShowModalApproved] = useState(false);
  const [showModalDeny, setShowModalDeny] = useState(false);
  const [currentRegulacao, setCurrentRegulacao] = useState<Regulacao | null>(null);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  // Defina fetchRegulacoes fora do useEffect
  const fetchRegulacoes = async () => {
    try {
      const response = await axios.get(
        `${NODE_URL}/api/internal/get/ListaRegulacoesPendentes`
      );

      if (response.data && Array.isArray(response.data.data)) {
        setRegulacoes(response.data.data);
      } else {
        console.error("Dados inesperados:", response.data);
      }
    } catch (error: any) {
      console.error("Erro ao carregar regulações:", error);
      setRegulacoes([]); // Garante que regulacoes seja sempre um array
    }
  };

  // useEffect apenas para a chamada inicial
  useEffect(() => {
    fetchRegulacoes();
  }, []);

  const calcularTempoDeEspera = (
    dataHoraSolicitacao: string,
    dataHoraAtual: string
  ) => {
    const dateSolicitacao = new Date(dataHoraSolicitacao); // Converte a string ISO para objeto Date
    const dateAtual = new Date(dataHoraAtual); // Converte a data e hora atual

    const diffInMilliseconds = dateAtual.getTime() - dateSolicitacao.getTime();
    const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60)); // Horas completas
    const diffInMinutes = Math.floor(
      (diffInMilliseconds % (1000 * 60 * 60)) / (1000 * 60)
    ); // Minutos restantes

    return `${diffInHours}h ${diffInMinutes}min`;
  };

  const obterDataHoraAtual = () => {
    const now = new Date();
    return now.toISOString(); // Retorna a data e hora atual no formato ISO
  };

  const handleOpenModalApproved = (regulacao: Regulacao) => {
    setCurrentRegulacao(regulacao);
    setShowModalApproved(true);
  };

  const handleOpenModalDeny = (regulacao: Regulacao) => {
    setCurrentRegulacao(regulacao);
    setShowModalDeny(true);
  };

  const handleCloseModal = () => {
    setShowModalApproved(false);
    setShowModalDeny(false);
    fetchRegulacoes();
    //window.location.reload(); // Recarregar a página ao fechar o modal
  };

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
      <div className="Header-ListaRegulaçoes">
        <label className="Title-Tabela">Regulações Pendentes</label>
      </div>

      <div>
        <table className="Table-Regulacoes">
          <thead>
            <tr>
              <th>Prontuário</th>
              <th>Nome Paciente</th>
              <th>Id</th>
              <th>Regulação</th>
              <th>Un. Origem</th>
              <th>Un. Destino</th>
              <th>Prio.</th>
              <th>Data Solicitação</th>
              <th>Tempo de Espera</th>
              <th>Regulação Médica</th>
            </tr>
          </thead>
          <tbody>
            {regulacoes.map((regulacao) => (
              <tr key={regulacao.id_regulacao}>
                <td>{regulacao.num_prontuario}</td>
                <td>{regulacao.nome_paciente}</td>
                <td>{regulacao.num_idade} Anos</td>
                <td>{regulacao.num_regulacao}</td>
                <td>{regulacao.un_origem}</td>
                <td>{regulacao.un_destino}</td>
                <td>{regulacao.num_prioridade}</td>
                <td>
                  {new Date(
                    regulacao.data_hora_solicitacao_02
                  ).toLocaleString()}
                </td>
                <td>
                  {calcularTempoDeEspera(
                    regulacao.data_hora_solicitacao_01,
                    obterDataHoraAtual()
                  )}
                </td>
                <td className="td-Icons">
                  <FcApproval
                    className="Icons-Regulacao"
                    onClick={() => handleOpenModalApproved(regulacao)}
                  />
                  <FcBadDecision
                    className="Icons-Regulacao"
                    onClick={() => handleOpenModalDeny(regulacao)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModalApproved && currentRegulacao && (
        <Modal
          show={showModalApproved}
          onClose={handleCloseModal}
          title="Regulação Médica: Aprovação"
        >
          <NovaRegulacaoMedicoAprovada
            id_regulacao={currentRegulacao.id_regulacao}
            nome_paciente={currentRegulacao.nome_paciente}
            num_regulacao={currentRegulacao.num_regulacao}
            un_origem={currentRegulacao.un_origem}
            un_destino={currentRegulacao.un_destino}
            nome_regulador_medico={currentRegulacao.nome_regulador_medico}
            onClose={handleCloseModal} // Fecha o modal
            showSnackbar={showSnackbar} // Passa o controle do Snackbar
          />
        </Modal>
      )}

      {showModalDeny && currentRegulacao && (
        <Modal
          show={showModalDeny}
          onClose={handleCloseModal}
          title="Regulação Médica: Negação"
        >
          <NovaRegulacaoMedicoNegada
            id_regulacao={currentRegulacao.id_regulacao}
            nome_paciente={currentRegulacao.nome_paciente}
            num_regulacao={currentRegulacao.num_regulacao}
            un_origem={currentRegulacao.un_origem}
            un_destino={currentRegulacao.un_destino}
            nome_regulador_medico={currentRegulacao.nome_regulador_medico}
            onClose={handleCloseModal} // Fecha o modal
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

export default RegulacaoMedica;
