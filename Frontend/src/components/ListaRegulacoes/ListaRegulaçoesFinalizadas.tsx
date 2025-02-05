import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AxiosError } from 'axios';
import { LuFilter } from "react-icons/lu";
import {  useLocation } from 'react-router-dom';
import { Snackbar, Alert } from '@mui/material';

/*IMPORT INTERFACES*/
import { RegulacaoData } from '../../interfaces/Regulacao';

/*IMPORT COMPONENTS*/
import Filtro from '../Filtro/Filtro';

/*IMPORT FUNCTIONS*/
import { getDay, getMonth, getYear } from '../../functions/DateTimes';

/*IMPORT CSS*/
import './ListaRegulacoes.css';

/*IMPORT JSON*/

/*IMPORT VARIAVEIS DE AMBIENTE*/
const NODE_URL = import.meta.env.VITE_NODE_SERVER_URL;


const ListaRegulacoes: React.FC = () => {
  const [regulacoes, setRegulacoes] = useState<RegulacaoData[]>([]); // Tipo do estado
  const location = useLocation();

  /*FILTROS*/
  const [unidadeOrigem, setUnidadeOrigem] = useState('');
  const [unidadeDestino, setUnidadeDestino] = useState('');
  const [filteredRegulacoes, setFilteredRegulacoes] = useState<RegulacaoData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false); // Controle da exibição dos filtros

  /*PAGINAÇÃO*/
  const [currentPage, setCurrentPage] = useState(1);  // Página atual
  const [itemsPerPage] = useState(10);  // Número de itens por página

  /*ORDENAÇÃO*/
  const [sortConfig, setSortConfig] = useState<{ key: keyof RegulacaoData; direction: "asc" | "desc" } | null>(null);

  /*SNACKBAR*/
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');

  //CHAMADA DE API PARA GERAR A LISTA DE REGULAÇÕES
  useEffect(() => {
    async function fetchRegulacoes() {
      try {
        const response = await axios.get(`${NODE_URL}/api/internal/get/ListaRegulacoesFinalizadas`);

        if (response.data && Array.isArray(response.data.data)) {
          setRegulacoes(response.data.data);
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
    }

    fetchRegulacoes();
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

  //CONFIGURA A PAGINAÇÃO
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const indexOfLastRegulacao = currentPage * itemsPerPage;
  const indexOfFirstRegulacao = indexOfLastRegulacao - itemsPerPage;
  const currentRegulacoes = filteredRegulacoes.slice(indexOfFirstRegulacao, indexOfLastRegulacao);

  const totalPages = Math.ceil(filteredRegulacoes.length / itemsPerPage);

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
  };

  const showSnackbar = (
    message: string,
    severity: 'success' | 'error' | 'info' | 'warning'
  ): void => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // Fecha o Snackbar
  const handleSnackbarClose = (): void => {
    setSnackbarOpen(false);
  };


  return (
    <>
      <div className='Component'>
        <div className='Component-Table'>

          <div className="Header-ListaRegulaçoes">
            <label className="Title-Tabela">
              Regulações Finalizadas<LuFilter className='Icon' onClick={() => setShowFilters(!showFilters)} title='Filtros' />
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
            <table className='Table-Regulacoes'>
              <thead>
                <tr>
                <th onClick={() => handleSort("nome_regulador_nac")}>
                    <span>
                      <label>Regulador</label> <label>{sortConfig?.key === "nome_regulador_nac" ? (sortConfig.direction === "asc" ? "🔼" : "🔽") : "↕"}</label>
                    </span>
                  </th>

                  <th onClick={() => handleSort("num_prontuario")}>
                    <span>
                      <label>Pront.</label> <label>{sortConfig?.key === "num_prontuario" ? (sortConfig.direction === "asc" ? "🔼" : "🔽") : "↕"}</label>
                    </span>
                  </th>

                  <th className="col-NomePaciente" onClick={() => handleSort("nome_paciente")}>
                    <span>
                      <label>Nome Paciente</label>
                      <label>{sortConfig?.key === "nome_paciente" ? (sortConfig.direction === "asc" ? "🔼" : "🔽") : "↕"}</label>
                    </span>
                  </th>

                  <th className="col-NumRegulacao" onClick={() => handleSort("num_regulacao")}>
                    Num. Regulação
                  </th>

                  <th onClick={() => handleSort("un_origem")}>
                    Un. Origem
                  </th>

                  <th onClick={() => handleSort("un_destino")}>
                    <span>
                      <label>Un. Destino</label>
                      <label>{sortConfig?.key === "un_destino" ? (sortConfig.direction === "asc" ? "🔼" : "🔽") : "↕"}</label>
                    </span>
                  </th>

                  <th onClick={() => handleSort("desfecho")}>
                    <span>
                      <label>Desfecho</label>
                      <label>{sortConfig?.key === "desfecho" ? (sortConfig.direction === "asc" ? "🔼" : "🔽") : "↕"}</label>
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentRegulacoes.map(regulacao => (
                  <tr key={regulacao.id_regulacao}>
                    <td>{regulacao.num_prontuario}</td>
                    <td className="col-NomePaciente">
                      <a onClick={() => fetchPDF(regulacao.data_hora_solicitacao_02, regulacao.link)}>
                        {regulacao.nome_paciente}
                      </a>
                    </td>
                    <td className="col-NumRegulacao">{regulacao.num_regulacao}</td>
                    <td>{regulacao.un_origem}</td>
                    <td>{regulacao.un_destino}</td>
                    <td className="col-Prioridade">{regulacao.prioridade}</td>
                    <td>{regulacao.desfecho}</td>
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


export default ListaRegulacoes;