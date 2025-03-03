import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AxiosError } from 'axios';
import { useLocation } from 'react-router-dom';
import { Snackbar, Alert } from '@mui/material';
import { FcNews } from "react-icons/fc";

/*IMPORT COMPONENTS*/
import Modal from '../Modal/Modal';
import Desfecho from '../Desfecho/Desfecho';
import TimeTracker from "../TimeTracker/TimeTracker.tsx";

/*IMPORT INTERFACES*/
import { RegulacaoAprovadaData } from '../../interfaces/Regulacao.ts';
import { StatusRegulacaoData } from '../../interfaces/Status.ts';
import { DadosPacienteData } from "../../interfaces/DadosPaciente.ts";

/*IMPORT FUNCTIONS*/
import { removerText } from "../../functions/RemoveText.ts";

/*IMPORT CSS*/
import './Desfecho.css';

/*IMPORT JSON*/
import status_regulacao from '../../JSON/status_regulacao.json';

/*IMPORT VARIAVEIS DE AMBIENTE*/
const NODE_URL = import.meta.env.VITE_NODE_SERVER_URL;

interface SearchForm {
  nomePaciente: string;
  numProntuario: string;
  numRegulacao: string;
  statusRegulacao: string;
}

const initialForm: SearchForm = {
  nomePaciente: "",
  numProntuario: "",
  numRegulacao: "",
  statusRegulacao: "",
};

