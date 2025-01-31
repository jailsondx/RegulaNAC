import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LuFilter } from "react-icons/lu";
import { useNavigate, useLocation } from 'react-router-dom';
import { FcFullTrash, FcInspection } from "react-icons/fc";
import { Snackbar, Alert } from '@mui/material';

import { formatDateToPtBr, getDay, getMonth, getYear } from '../../functions/DateTimes.ts';

import TimeTracker from "../TimeTracker/TimeTracker.tsx";
import Filtro from '../Filtro/Filtro';
import './ListaRegulacoes.css';


const NODE_URL = import.meta.env.VITE_NODE_SERVER_URL;

interface Regulacao {
  id_regulacao: number;
  num_prontuario: number | null;
  nome_paciente: string;
  num_idade: number | null;
  un_origem: string;
  un_destino: string;
  prioridade: number | null;
  data_hora_solicitacao_01: string;
  data_hora_solicitacao_02: string;
  nome_regulador_nac: string;
  num_regulacao: number | null;
  nome_regulador_medico: string;
  data_hora_acionamento_medico: string;
  link: number | null;
}

const ListaRegulacoes: React.FC = () => {
  const [serverTime, setServerTime] = useState("");
  const [regulacoes, setRegulacoes] = useState<Regulacao[]>([]); // Tipo do estado
  const location = useLocation();
  const navigate = useNavigate();
  const [pdfUrl, setPdfUrl] = useState('');

  /*FILTROS*/
  const [unidadeOrigem, setUnidadeOrigem] = useState('');
  const [unidadeDestino, setUnidadeDestino] = useState('');
  const [filteredRegulacoes, setFilteredRegulacoes] = useState<Regulacao[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false); // Controle da exibição dos filtros

  /*PAGINAÇÃO*/
  const [currentPage, setCurrentPage] = useState(1);  // Página atual
  const [itemsPerPage] = useState(10);  // Número de itens por página

  /*ORDENAÇÃO*/
  const [sortConfig, setSortConfig] = useState<{ key: keyof Regulacao; direction: "asc" | "desc" } | null>(null);


  /*SNACKBAR*/
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' as 'success' | 'error' | 'info' | 'warning' });
  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

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
      } catch (error: any) {
        console.error('Erro ao carregar regulações:', error);
        setRegulacoes([]); // Garante que regulacoes seja sempre um array
      }
    };

    fetchRegulacoes();
  }, []);

  //SNACKBAR
  useEffect(() => {
    if (location.state?.snackbar) {
      setSnackbar(location.state.snackbar);
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


  const fetchPDF = async (datetime, filename) => {
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
    } catch (error:any) {
      // Verificar se o erro tem uma resposta do servidor
      if (error.response) {
        const { status, data } = error.response;
        
        // Exemplo de tratamento de diferentes códigos de status
        if (status === 400) {
          setSnackbar({
            open: true,
            message: data?.message || 'Parâmetros inválidos. Verifique os dados.',
            severity: 'error',
          });
        } else if (status === 404) {
          setSnackbar({
            open: true,
            message: data?.message || 'Arquivo PDF não encontrado.',
            severity: 'error',
          });
        } else if (status === 500) {
          setSnackbar({
            open: true,
            message: data?.message || 'Erro no servidor ao buscar o arquivo.',
            severity: 'error',
          });
        } else {
          // Caso um erro desconhecido ocorra
          setSnackbar({
            open: true,
            message: data?.message || 'Erro desconhecido. Tente novamente.',
            severity: 'error',
          });
        }
      } else {
        // Caso o erro não tenha uma resposta, por exemplo, se o servidor não estiver acessível
        setSnackbar({
          open: true,
          message: 'Erro na requisição. Tente novamente.',
          severity: 'error',
        });
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
const handleSort = (key: keyof Regulacao) => {
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

//CHAMA A ROTA DE NOVA REGULAÇÃO
const NovaRegulacao = () => {
  navigate('/NovaRegulacao');
}


return (
  <>
    <div className='Component'>
      <div className='Component-Table'>

        <div className="Header-ListaRegulaçoes">
          <label className="Title-Tabela">
            Lista de Regulações <LuFilter className='Icon' onClick={() => setShowFilters(!showFilters)} title='Filtros' />
          </label>
          <button type="button" onClick={NovaRegulacao}>+ Nova Regulação</button>
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

                <th className="col-NumIdade" onClick={() => handleSort("num_idade")}>
                  <span>
                    <label>Id.</label>
                    <label>{sortConfig?.key === "num_idade" ? (sortConfig.direction === "asc" ? "🔼" : "🔽") : "↕"}</label>
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

                <th className="col-Prioridade" onClick={() => handleSort("prioridade")}>
                  <span>
                    <label>Prio.</label>
                    <label>{sortConfig?.key === "prioridade" ? (sortConfig.direction === "asc" ? "🔼" : "🔽") : "↕"}</label>
                  </span>
                </th>

                <th onClick={() => handleSort("data_hora_solicitacao_02")}>
                  <span>
                    <label>Solicitação Recente</label>
                    <label>{sortConfig?.key === "data_hora_solicitacao_02" ? (sortConfig.direction === "asc" ? "🔼" : "🔽") : "↕"}</label>
                  </span>
                </th>

                <th onClick={() => handleSort("data_hora_acionamento_medico")}>
                  <span>
                    <label>Acionamento Médico</label>
                    <label>{sortConfig?.key === "data_hora_acionamento_medico" ? (sortConfig.direction === "asc" ? "🔼" : "🔽") : "↕"}</label>
                  </span>
                </th>

                <th>Tempo de Espera</th>
                <th></th>
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
                  <td className="col-NumIdade">{regulacao.num_idade} Anos</td>
                  <td className="col-NumRegulacao">{regulacao.num_regulacao}</td>
                  <td>{regulacao.un_origem}</td>
                  <td>{regulacao.un_destino}</td>
                  <td className="col-Prioridade">{regulacao.prioridade}</td>
                  <td>{new Date(regulacao.data_hora_solicitacao_02).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                  <td>{new Date(regulacao.data_hora_acionamento_medico).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                  <td className='td-TempoEspera'><TimeTracker startTime={regulacao.data_hora_solicitacao_02} serverTime={serverTime} /></td>
                  <td className='td-Icons'>
                    <FcInspection className='Icon Icons-Regulacao' />
                    <FcFullTrash className='Icon Icons-Regulacao' />
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


    <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
      <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
        {snackbar.message}
      </Alert>
    </Snackbar>
  </>
);
};


export default ListaRegulacoes;