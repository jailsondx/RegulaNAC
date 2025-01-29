import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Snackbar, Alert, Button, Input } from '@mui/material';
import TimeTracker from "../TimeTracker/TimeTracker.tsx";
import { removerText } from "../../functions/RemoveText.ts";

import './Desfecho.css';

const NODE_URL = import.meta.env.VITE_NODE_SERVER_URL;

interface Regulacao {
    id_regulacao: number;
    num_prontuario: number | null;
    nome_paciente: string;
    num_regulacao: number | null;
    un_origem: string;
    un_destino: string;
    nome_regulador_nac: string;
    data_hora_solicitacao_02: string;
    status_regulacao: string;
}

interface SearchForm {
    nomePaciente: string;
    numProntuario: string;
    numRegulacao: string;
    statusRegulacao: string;
}

// Definindo o valor inicial com base na interface SearchForm
const initialForm: SearchForm = {
    nomePaciente: "",
    numProntuario: "",
    numRegulacao: "",
    statusRegulacao: "",
  };
  

const Desfecho: React.FC = () => {
    const [regulacoes, setRegulacoes] = useState<Regulacao[]>([]);
    const [filteredRegulacoes, setFilteredRegulacoes] = useState<Regulacao[]>([]);
    const [serverTime, setServerTime] = useState("");
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' as 'success' | 'error' | 'info' | 'warning' });

    const [formData, setFormData] = useState<SearchForm>(initialForm);

    /*PAGINAÇÃO*/
    const [currentPage, setCurrentPage] = useState(1);  // Página atual
    const [itemsPerPage] = useState(5);  // Número de itens por página

    const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

    // Função para lidar com alterações no formulário
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    // Função para enviar a requisição de pesquisa
    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const params = new URLSearchParams();

            // Adicionar parâmetros de filtro se existirem
            if (formData.nomePaciente) params.append('nomePaciente', formData.nomePaciente);
            if (formData.numProntuario) params.append('numProntuario', formData.numProntuario);
            if (formData.numRegulacao) params.append('numRegulacao', formData.numRegulacao);
            if (formData.statusRegulacao) params.append('statusRegulacao', formData.statusRegulacao); // Adiciona o status

            const response = await axios.get(`${NODE_URL}/api/internal/get/PesquisaPaciente`, { params });

            if (response.data && Array.isArray(response.data.data)) {
                setRegulacoes(response.data.data);
                setFilteredRegulacoes(response.data.data);
                setServerTime(response.data.serverTime);
            } else {
                console.error('Dados inesperados:', response.data);
            }
        } catch (error) {
            console.error('Erro ao carregar regulações:', error);
            setRegulacoes([]);
        }
    };

    // Função para limpar os filtros
    const filterClear = async (e: React.FormEvent) => {
        e.preventDefault(); // Evitar o comportamento padrão do evento (caso seja um formulário)

        setFormData(initialForm); // Limpa os filtros, atribuindo o estado inicial
    };


    //CONFIGURA A PAGINAÇÃO
    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
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
                            <div className="search-desfecho-line">
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
                                    <option value="">Selecione o Status</option>
                                    <option value="ABERTO - NOVO">ABERTO - NOVO</option>
                                    <option value="ABERTO - NEGADO">ABERTO - NEGADO</option>
                                    <option value="ABERTO - APROVADO - AGUARDANDO ORIGEM">ABERTO - APROVADO - AGUARDANDO ORIGEM</option>
                                    <option value="ABERTO - APROVADO - AGUARDANDO DESTINO">ABERTO - APROVADO - AGUARDANDO DESTINO</option>
                                    <option value="ABERTO - APROVADO - AGUARDANDO TRANSPORTE">ABERTO - APROVADO - AGUARDANDO TRANSPORTE</option>
                                    <option value="ABERTO - APROVADO - AGUARDANDO DESFECHO">ABERTO - APROVADO - AGUARDANDO DESFECHO</option>
                                </select>
                            </div>

                            {/* Terceira linha: Botão de Pesquisar */}
                            <div className="search-desfecho-line-button">
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
                                        <td><button className='button-red'>Forçar Desfecho</button></td>
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


            {/* Snackbar de resposta */}
            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
                <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default Desfecho;
