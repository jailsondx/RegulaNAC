import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AxiosError } from 'axios';
import { useLocation } from 'react-router-dom';
import { Snackbar, Alert } from '@mui/material';

/*IMPORT COMPONENTS*/
import Modal from '../Modal/Modal';
import Desfecho from '../Desfecho/Desfecho';
import TabelaRegulacoesInternas from '../Regulacoes/Tabela de Regulacoes/Internas/TabelaRegulacoesInternas.tsx';

/*IMPORT INTERFACES*/
import { UserData } from '../../interfaces/UserData.ts';
import { RegulacaoAprovadaData } from '../../interfaces/Regulacao.ts';
import { StatusRegulacaoData } from '../../interfaces/Status.ts';
import { DadosPacienteData } from "../../interfaces/DadosPaciente.ts";
import { RegulacaoData } from '../../interfaces/Regulacao';

/*IMPORT FUNCTIONS*/
import { getUserData } from '../../functions/storageUtils.ts';
import { getDay, getMonth, getYear } from '../../functions/DateTimes';

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
  const [userData, setUserData] = useState<UserData | null>(null);
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

  /*ORDENAÇÃO*/
  const [sortConfig, setSortConfig] = useState<{ key: keyof RegulacaoData; direction: "asc" | "desc" } | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<keyof RegulacaoData | null>(null);

  /*SNACKBAR*/
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');

  /*PAGINAÇÃO*/
  const indexOfLastRegulacao = currentPage * itemsPerPage;
  const indexOfFirstRegulacao = indexOfLastRegulacao - itemsPerPage;
  const currentRegulacoes = filteredRegulacoes.slice(indexOfFirstRegulacao, indexOfLastRegulacao);
  const totalPages = Math.ceil(filteredRegulacoes.length / itemsPerPage);

  //Pega dados do SeassonStorage User
  useEffect(() => {
    const data = getUserData();
    setUserData(data);
  }, []);


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

  //FUNÇÃO PARA BUSCAR O PDF
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
      // Verificar se o erro é uma instância de AxiosError
      if (error instanceof AxiosError && error.response) {
        const { status, data } = error.response;

        // Exemplo de tratamento de diferentes códigos de status usando switch case
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
            // Caso um erro desconhecido ocorra
            showSnackbar(data?.message || 'Erro desconhecido. Tente novamente.', 'error');
            break;
        }
      } else {
        // Caso o erro não seja uma instância de AxiosError ou não tenha resposta, por exemplo, se o servidor não estiver acessível
        showSnackbar('Erro na requisição. Tente novamente.', 'error');
      }
    }
  };

  //CONFIGURA A ORDENAÇÃO
  const handleSort = (key: keyof RegulacaoData) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig?.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    const sortedData = [...filteredRegulacoes].sort((a, b) => {
      if (a[key] === null || b[key] === null) return 0; // Evita erros com valores null
      if (a[key]! < b[key]!) return direction === "asc" ? -1 : 1;
      if (a[key]! > b[key]!) return direction === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredRegulacoes(sortedData);
    setSelectedColumn(key);
  };

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



  return (
    <>
      <div className='Component'>
        <div className='Component-Table'>
          <div className="Header-ListaRegulaçoes">
            <label className="Title-Tabela">Desfechos</label>
          </div>

          {/* Pesquisa */}
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
            {(userData &&
              <TabelaRegulacoesInternas
                currentRegulacoes={currentRegulacoes}
                selectedColumn={selectedColumn}
                sortConfig={sortConfig}
                handleSort={handleSort}
                fetchPDF={fetchPDF}
                serverTime={serverTime}
                handleOpenModalDesfecho={handleOpenModalDesfecho}
                IconOpcoes='desfecho'
                UserData={userData}
              />
            )}
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
            forcado={true}
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