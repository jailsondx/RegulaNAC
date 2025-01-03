import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from '../Modal/Modal.tsx';
import NovaRegulacaoMedicoAprovada from './RegulacaoMedicaAprovada.tsx';
import { FcApproval, FcBadDecision } from "react-icons/fc";

import './RegulacaoMedica.css';

const NODE_URL = import.meta.env.VITE_NODE_SERVER_URL;

interface Regulacao {
    id_regulacao: number;
    num_prontuario: number | null;
    nome_paciente: string;
    num_idade: number | null;
    un_origem: string;
    un_destino: string;
    num_prioridade: number | null;
    data_hora_solicitacao_01: string;
    data_hora_solicitacao_02: string;
    nome_regulador_nac: string;
    num_regulacao: number | null;
    nome_regulador_medico: string;
    data_hora_acionamento_medico: string;
}

const RegulacaoMedica: React.FC = () => {
    const [regulacoes, setRegulacoes] = useState<Regulacao[]>([]);
    const [message, setMessage] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [showModal, setShowModal] = useState(false);
    const [currentRegulacao, setCurrentRegulacao] = useState<Regulacao | null>(null);

    useEffect(() => {
        const fetchRegulacoes = async () => {
            try {
                const response = await axios.get(`${NODE_URL}/api/internal/get/ListaRegulacoesPendentes`);
                
                if (response.data && Array.isArray(response.data.data)) {
                    setRegulacoes(response.data.data);
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

    const calcularTempoDeEspera = (dataHoraSolicitacao: string, dataHoraAtual: string) => {
        const dateSolicitacao = new Date(dataHoraSolicitacao); // Converte a string ISO para objeto Date
        const dateAtual = new Date(dataHoraAtual); // Converte a data e hora atual

        const diffInMilliseconds = dateAtual.getTime() - dateSolicitacao.getTime();
        const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60)); // Horas completas
        const diffInMinutes = Math.floor((diffInMilliseconds % (1000 * 60 * 60)) / (1000 * 60)); // Minutos restantes

        return `${diffInHours}h ${diffInMinutes}min`;
    };

    const obterDataHoraAtual = () => {
        const now = new Date();
        return now.toISOString(); // Retorna a data e hora atual no formato ISO
    };

    const handleOpenModal = (regulacao: Regulacao) => {
        setCurrentRegulacao(regulacao);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        window.location.reload(); // Recarregar a página ao fechar o modal
    };

    return (
        <>
           <div className='Header-ListaRegulaçoes'>
                <label className='Title-Tabela'>Regulações Pendentes</label>
                {message && <p className="message">{message}</p>}
                {error && <p className="error">{error}</p>}
            </div>

            <div>
                <table className='Table-Regulacoes'>
                    <thead>
                        <tr>
                            <th>Prontuário</th>
                            <th>Nome Paciente</th>
                            <th>Id</th>
                            <th>Regulação</th>
                            <th>Un. Origem</th>
                            <th>Un. Destino</th>
                            <th>Prio.</th>
                            <th>Data Solicitação</th>
                            <th>Tempo de Espera</th>
                            <th>Regulação Médica</th>
                        </tr>
                    </thead>
                    <tbody>
                        {regulacoes.map(regulacao => (
                            <tr key={regulacao.id_regulacao}>
                                <td>{regulacao.num_prontuario}</td>
                                <td>{regulacao.nome_paciente}</td>
                                <td>{regulacao.num_idade} Anos</td>
                                <td>{regulacao.num_regulacao}</td>
                                <td>{regulacao.un_origem}</td>
                                <td>{regulacao.un_destino}</td>
                                <td>{regulacao.num_prioridade}</td>
                                <td>{new Date(regulacao.data_hora_solicitacao_02).toLocaleString()}</td>
                                <td>{calcularTempoDeEspera(regulacao.data_hora_solicitacao_01, obterDataHoraAtual())}</td>
                                <td className='td-Icons'>
                                    <FcApproval className='Icons-Regulacao' onClick={() => handleOpenModal(regulacao)} />
                                    <FcBadDecision className='Icons-Regulacao' />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && currentRegulacao && (
                <Modal show={showModal} onClose={handleCloseModal} title='Regulação Médica'>
                    <NovaRegulacaoMedicoAprovada
                        id_regulacao={currentRegulacao.id_regulacao} 
                        nome_paciente={currentRegulacao.nome_paciente} 
                        num_regulacao={currentRegulacao.num_regulacao} 
                        un_origem={currentRegulacao.un_origem} 
                        un_destino={currentRegulacao.un_destino} 
                    />
                </Modal>
            )}
        </>
    );
};

export default RegulacaoMedica;
