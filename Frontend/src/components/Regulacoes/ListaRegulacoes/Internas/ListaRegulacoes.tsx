import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AxiosError } from 'axios';
import { useLocation } from 'react-router-dom';
import { Snackbar, Alert } from '@mui/material';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from '@mui/material';


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
import { fetchPDF } from '../../../../Utils/fetchPDF';

/*IMPORT VARIAVEIS DE AMBIENTE*/
const NODE_URL = import.meta.env.VITE_NODE_SERVER_URL;

interface Props {
  title: string;
}

const ListaRegulacoesInternas: React.FC<Props> = ({ title }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [dadosPaciente, setDadosPaciente] = useState<DadosPacienteData | null>(null);
  const [serverTime, setServerTime] = useState("");
  const [regulacoes, setRegulacoes] = useState<RegulacaoData[]>([]); // Tipo do estado
  const [currentRegulacao, setCurrentRegulacao] = useState<RegulacaoData | null>(null);
  const location = useLocation();
  const [ShowModalObservacao, setShowModalObservacao] = useState(false);

  /*DIALOG EXCLUIR REGULACAO*/
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [regulacaoParaExcluir, setRegulacaoParaExcluir] = useState<{ id_user: number | null, id_regulacao: number | null } | null>(null);


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

  //Pega dados do SeassonStorage User
  useEffect(() => {
    const data = getUserData();
    setUserData(data);
  }, []);

  //CHAMADA DE API PARA GERAR A LISTA DE REGULAÇÕES
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

    console.log("Sorting by:", key, "Direction:", direction);  // Verifique se está passando corretamente

    setSortConfig({ key, direction });

    const sortedData = [...filteredRegulacoes].sort((a, b) => {
      if (a[key] === null || b[key] === null) return 0;
      if (a[key]! < b[key]!) return direction === "asc" ? -1 : 1;
      if (a[key]! > b[key]!) return direction === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredRegulacoes(sortedData);
    setSelectedColumn(key);
  };


  //EXCLUSÃO DE REGULAÇÃO
  const confirmarExclusao = (id_user: number | null, id_regulacao: number | null) => {
    setRegulacaoParaExcluir({ id_user, id_regulacao });
    setConfirmDialogOpen(true);
  };

  const handleApagar = async () => {
    if (!regulacaoParaExcluir) return;

    const { id_user, id_regulacao } = regulacaoParaExcluir;

    try {
      const response = await axios.delete(`${NODE_URL}/api/internal/delete/Regulacao`, {
        data: { id_user, id_regulacao }
      });

      if (response.status === 200) {
        showSnackbar('Regulação apagada com sucesso!', 'success');
        setRegulacoes(prev => prev.filter(reg => reg.id_regulacao !== id_regulacao));
        setFilteredRegulacoes(prev => prev.filter(reg => reg.id_regulacao !== id_regulacao));
      } else {
        showSnackbar('Erro ao apagar a regulação.', 'error');
      }
    } catch (error) {
      console.error('Erro ao apagar regulação:', error);
      showSnackbar('Erro interno ao apagar regulação.', 'error');
    }

    setConfirmDialogOpen(false);
    setRegulacaoParaExcluir(null);
    fetchRegulacoes(); // Recarregar a lista de regulações
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
                confirmarExclusao={confirmarExclusao}
                serverTime={serverTime}
                IconOpcoes='normais'
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


      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <Typography>Tem certeza que deseja excluir esta regulação?</Typography>
          {regulacaoParaExcluir?.id_regulacao && (
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              {/*Número da Regulação: <strong>{regulacaoParaExcluir.id_regulacao}</strong>*/}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleApagar} color="error" variant="contained">
            Apagar
          </Button>
        </DialogActions>
      </Dialog>

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