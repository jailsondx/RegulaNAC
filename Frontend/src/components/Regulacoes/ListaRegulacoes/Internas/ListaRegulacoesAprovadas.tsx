import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Snackbar, Alert } from "@mui/material";

/*IMPORT INTERFACES*/
import { UserData } from '../../../../interfaces/UserData.ts';
import { RegulacaoAprovadaData } from '../../../../interfaces/Regulacao.ts';
import { DadosPacienteData } from "../../../../interfaces/DadosPaciente.ts";

/*IMPORT COMPONENTS*/
import Modal from '../../../Modal/Modal.tsx';
import HeaderFiltroInterno from '../../../Header/Header_Lista_Interna';
import SetorOrigem from '../../../Setor Origem e Destino/SetorOrigem.tsx';
import SetorDestino from '../../../Setor Origem e Destino/SetorDestino.tsx';
import Transporte01 from '../../../Transporte/Transporte01.tsx';
import Transporte02 from '../../../Transporte/Transporte02.tsx';
import Desfecho from '../../../Desfecho/Desfecho.tsx';
import TabelaRegulacoesAprovadas from '../../Tabela de Regulacoes/TabelaRegulacoesAprovadas.tsx';

/*IMPORT FUNCTIONS*/
import { getUserData } from '../../../../functions/storageUtils.ts';

/*IMPORT UTILS*/
import { fetchPDF } from '../../../../Utils/fetchPDF.ts';

/*IMPORT VARIAVEIS DE AMBIENTE*/
const NODE_URL = import.meta.env.VITE_NODE_SERVER_URL;

interface Props {
  title: string;
}