const ListarDesfecho: React.FC = () => {
  const location = useLocation();
  const [dadosPaciente, setDadosPaciente] = useState<DadosPacienteData | null>(null);
  const [currentRegulacao, setCurrentRegulacao] = useState<RegulacaoAprovadaData | null>(null);
  const [serverTime, setServerTime] = useState("");
  const [formData, setFormData] = useState<SearchForm>(initialForm);

  /*MODAIS*/
  const [ShowModalDesfecho, setShowModalDesfecho] = useState(false);

  /*FILTROS*/
  const [statusRegulacao, setStatusRegulacao] = useState<StatusRegulacaoData[]>([]);
  const [filteredRegulacoes, setFilteredRegulacoes] = useState<RegulacaoAprovadaData[]>([]);

  /*PAGINAÇÃO*/
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  /*SNACKBAR*/
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');

  //Carrega a lista de STATUS REGULACAO
  useEffect(() => {
    setStatusRegulacao(status_regulacao);
  }, []);

  // Snackbar vindo de navegação
  useEffect(() => {
    if (location.state?.snackbar) {
      showSnackbar(
        location.state.snackbar.message,
        location.state.snackbar.severity
      );

      // Limpa o state da navegação após exibir
      location.state.snackbar = undefined;
    }
  }, [location.state?.snackbar]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSearch = async (e?: React.FormEvent) => {
    // Evita o comportamento padrão do formulário se o evento existir
    if (e) {
      e.preventDefault();
    }

    try {
      const params = new URLSearchParams();
      if (formData.nomePaciente) params.append('nomePaciente', formData.nomePaciente);
      if (formData.numProntuario) params.append('numProntuario', formData.numProntuario);
      if (formData.numRegulacao) params.append('numRegulacao', formData.numRegulacao);
      if (formData.statusRegulacao) params.append('statusRegulacao', formData.statusRegulacao);

      const response = await axios.get(`${NODE_URL}/api/internal/get/PesquisaPaciente`, { params });

      if (response.data?.data) {
        setFilteredRegulacoes(response.data.data);
        setServerTime(response.data.serverTime);
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        const message = error.response?.data?.message || 'Erro na requisição';
        showSnackbar(message, 'error');
      } else {
        showSnackbar('Erro desconhecido', 'error');
      }
    }
  };

  const handleOpenModalDesfecho = (regulacao: RegulacaoAprovadaData) => {
    setCurrentRegulacao(regulacao);

    // Supondo que você já tenha todos os dados necessários na `regulacao` ou possa fazer algum processamento:
    const dados: DadosPacienteData = {
      nome_paciente: regulacao.nome_paciente,
      num_regulacao: regulacao.num_regulacao,
      num_prontuario: regulacao.num_prontuario,
      un_origem: regulacao.un_origem,
      num_leito: regulacao.num_leito,
      un_destino: regulacao.un_destino,
      id_regulacao: regulacao.id_regulacao,
      nome_regulador_medico: regulacao.nome_regulador_medico, // Certifique-se de que este campo possui um valor válido
    };

    console.log(dados);

    setDadosPaciente(dados);
    setShowModalDesfecho(true);
  };

  const handleCloseModal = () => {
    handleSearch();
    setShowModalDesfecho(false);

    //window.location.reload(); // Recarregar a página ao fechar o modal
  };

  const filterClear = (e: React.FormEvent) => {
    e.preventDefault();
    setFormData(initialForm);
  };

  //CONFIGURA A PAGINAÇÃO
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };


  const showSnackbar = (
    message: string,
    severity: 'success' | 'error' | 'info' | 'warning'
  ): void => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = (): void => {
    setSnackbarOpen(false);
  };

  const indexOfLastRegulacao = currentPage * itemsPerPage;
  const indexOfFirstRegulacao = indexOfLastRegulacao - itemsPerPage;
  const currentRegulacoes = filteredRegulacoes.slice(indexOfFirstRegulacao, indexOfLastRegulacao);

  const totalPages = Math.ceil(filteredRegulacoes.length / itemsPerPage);

  return (
    <>
      <div className='Component'>
        <div className='Component-Table'>
          <div className="Header-ListaRegulaçoes">
            <label className="Title-Tabela">Desfechos</label>
          </div>

          <div>
            {/* Formulário de Pesquisa */}
            <form onSubmit={handleSearch} className="form-search">
              {/* Primeira linha: Nome do Paciente */}
              <div className="search-desfecho-line search-desfecho-row">
                <input
                  type="text"
                  name="nomePaciente"
                  value={formData.nomePaciente}
                  onChange={handleInputChange}
                  placeholder="Nome do Paciente"
                />
              </div>

              {/* Segunda linha: Número do prontuário, Número da regulação e Status */}
              <div className="search-desfecho-line search-desfecho-row">
                <input
                  type="number"
                  name="numProntuario"
                  value={formData.numProntuario}
                  onChange={handleInputChange}
                  placeholder="Nº do Prontuário"
                />
                <input
                  type="number"
                  name="numRegulacao"
                  value={formData.numRegulacao}
                  onChange={handleInputChange}
                  placeholder="Nº da Regulação"
                />
                <select
                  name="statusRegulacao"
                  value={formData.statusRegulacao}
                  onChange={handleInputChange}
                >
                  <option value="">Selecione uma status</option>
                  {statusRegulacao.map((statusRegulacao) => (
                    <option key={statusRegulacao.value} value={statusRegulacao.value}>
                      {statusRegulacao.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Terceira linha: Botão de Pesquisar */}
              <div className="Div-Buttons Central">
                <button type="submit" className="button">
                  Pesquisar
                </button>
                <button type="button" className="button-clear" onClick={filterClear}>
                  Limpar
                </button>
              </div>
            </form>
          </div>

          {/* Tabela de Regulações */}
          <div>
            <table className='Table-Regulacoes'>
              <thead>
                <tr>
                  <th>Regulador NAC</th>
                  <th>Pront.</th>
                  <th>Nome Paciente</th>
                  <th>Num. Regulação</th>
                  <th>Un. Origem</th>
                  <th>Un. Destino</th>
                  <th>Tempo de Espera</th>
                  <th>Fase</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {currentRegulacoes.map(regulacao => (
                  <tr key={regulacao.id_regulacao}>
                    <td>{regulacao.nome_regulador_nac}</td>
                    <td>{regulacao.num_prontuario}</td>
                    <td className="td-NomePaciente">{regulacao.nome_paciente}</td>
                    <td>{regulacao.num_regulacao}</td>
                    <td>{regulacao.un_origem}</td>
                    <td>{regulacao.un_destino}</td>
                    <td className='td-TempoEspera'>
                      <TimeTracker startTime={regulacao.data_hora_solicitacao_02} serverTime={serverTime} />
                    </td>
                    <td>{removerText(regulacao.status_regulacao)}</td>
                    <td className='td-Icons'>
                      <FcNews
                        className='Icon Icons-Regulacao'
                        onClick={() => handleOpenModalDesfecho(regulacao)}
                        title='Forçar Desfecho' />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="Pagination">
          <button className='button-pagination' onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Anterior</button>
          <span>{`Página ${currentPage} de ${totalPages}`}</span>
          <button className='button-pagination' onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>Próxima</button>
        </div>
      </div>


      {ShowModalDesfecho && currentRegulacao && dadosPaciente && (
        <Modal show={ShowModalDesfecho} onClose={handleCloseModal} title='Desfecho'>
          <Desfecho
            dadosPaciente={currentRegulacao}
            forcado= {true}
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

export default ListarDesfecho;