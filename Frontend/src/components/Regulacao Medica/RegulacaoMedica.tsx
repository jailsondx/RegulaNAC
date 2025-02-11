import React, { useState, useEffect } from "react";
import axios from "axios";
import { AxiosError } from 'axios';
import { Snackbar, Alert } from "@mui/material";
import { FcApproval, FcBadDecision } from "react-icons/fc";
import { LuFilter } from "react-icons/lu";

/*IMPORT INTERFACES*/
import { RegulacaoData } from '../../interfaces/Regulacao';
import { DadosPacienteData } from "../../interfaces/DadosPaciente.ts";

/*IMPORT COMPONENTS*/
import NovaRegulacaoMedicoAprovada from "./RegulacaoMedicaAprovada";
import NovaRegulacaoMedicoNegada from "./RegulacaoMedicaNegada";
import TimeTracker from "../TimeTracker/TimeTracker";
import Filtro from '../Filtro/Filtro';
import Modal from "../Modal/Modal";

/*IMPORT FUNCTIONS*/
import { getDay, getMonth, getYear } from '../../functions/DateTimes.ts';
import { formatDateToPtBr } from "../../functions/DateTimes.ts";

/*IMPORT CSS*/
import "./RegulacaoMedica.css";

/*IMPORT VARIAVEIS DE AMBIENTE*/
const NODE_URL = import.meta.env.VITE_NODE_SERVER_URL;