const RegulacoesAprovadas: React.FC<Props> = ({ title }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [regulacoes, setRegulacoes] = useState<RegulacaoAprovadaData[]>([]); // Tipo do estado
  const [dadosPaciente, setDadosPaciente] = useState<DadosPacienteData | null>(null);
  const [currentRegulacao, setCurrentRegulacao] = useState<RegulacaoAprovadaData | null>(null);

  /*MODAL*/
  const [showModalOrigem, setShowModalOrigem] = useState(false);
  const [showModalDestino, setShowModalDestino] = useState(false);
  const [ShowModalTransporte01, setShowModalTransporte01] = useState(false);
  const [ShowModalTransporte02, setShowModalTransporte02] = useState(false);
  const [ShowModalDesfecho, setShowModalDesfecho] = useState(false);

  /*FILTROS*/
  const [unidadeOrigem, setUnidadeOrigem] = useState('');
  const [unidadeDestino, setUnidadeDestino] = useState('');
  const [filteredRegulacoes, setFilteredRegulacoes] = useState<RegulacaoAprovadaData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  /*ORDENAÇÃO*/
  const [sortConfig, setSortConfig] = useState<{ key: keyof RegulacaoAprovadaData; direction: "asc" | "desc" } | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<keyof RegulacaoAprovadaData | null>(null);

  /*PAGINAÇÃO*/
  const [currentPage, setCurrentPage] = useState(1);  // Página atual
  const [itemsPerPage] = useState(10);  // Número de itens por página
  const indexOfLastRegulacao = currentPage * itemsPerPage;
  const indexOfFirstRegulacao = indexOfLastRegulacao - itemsPerPage;
  const currentRegulacoes = filteredRegulacoes.slice(indexOfFirstRegulacao, indexOfLastRegulacao);
  const totalPages = Math.ceil(filteredRegulacoes.length / itemsPerPage);

  /*SNACKBAR*/
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>("success");

  // Defina fetchRegulacoes fora do useEffect
  const fetchRegulacoes = async () => {
    try {
      const response = await axios.get(`${NODE_URL}/api/internal/get/ListaRegulacoesAprovadas`);

      if (response.data && Array.isArray(response.data.data)) {
        setRegulacoes(response.data.data);
      } else {
        console.error('Dados inesperados:', response.data);
      }
    } catch (error: unknown) {
      console.error('Erro ao carregar regulações:', error);
      setRegulacoes([]); // Garante que regulacoes seja sempre um array
    }
  };

  // useEffect apenas para a chamada inicial
  useEffect(() => {
    fetchRegulacoes();
  }, []);

  //Pega dados do SeassonStorage User
  useEffect(() => {
    const data = getUserData();
    setUserData(data);
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

  //FUNÇÃO PARA BUSCAR O PDF
  const handleFetchPDF = (datetime: string, filename: string) => {
    fetchPDF(datetime, filename, showSnackbar);
  };

  //CONFIGURA A ORDENAÇÃO
  const handleSort = (key: keyof RegulacaoAprovadaData) => {
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

  //CONFIGURA A PAGINAÇÃO
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  /*MODAIS*/

  const handleOpenModalOrigem = (regulacao: RegulacaoAprovadaData) => {
    setCurrentRegulacao(regulacao);
    // Supondo que você já tenha todos os dados necessários na `regulacao` ou possa fazer algum processamento:
    const dados: DadosPacienteData = {
      nome_paciente: regulacao.nome_paciente,
      num_prontuario: regulacao.num_prontuario,
      num_regulacao: regulacao.num_regulacao,
      un_origem: regulacao.un_origem,
      un_destino: regulacao.un_destino,
      id_regulacao: regulacao.id_regulacao,
      nome_regulador_medico: regulacao.nome_regulador_medico, // Certifique-se de que este campo possui um valor válido
    };
    setDadosPaciente(dados);
    setShowModalOrigem(true);
  };

  const handleOpenModalDestino = (regulacao: RegulacaoAprovadaData) => {
    setCurrentRegulacao(regulacao);

    // Supondo que você já tenha todos os dados necessários na `regulacao` ou possa fazer algum processamento:
    const dados: DadosPacienteData = {
      nome_paciente: regulacao.nome_paciente,
      num_prontuario: regulacao.num_prontuario,
      num_regulacao: regulacao.num_regulacao,
      un_origem: regulacao.un_origem,
      un_destino: regulacao.un_destino,
      id_regulacao: regulacao.id_regulacao,
      nome_regulador_medico: regulacao.nome_regulador_medico, // Certifique-se de que este campo possui um valor válido
    };

    setDadosPaciente(dados);
    setShowModalDestino(true);
  };

  const handleOpenModalTransporte01 = (regulacao: RegulacaoAprovadaData) => {
    setCurrentRegulacao(regulacao);

    // Supondo que você já tenha todos os dados necessários na `regulacao` ou possa fazer algum processamento:
    const dados: DadosPacienteData = {
      nome_paciente: regulacao.nome_paciente,
      num_prontuario: regulacao.num_prontuario,
      num_regulacao: regulacao.num_regulacao,
      un_origem: regulacao.un_origem,
      un_destino: regulacao.un_destino,
      id_regulacao: regulacao.id_regulacao,
      nome_regulador_medico: regulacao.nome_regulador_medico, // Certifique-se de que este campo possui um valor válido
    };

    setDadosPaciente(dados);
    setShowModalTransporte01(true);
  };

  const handleOpenModalTransporte02 = (regulacao: RegulacaoAprovadaData) => {
    setCurrentRegulacao(regulacao);

    // Supondo que você já tenha todos os dados necessários na `regulacao` ou possa fazer algum processamento:
    const dados: DadosPacienteData = {
      nome_paciente: regulacao.nome_paciente,
      num_prontuario: regulacao.num_prontuario,
      num_regulacao: regulacao.num_regulacao,
      un_origem: regulacao.un_origem,
      un_destino: regulacao.un_destino,
      id_regulacao: regulacao.id_regulacao,
      nome_regulador_medico: regulacao.nome_regulador_medico, // Certifique-se de que este campo possui um valor válido
    };

    setDadosPaciente(dados);
    setShowModalTransporte02(true);
  };

  const handleOpenModalDesfecho = (regulacao: RegulacaoAprovadaData) => {
    setCurrentRegulacao(regulacao);

    // Supondo que você já tenha todos os dados necessários na `regulacao` ou possa fazer algum processamento:
    const dados: DadosPacienteData = {
      nome_paciente: regulacao.nome_paciente,
      num_prontuario: regulacao.num_prontuario,
      num_regulacao: regulacao.num_regulacao,
      un_origem: regulacao.un_origem,
      un_destino: regulacao.un_destino,
      id_regulacao: regulacao.id_regulacao,
      nome_regulador_medico: regulacao.nome_regulador_medico, // Certifique-se de que este campo possui um valor válido
    };

    setDadosPaciente(dados);
    setShowModalDesfecho(true);
  };

  const handleCloseModal = () => {
    setShowModalOrigem(false);
    setShowModalDestino(false);
    setShowModalTransporte01(false);
    setShowModalTransporte02(false);
    setShowModalDesfecho(false);
    fetchRegulacoes();
    //window.location.reload(); // Recarregar a página ao fechar o modal
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
          <TabelaRegulacoesAprovadas
            UserData={userData}
            currentRegulacoes={currentRegulacoes}
            selectedColumn={selectedColumn}
            sortConfig={sortConfig}
            handleSort={handleSort}
            fetchPDF={handleFetchPDF}
            handleOpenModalOrigem={handleOpenModalOrigem}
            handleOpenModalDestino={handleOpenModalDestino}
            handleOpenModalTransporte01={handleOpenModalTransporte01}
            handleOpenModalTransporte02={handleOpenModalTransporte02}
            handleOpenModalDesfecho={handleOpenModalDesfecho}
          />
          </div>
        </div>
        <div className="Pagination">
                <button className='button-pagination' onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Anterior</button>
                <span>{`Página ${currentPage} de ${totalPages}`}</span>
                <button className='button-pagination' onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>Próxima</button>
            </div>

      </div>

      {showModalOrigem && currentRegulacao && dadosPaciente && (
        <Modal show={showModalOrigem} onClose={handleCloseModal} title='Setor de Origem'>
          <SetorOrigem
            dadosPaciente={currentRegulacao}
            onClose={handleCloseModal} // Fecha o modal
            showSnackbar={showSnackbar} // Passa o controle do Snackbar
          />
        </Modal>
      )}

      {showModalDestino && currentRegulacao && dadosPaciente && (
        <Modal show={showModalDestino} onClose={handleCloseModal} title='Setor de Destino'>
          <SetorDestino
            dadosPaciente={currentRegulacao}
            onClose={handleCloseModal} // Fecha o modal
            showSnackbar={showSnackbar} // Passa o controle do Snackbar
          />
        </Modal>
      )}

      {ShowModalTransporte01 && currentRegulacao && dadosPaciente && (
        <Modal show={ShowModalTransporte01} onClose={handleCloseModal} title='Transporte'>
          <Transporte01
            dadosPaciente={currentRegulacao}
            onClose={handleCloseModal} // Fecha o modal
            showSnackbar={showSnackbar} // Passa o controle do Snackbar
          />
        </Modal>
      )}

      {ShowModalTransporte02 && currentRegulacao && dadosPaciente && (
        <Modal show={ShowModalTransporte02} onClose={handleCloseModal} title='Transporte'>
          <Transporte02
            dadosPaciente={currentRegulacao}
            onClose={handleCloseModal} // Fecha o modal
            showSnackbar={showSnackbar} // Passa o controle do Snackbar
          />
        </Modal>
      )}

      {ShowModalDesfecho && currentRegulacao && dadosPaciente && (
        <Modal show={ShowModalDesfecho} onClose={handleCloseModal} title='Desfecho'>
          <Desfecho
            dadosPaciente={currentRegulacao}
            forcado= {false}
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


export default RegulacoesAprovadas;