import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Snackbar, Alert } from "@mui/material";
import { LuFilter } from "react-icons/lu";
import { FcHome, FcOrganization, FcOnlineSupport, FcOvertime, FcAbout } from "react-icons/fc";

/*IMPORT INTERFACES*/
import { UserData } from '../../interfaces/UserData';
import { RegulacaoAprovadaData } from '../../interfaces/Regulacao';
import { DadosPacienteData } from "../../interfaces/DadosPaciente.ts";

/*IMPORT COMPONENTS*/
import Modal from '../Modal/Modal';
import SetorOrigem from '../Setor Origem e Destino/SetorOrigem';
import SetorDestino from '../Setor Origem e Destino/SetorDestino';
import Transporte01 from '../Transporte/Transporte01';
import Transporte02 from '../Transporte/Transporte02';
import Filtro from '../Filtro/Filtro';

/*IMPORT FUNCTIONS*/
import { formatDateTimeToPtBr } from '../../functions/DateTimes';
import { getUserData } from '../../functions/storageUtils';
import { removerText } from "../../functions/RemoveText.ts";

/*IMPORT VARIAVEIS DE AMBIENTE*/
const NODE_URL = import.meta.env.VITE_NODE_SERVER_URL;

const RegulacoesAprovadas: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [regulacoes, setRegulacoes] = useState<RegulacaoAprovadaData[]>([]); // Tipo do estado
  const [dadosPaciente, setDadosPaciente] = useState<DadosPacienteData | null>(null);
  const [currentRegulacao, setCurrentRegulacao] = useState<RegulacaoAprovadaData | null>(null);

  /*MODAL*/
  const [showModalOrigem, setShowModalOrigem] = useState(false);
  const [showModalDestino, setShowModalDestino] = useState(false);
  const [ShowModalTransporte01, setShowModalTransporte01] = useState(false);
  const [ShowModalTransporte02, setShowModalTransporte02] = useState(false);

  /*FILTROS*/
  const [unidadeOrigem, setUnidadeOrigem] = useState('');
  const [unidadeDestino, setUnidadeDestino] = useState('');
  const [filteredRegulacoes, setFilteredRegulacoes] = useState<RegulacaoAprovadaData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false); // Controle da exibição dos filtros

  /*ORDENAÇÃO*/
  const [sortConfig, setSortConfig] = useState<{ key: keyof RegulacaoAprovadaData; direction: "asc" | "desc" } | null>(null);

  /*PAGINAÇÃO*/
  const [currentPage, setCurrentPage] = useState(1);  // Página atual
  const [itemsPerPage] = useState(10);  // Número de itens por página

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
        console.log(response.data);
      } else {
        console.error('Dados inesperados:', response.data);
      }
    } catch (error: any) {
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
  };

  //CONFIGURA A PAGINAÇÃO
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const indexOfLastRegulacao = currentPage * itemsPerPage;
  const indexOfFirstRegulacao = indexOfLastRegulacao - itemsPerPage;
  const currentRegulacoes = filteredRegulacoes.slice(indexOfFirstRegulacao, indexOfLastRegulacao);

  const totalPages = Math.ceil(filteredRegulacoes.length / itemsPerPage);

  /*MODAIS*/

  const handleOpenModalOrigem = (regulacao: RegulacaoAprovadaData) => {
    setCurrentRegulacao(regulacao);
    // Supondo que você já tenha todos os dados necessários na `regulacao` ou possa fazer algum processamento:
    const dados: DadosPacienteData = {
      nome_paciente: regulacao.nome_paciente,
      num_regulacao: regulacao.num_regulacao,
      un_origem: regulacao.un_origem,
      un_destino: regulacao.un_destino,
      num_leito: regulacao.num_leito,
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
      num_regulacao: regulacao.num_regulacao,
      un_origem: regulacao.un_origem,
      un_destino: regulacao.un_destino,
      num_leito: regulacao.num_leito,
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
      num_regulacao: regulacao.num_regulacao,
      un_origem: regulacao.un_origem,
      un_destino: regulacao.un_destino,
      id_regulacao: regulacao.id_regulacao,
      nome_regulador_medico: regulacao.nome_regulador_medico, // Certifique-se de que este campo possui um valor válido
    };

    setDadosPaciente(dados);
    setShowModalTransporte02(true);
  };

  const handleCloseModal = () => {
    setShowModalOrigem(false);
    setShowModalDestino(false);
    setShowModalTransporte01(false);
    setShowModalTransporte02(false);
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
          <div className='Header-ListaRegulaçoes'>
            <label className='Title-Tabela'>
              Regulações Aprovadas <LuFilter className='Icon' onClick={() => setShowFilters(!showFilters)} title='Filtros' />
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

                  <th>Nº Leito</th>
                  <th>Médico Regulador</th>
                  <th onClick={() => handleSort("data_hora_regulacao_medico")}>
                    <span>
                      <label>Data da Autorização</label>
                      <label>{sortConfig?.key === "data_hora_regulacao_medico" ? (sortConfig.direction === "asc" ? "🔼" : "🔽") : "↕"}</label>
                    </span>
                  </th>
                  <th>Fase</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {currentRegulacoes.map(regulacao => (
                  <tr key={regulacao.id_regulacao}>
                    <td>{regulacao.num_prontuario}</td>
                    <td className="td-NomePaciente">{regulacao.nome_paciente}</td>
                    <td>{regulacao.num_regulacao}</td>
                    <td>{regulacao.un_origem}</td>
                    <td>{regulacao.un_destino}</td>
                    <td>{regulacao.num_leito}</td>
                    <td>{regulacao.nome_regulador_medico}</td>
                    <td>{formatDateTimeToPtBr(regulacao.data_hora_regulacao_medico)}</td>
                    <td>{removerText(regulacao.status_regulacao)}</td>

                    {userData?.tipo !== "MEDICO" && (
                      <td className="td-Icons">
                        {regulacao.status_regulacao === "ABERTO - APROVADO - AGUARDANDO ORIGEM" && (
                          <FcHome
                            className="Icon Icons-Regulacao"
                            onClick={() => handleOpenModalOrigem(regulacao)}
                            title='Acionamento do Setor de Origem'
                          />
                        )}
                        {regulacao.status_regulacao === "ABERTO - APROVADO - AGUARDANDO DESTINO" && (
                          <FcOrganization
                            className="Icon Icons-Regulacao"
                            onClick={() => handleOpenModalDestino(regulacao)}
                            title='Acionamento do Setor de Destino'
                          />
                        )}
                        {regulacao.status_regulacao === "ABERTO - APROVADO - AGUARDANDO ACIONAMENTO TRANSPORTE" && (
                          <FcOnlineSupport
                            className="Icon Icons-Regulacao"
                            onClick={() => handleOpenModalTransporte01(regulacao)}
                            title='Acionamento do Transporte'
                          />
                        )}
                        {regulacao.status_regulacao === "ABERTO - APROVADO - AGUARDANDO FINALIZACAO TRANSPORTE" && (
                          <FcOvertime
                            className="Icon Icons-Regulacao"
                            onClick={() => handleOpenModalTransporte02(regulacao)}
                            title='Finalização do Transporte'
                          />
                        )}
                        {regulacao.status_regulacao === "ABERTO - APROVADO - AGUARDANDO DESFECHO" && (
                          <FcAbout
                            className="Icon Icons-Regulacao"
                            onClick={() => handleOpenModalTransporte02(regulacao)}
                            title='Finalização do Transporte'
                          />
                        )}

                      </td>
                    )}
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