const RegulacaoMedica: React.FC = () => {
  const [serverTime, setServerTime] = useState("");
  const [regulacoes, setRegulacoes] = useState<RegulacaoData[]>([]);
  const [showModalApproved, setShowModalApproved] = useState(false);
  const [showModalDeny, setShowModalDeny] = useState(false);
  const [currentRegulacao, setCurrentRegulacao] = useState<RegulacaoData | null>(null);
  const [dadosPaciente, setDadosPaciente] = useState<DadosPacienteData | null>(null);
  const [elapsedTime, setElapsedTime] = useState<string>(''); // Armazena o tempo decorrido

  /*FILTROS*/
  const [filteredRegulacoes, setFilteredRegulacoes] = useState<RegulacaoData[]>([]);
  const [unidadeOrigem, setUnidadeOrigem] = useState('');
  const [unidadeDestino, setUnidadeDestino] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false); // Controle da exibição dos filtros

  /*PAGINAÇÃO*/
  const [currentPage, setCurrentPage] = useState(1);  // Página atual
  const [itemsPerPage] = useState(10);  // Número de itens por página

  /*SNACKBAR*/
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');

  // Defina fetchRegulacoes fora do useEffect
  const fetchRegulacoes = async () => {
    try {
      const response = await axios.get(`${NODE_URL}/api/internal/get/ListaRegulacoesPendentes`);

      if (response.data && Array.isArray(response.data.data)) {
        setRegulacoes(response.data.data);
        setServerTime(response.data.serverTime); // Hora atual do servidor em formato ISO
      } else {
        console.error("Dados inesperados:", response.data);
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        console.error('Erro ao carregar regulações:', error);
        setRegulacoes([]); // Garante que regulacoes seja sempre um array
      } else if (error instanceof Error) {
        // Se o erro for do tipo genérico `Error`, trate-o também
        console.error('Erro desconhecido:', error.message);
        setRegulacoes([]); // Garante que regulacoes seja sempre um array
      } else {
        // Caso o erro seja de um tipo inesperado
        console.error('Erro inesperado:', error);
        setRegulacoes([]); // Garante que regulacoes seja sempre um array
      }
    }
  };

  // useEffect apenas para a chamada inicial
  useEffect(() => {
    fetchRegulacoes();
  }, []);

  //INICIALIZAÇÃO DOS FILTROS
  useEffect(() => {
    let filtered = regulacoes;

    if (unidadeOrigem) {
      filtered = filtered.filter((r) => r.un_origem === unidadeOrigem);
    }

    if (unidadeDestino) {
      filtered = filtered.filter((r) => r.un_destino === unidadeDestino);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (r) =>
          r.nome_paciente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.num_prontuario?.toString().includes(searchTerm) ||
          r.num_regulacao?.toString().includes(searchTerm)
      );
    }

    setFilteredRegulacoes(filtered);
  }, [unidadeOrigem, unidadeDestino, searchTerm, regulacoes]);

  const fetchPDF = async (datetime: string, filename: string) => {
    const year = getYear(datetime);
    const month = getMonth(datetime);
    const day = getDay(datetime);

    try {
      const response = await axios.get(`${NODE_URL}/api/internal/upload/ViewPDF`, {
        params: { year, month, day, filename },
        responseType: 'blob',
      });

      // Criar uma URL temporária para o PDF
      const url = URL.createObjectURL(response.data);

      // Abrir o PDF em uma nova aba
      window.open(url, '_blank');
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response) {
        const { status, data } = error.response;

        // Usando switch case para tratar diferentes status de erro
        switch (status) {
          case 400:
            showSnackbar(data?.message || 'Parâmetros inválidos. Verifique os dados.', 'error');
            break;

          case 404:
            showSnackbar(data?.message || 'Arquivo PDF não encontrado.', 'error');
            break;

          case 500:
            showSnackbar(data?.message || 'Erro no servidor ao buscar o arquivo.', 'error');
            break;

          default:
            showSnackbar(data?.message || 'Erro desconhecido. Tente novamente.', 'error');
            break;
        }
      } else {
        // Caso o erro não tenha uma resposta, como no caso de problemas de rede
        showSnackbar('Erro na requisição. Tente novamente.', 'error');
      }
    }
  };

  // Atualiza o tempo decorrido
  const handleTimeUpdate = (time: string) => {
    setElapsedTime(time); // Salva o tempo decorrido no estado
  };

  const handleOpenModalApproved = (regulacao: RegulacaoData) => {
    setCurrentRegulacao(regulacao);

    // Supondo que você já tenha todos os dados necessários na `regulacao` ou possa fazer algum processamento:
    const dados: DadosPacienteData = {
      nome_paciente: regulacao.nome_paciente,
      num_regulacao: regulacao.num_regulacao,
      un_origem: regulacao.un_origem,
      un_destino: regulacao.un_destino,
      id_regulacao: regulacao.id_regulacao,
      nome_regulador_medico: regulacao.nome_regulador_medico, // Certifique-se de que este campo possui um valor válido
    };

    setDadosPaciente(dados);
    setShowModalApproved(true);
  };

  const handleOpenModalDeny = (regulacao: RegulacaoData) => {
    setCurrentRegulacao(regulacao);

    // Supondo que você já tenha todos os dados necessários na `regulacao` ou possa fazer algum processamento:
    const dados: DadosPacienteData = {
      nome_paciente: regulacao.nome_paciente,
      num_regulacao: regulacao.num_regulacao,
      un_origem: regulacao.un_origem,
      un_destino: regulacao.un_destino,
      id_regulacao: regulacao.id_regulacao,
      nome_regulador_medico: regulacao.nome_regulador_medico, // Certifique-se de que este campo possui um valor válido
    };

    setDadosPaciente(dados);
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
    severity: 'success' | 'error' | 'info' | 'warning'
  ): void => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  //CONFIGURA A PAGINAÇÃO
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const indexOfLastRegulacao = currentPage * itemsPerPage;
  const indexOfFirstRegulacao = indexOfLastRegulacao - itemsPerPage;
  const currentRegulacoes = filteredRegulacoes.slice(indexOfFirstRegulacao, indexOfLastRegulacao);

  const totalPages = Math.ceil(filteredRegulacoes.length / itemsPerPage);

  return (
    <>
      <div className="Component">
        <div className='Component-Table'>

          <div className="Header-ListaRegulaçoes">
            <label className="Title-Tabela">
              Regulações Pendentes <LuFilter className='Icon' onClick={() => setShowFilters(!showFilters)} title='Filtros' />
            </label>
          </div>

          {showFilters && (
            <div className="Filtro-Container">
              <input
                type="text"
                placeholder="Buscar por Nome, Prontuário ou Regulação"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="Search-Input"
              />
              <Filtro
                filtros={[
                  {
                    label: 'Unidade Origem',
                    value: unidadeOrigem,
                    options: [...new Set(regulacoes.map((r) => r.un_origem).filter(Boolean))],
                    onChange: setUnidadeOrigem,
                  },
                  {
                    label: 'Unidade Destino',
                    value: unidadeDestino,
                    options: [...new Set(regulacoes.map((r) => r.un_destino).filter(Boolean))],
                    onChange: setUnidadeDestino,
                  },
                ]}
                onClear={() => {
                  setUnidadeOrigem('');
                  setUnidadeDestino('');
                  setSearchTerm('');
                }}
              />

            </div>
          )}

          <div>
            <table className="Table-Regulacoes">
              <thead>
                <tr>
                  <th>Pront.</th>
                  <th className="col-NomePaciente">Nome Paciente</th>
                  <th className="col-NumIdade">Id.</th>
                  <th>Nasc.</th>
                  <th className="col-NumRegulacao">Regulação</th>
                  <th>Un. Origem</th>
                  <th>Un. Destino</th>
                  <th className="col-Prioridade">Prio.</th>
                  <th>Acionamento Médico</th>
                  <th>Tempo de Espera</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {currentRegulacoes.map((regulacao) => (
                  <tr key={regulacao.id_regulacao}>
                    <td>{regulacao.num_prontuario}</td>
                    <td className="col-NomePaciente">
                      <a onClick={() => fetchPDF(regulacao.data_hora_solicitacao_02, regulacao.link)}>
                        {regulacao.nome_paciente}
                      </a>
                    </td>
                    <td className="col-NumIdade">{regulacao.num_idade}</td>
                    <td>{formatDateToPtBr(regulacao.data_nascimento)}</td>
                    <td className="col-NumRegulacao">{regulacao.num_regulacao}</td>
                    <td>{regulacao.un_origem}</td>
                    <td>{regulacao.un_destino}</td>
                    <td className="col-Prioridade">{regulacao.prioridade}</td>
                    <td>{new Date(regulacao.data_hora_acionamento_medico).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="td-TempoEspera">
                      <TimeTracker
                        startTime={regulacao.data_hora_acionamento_medico}
                        serverTime={serverTime}
                        onTimeUpdate={handleTimeUpdate}
                      />
                    </td>
                    <td className="td-Icons">
                      <FcApproval className="Icon Icons-Regulacao" onClick={() => handleOpenModalApproved(regulacao)} />
                      <FcBadDecision className="Icon Icons-Regulacao" onClick={() => handleOpenModalDeny(regulacao)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {showModalApproved && currentRegulacao && dadosPaciente && (
            <Modal
              show={showModalApproved}
              onClose={handleCloseModal}
              title="Regulação Médica: Aprovação"
            >
              <NovaRegulacaoMedicoAprovada
                dadosPaciente={dadosPaciente}
                tempoEspera={elapsedTime} // Passa o tempo para o modal
                onClose={handleCloseModal} // Fecha o modal
                showSnackbar={showSnackbar} // Passa o controle do Snackbar
              />
            </Modal>
          )}

          {showModalDeny && currentRegulacao && dadosPaciente && (
            <Modal
              show={showModalDeny}
              onClose={handleCloseModal}
              title="Regulação Médica: Negação"
            >
              <NovaRegulacaoMedicoNegada
                dadosPaciente={currentRegulacao}
                onClose={handleCloseModal} // Fecha o modal
                showSnackbar={showSnackbar} // Passa o controle do Snackbar
              />
            </Modal>
          )}

        </div>


        <div className="Pagination">
          <button className='button-pagination' onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Anterior</button>
          <span>{`Página ${currentPage} de ${totalPages}`}</span>
          <button className='button-pagination' onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>Próxima</button>
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

export default RegulacaoMedica;
