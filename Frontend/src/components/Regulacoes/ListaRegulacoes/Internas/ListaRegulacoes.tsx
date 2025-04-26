import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AxiosError } from 'axios';
import { useLocation } from 'react-router-dom';
import { Snackbar, Alert } from '@mui/material';

/*IMPORT INTERFACES*/
import { UserData } from '../../../../interfaces/UserData';
import { RegulacaoData } from '../../../../interfaces/Regulacao';

/*IMPORT COMPONENTS*/
import HeaderFiltroInterno from '../../../Header/Header_Lista_Interna';
import TabelaRegulacoesInternas from '../../Tabela de Regulacoes/Internas/TabelaRegulacoesInternas';

/*IMPORT FUNCTIONS*/
import { getUserData } from '../../../../functions/storageUtils';


/*IMPORT CSS*/
import '../ListaRegulacoes.css';

/*IMPORT JSON*/

/*IMPORT UTILS*/
import { fetchPDF } from '../../../../Utils/fetchPDF';

/*IMPORT VARIAVEIS DE AMBIENTE*/
const NODE_URL = import.meta.env.VITE_NODE_SERVER_URL;

interface Props {
  title: string;
}

const ListaRegulacoesInternas: React.FC<Props> = ({ title }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [serverTime, setServerTime] = useState("");
  const [regulacoes, setRegulacoes] = useState<RegulacaoData[]>([]); // Tipo do estado
  const location = useLocation();

  /*FILTROS*/
  const [unidadeOrigem, setUnidadeOrigem] = useState('');
  const [unidadeDestino, setUnidadeDestino] = useState('');
  const [filteredRegulacoes, setFilteredRegulacoes] = useState<RegulacaoData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  /*PAGINAÇÃO*/
  const [currentPage, setCurrentPage] = useState(1);  // Página atual
  const [itemsPerPage] = useState(10);  // Número de itens por página
  const indexOfLastRegulacao = currentPage * itemsPerPage;
  const indexOfFirstRegulacao = indexOfLastRegulacao - itemsPerPage;
  const currentRegulacoes = filteredRegulacoes.slice(indexOfFirstRegulacao, indexOfLastRegulacao);
  const totalPages = Math.ceil(filteredRegulacoes.length / itemsPerPage);

  /*ORDENAÇÃO*/
  const [sortConfig, setSortConfig] = useState<{ key: keyof RegulacaoData; direction: "asc" | "desc" } | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<keyof RegulacaoData | null>(null);

  /*SNACKBAR*/
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');

  //Pega dados do SeassonStorage User
  useEffect(() => {
    const data = getUserData();
    setUserData(data);
  }, []);

  //CHAMADA DE API PARA GERAR A LISTA DE REGULAÇÕES
  useEffect(() => {
    const fetchRegulacoes = async () => {
      try {
        const response = await axios.get(`${NODE_URL}/api/internal/get/ListaRegulacoesPendentes`);

        if (response.data && Array.isArray(response.data.data)) {
          setRegulacoes(response.data.data);
          setServerTime(response.data.serverTime); // Hora atual do servidor em formato ISO
          setFilteredRegulacoes(response.data.data);
        } else {
          console.error('Dados inesperados:', response.data);
        }
      } catch (error: unknown) {
        // Verifica se o erro é uma instância de AxiosError
        if (error instanceof AxiosError) {
          // Se o erro tiver uma resposta, você pode tratar a mensagem de erro (caso haja)
          console.error('Erro ao carregar regulações:', error.response?.data?.message || error.message);
        } else {
          // Caso o erro não seja um AxiosError, loga a mensagem do erro genérico
          console.error('Erro desconhecido ao carregar regulações:', error);
        }

        // Garante que regulacoes seja sempre um array vazio em caso de erro
        setRegulacoes([]);
      }

    };

    fetchRegulacoes();
  }, []);

  //MOSTRA SNACKBAR APÓS AÇÃO
  useEffect(() => {
    if (location.state?.snackbar) {
      showSnackbar(
        location.state.snackbar.message,
        location.state.snackbar.severity
      );

      // Limpa o state da navegação após exibir
      location.state.snackbar = undefined;
    }
  }, [location.state]);

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

  //FUNÇÃO PARA BUSCAR O PDF
  const handleFetchPDF = (datetime: string, filename: string) => {
    fetchPDF(datetime, filename, showSnackbar);
  };

  //CONFIGURA A PAGINAÇÃO
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
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

  //EXIBE O SNACKBAR
  const showSnackbar = (
    message: string,
    severity: 'success' | 'error' | 'info' | 'warning'
  ): void => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  //FECHA O SNACKBAR
  const handleSnackbarClose = (): void => {
    setSnackbarOpen(false);
  };


  return (
    <>
      <div className='Component'>
        <div className='Component-Table'>

          <HeaderFiltroInterno
            title={title}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            unidadeDestino={unidadeDestino}
            setUnidadeDestino={setUnidadeDestino}
            unidadeOrigem={unidadeOrigem}
            setUnidadeOrigem={setUnidadeOrigem}
            regulacoes={regulacoes}
          />


          <div>
            {userData && (
              <TabelaRegulacoesInternas
                currentRegulacoes={currentRegulacoes}
                selectedColumn={selectedColumn}
                sortConfig={sortConfig}
                handleSort={handleSort}
                fetchPDF={handleFetchPDF}
                serverTime={serverTime}
                IconOpcoes='normais'
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


export default ListaRegulacoesInternas;