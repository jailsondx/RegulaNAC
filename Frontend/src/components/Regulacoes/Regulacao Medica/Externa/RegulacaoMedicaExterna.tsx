import React, { useState, useEffect } from "react";
import axios from "axios";
import { AxiosError } from 'axios';
import { Snackbar, Alert } from "@mui/material";

/*IMPORT INTERFACES*/
import { UserData } from '../../../../interfaces/UserData';
import { RegulacaoExternaData } from '../../../../interfaces/RegulacaoExtena.ts';
import { DadosPacienteExternoData } from "../../../../interfaces/DadosPaciente.ts";

/*IMPORT COMPONENTS*/
import HeaderFiltroExterno from "../../../Header/Header_Lista_Externa.tsx";
import NovaRegulacaoMedicoAprovada_Externa from "./RegulacaoMedicaAprovada_Externa.tsx";
import NovaRegulacaoMedicoNegada_Externa from "./RegulacaoMedicaNegada_Externa.tsx";
import TabelaRegulacoesExternas from '../../Tabela de Regulacoes/Externas/TabelaRegulacoesExternas.tsx';
import Modal from "../../../Modal/Modal.tsx";

/*IMPORT FUNCTIONS*/
import { getUserData } from '../../../../functions/storageUtils';
import { getDay, getMonth, getYear } from '../../../../functions/DateTimes.ts';

/*IMPORT UTILS*/

/*IMPORT CSS*/
import "../RegulacaoMedica.css";

/*IMPORT VARIAVEIS DE AMBIENTE*/
const NODE_URL = import.meta.env.VITE_NODE_SERVER_URL;

interface Props {
  title: string;
}

const RegulacaoMedicaExterna: React.FC<Props> = ({ title }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [serverTime, setServerTime] = useState("");
  const [regulacoes, setRegulacoes] = useState<RegulacaoExternaData[]>([]);
  const [showModalApproved, setShowModalApproved] = useState(false);
  const [showModalDeny, setShowModalDeny] = useState(false);
  const [currentRegulacao, setCurrentRegulacao] = useState<RegulacaoExternaData | null>(null);
  const [dadosPaciente, setDadosPaciente] = useState<DadosPacienteExternoData | null>(null);
  const [elapsedTime] = useState<string>(''); // Armazena o tempo decorrido

  /*FILTROS*/
  const [filteredRegulacoes, setFilteredRegulacoes] = useState<RegulacaoExternaData[]>([]);
  const [unidadeOrigem, setUnidadeOrigem] = useState('');
  const [vinculo, setVinculo] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  /*PAGINAÇÃO*/
  const [currentPage, setCurrentPage] = useState(1);  // Página atual
  const [itemsPerPage] = useState(10);  // Número de itens por página
  const indexOfLastRegulacao = currentPage * itemsPerPage;
  const indexOfFirstRegulacao = indexOfLastRegulacao - itemsPerPage;
  const currentRegulacoes = filteredRegulacoes.slice(indexOfFirstRegulacao, indexOfLastRegulacao);
  const totalPages = Math.ceil(filteredRegulacoes.length / itemsPerPage);

  /*ORDENAÇÃO*/
  const [sortConfig, setSortConfig] = useState<{ key: keyof RegulacaoExternaData; direction: "asc" | "desc" } | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<keyof RegulacaoExternaData | null>(null);

  /*SNACKBAR*/
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');


  //Pega dados do SeassonStorage User
  useEffect(() => {
    const data = getUserData();
    setUserData(data);
  }, []);

  // Defina fetchRegulacoes fora do useEffect
  const fetchRegulacoes = async () => {
    try {
      const response = await axios.get(`${NODE_URL}/api/internal/get/Externa/ListaRegulacoesPendentes`);

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

    if (vinculo) {
      filtered = filtered.filter((r) => r.vinculo === vinculo);
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
  }, [unidadeOrigem, vinculo, searchTerm, regulacoes]);

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

  //MODAL
  const handleOpenModalApproved = (regulacao: RegulacaoExternaData) => {
    setCurrentRegulacao(regulacao);

    // Supondo que você já tenha todos os dados necessários na `regulacao` ou possa fazer algum processamento:
    const dados: DadosPacienteExternoData = {
      nome_paciente: regulacao.nome_paciente,
      num_prontuario: regulacao.num_prontuario,
      num_regulacao: regulacao.num_regulacao,
      un_origem: regulacao.un_origem,
      vinculo: regulacao.vinculo,
      id_regulacao: regulacao.id_regulacao,
      nome_regulador_medico: regulacao.nome_regulador_medico, // Certifique-se de que este campo possui um valor válido
    };

    setDadosPaciente(dados); // Ensure the type matches DadosPacienteExternoData
    setShowModalApproved(true);
  };

  const handleOpenModalDeny = (regulacao: RegulacaoExternaData) => {
    setCurrentRegulacao(regulacao);

    // Supondo que você já tenha todos os dados necessários na `regulacao` ou possa fazer algum processamento:
    const dados: DadosPacienteExternoData = {
      nome_paciente: regulacao.nome_paciente,
      num_prontuario: regulacao.num_prontuario,
      num_regulacao: regulacao.num_regulacao,
      un_origem: regulacao.un_origem,
      vinculo: regulacao.vinculo,
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

  //CONFIGURA A ORDENAÇÃO
  const handleSort = (key: keyof RegulacaoExternaData) => {
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

  //SNACKBAR
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

  return (
    <>
      <div className='Component'>
        <div className='Component-Table'>
          <HeaderFiltroExterno
            title={title}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            vinculo={vinculo}
            setVinculo={setVinculo}
            unidadeOrigem={unidadeOrigem}
            setUnidadeOrigem={setUnidadeOrigem}
            regulacoes={regulacoes}
          />

          <div>
            {userData && (
              <TabelaRegulacoesExternas
                currentRegulacoes={currentRegulacoes}
                selectedColumn={selectedColumn}
                sortConfig={sortConfig}
                handleSort={handleSort}
                fetchPDF={fetchPDF}
                serverTime={serverTime}
                handleOpenModalApproved={handleOpenModalApproved}
                handleOpenModalDeny={handleOpenModalDeny}
                IconOpcoes="medico"
                UserData={userData}
              />
            )}
          </div>

          {showModalApproved && currentRegulacao && dadosPaciente && (
            <Modal
              show={showModalApproved}
              onClose={handleCloseModal}
              title="Regulação Médica: Aprovação"
            >
              <NovaRegulacaoMedicoAprovada_Externa
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
              <NovaRegulacaoMedicoNegada_Externa
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

export default RegulacaoMedicaExterna;
