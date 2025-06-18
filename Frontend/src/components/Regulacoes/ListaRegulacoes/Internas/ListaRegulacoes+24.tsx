import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AxiosError } from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { Snackbar, Alert } from '@mui/material';

/*IMPORT INTERFACES*/
import { UserData } from '../../../../interfaces/UserData';
import { RegulacaoData } from '../../../../interfaces/Regulacao.ts';
import { DadosPacienteData } from "../../../../interfaces/DadosPaciente.ts";

/*IMPORT COMPONENTS*/
import Modal from '../../../Modal/Modal.tsx';
import HeaderFiltroInterno from '../../../Header/Header_Lista_Interna';
import TabelaRegulacoesInternas from '../../Tabela de Regulacoes/Internas/TabelaRegulacoesInternas';
import ObservacoesNAC from '../../../Obsevacoes/ObervacoesNAC.tsx';


/*IMPORT FUNCTIONS*/
import { getUserData } from '../../../../functions/storageUtils';

/*IMPORT CSS*/
import '../ListaRegulacoes.css';

/*IMPORT JSON*/

/*IMPORT UTILS*/
import { atualizarRegulacao } from '../../../../Utils/handleAtualizarRegulacao';
import { fetchPDF } from '../../../../Utils/fetchPDF';



/*IMPORT VARIAVEIS DE AMBIENTE*/
const NODE_URL = import.meta.env.VITE_NODE_SERVER_URL;

interface Props {
  title: string;
}

const ListaRegulacoes24hrs: React.FC<Props> = ({ title }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [dadosPaciente, setDadosPaciente] = useState<DadosPacienteData | null>(null);
  const [serverTime, setServerTime] = useState("");
  const [regulacoes, setRegulacoes] = useState<RegulacaoData[]>([]); // Tipo do estado
  const [currentRegulacao, setCurrentRegulacao] = useState<RegulacaoData | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [ShowModalObservacao, setShowModalObservacao] = useState(false);

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


  const fetchRegulacoes = async () => {
    try {
      const response = await axios.get(`${NODE_URL}/api/internal/get/ListaRegulacoesPendentes24`);

      if (response.data && Array.isArray(response.data.data)) {
        setRegulacoes(response.data.data);
        setServerTime(response.data.serverTime); // Hora atual do servidor em formato ISO
        setFilteredRegulacoes(response.data.data);
      } else {
        console.error('Dados inesperados:', response.data);
      }
    } catch (error: unknown) {
      // Verifica se o erro é uma instância de AxiosError (caso você esteja lidando com erros de rede)
      if (error instanceof AxiosError) {
        console.error('Erro ao carregar regulações:', error.response?.data);
        setRegulacoes([]); // Garante que regulacoes seja sempre um array
      } else {
        // Caso o erro não seja um AxiosError ou seja de outro tipo
        console.error('Erro desconhecido ao carregar regulações:', error);
        setRegulacoes([]); // Garante que regulacoes seja sempre um array
      }
    }

  };


  //Pega dados do SeassonStorage User
  useEffect(() => {
    const data = getUserData();
    setUserData(data);
  }, []);


  // useEffect apenas para a chamada inicial
  useEffect(() => {
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

  //FUNÇÃO PARA ATUALIZAR REGULAÇÃO
  const handleClick_atualizarRegulacao = (regulacao: RegulacaoData) => {
    atualizarRegulacao(regulacao, navigate, showSnackbar);
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


  const handleOpenModalObservacao = (regulacao: RegulacaoData) => {
    setCurrentRegulacao(regulacao);

    // Supondo que você já tenha todos os dados necessários na `regulacao` ou possa fazer algum processamento:
    const dados: DadosPacienteData = {
      nome_paciente: regulacao.nome_paciente,
      num_prontuario: regulacao.num_prontuario,
      num_regulacao: regulacao.num_regulacao,
      un_origem: regulacao.un_origem,
      un_destino: regulacao.un_destino,
      preparo_leito: regulacao.preparo_leito,
      id_regulacao: regulacao.id_regulacao,
      nome_regulador_medico: regulacao.nome_regulador_medico, // Certifique-se de que este campo possui um valor válido
    };

    setDadosPaciente(dados);
    setShowModalObservacao(true);
  };

  const handleCloseModal = () => {
    setShowModalObservacao(false);
    fetchRegulacoes();
    //window.location.reload(); // Recarregar a página ao fechar o modal
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
                handleAtualizarRegulacao={handleClick_atualizarRegulacao}
                IconOpcoes='expiradas'
                UserData={userData}
                handleOpenModalObservacao={handleOpenModalObservacao}
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


      {ShowModalObservacao && currentRegulacao && dadosPaciente && (
        <Modal show={ShowModalObservacao} onClose={handleCloseModal} title='Observação'>
          <ObservacoesNAC
            dadosPaciente={currentRegulacao}
            observacaoTexto={currentRegulacao.observacaoTexto ?? ''}
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


export default ListaRegulacoes24hrs;