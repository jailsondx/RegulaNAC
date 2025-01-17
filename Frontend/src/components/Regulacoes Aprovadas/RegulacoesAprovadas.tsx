import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from '../Modal/Modal.tsx';
import { useNavigate } from 'react-router-dom';
import { FcHome, FcGlobe, FcInTransit } from "react-icons/fc";
import { formatDateToPtBr } from '../../functions/DateTimes';
import SetorOrigem from '../Setor Origem e Destino/SetorOrigem.tsx';

import './Regulacoes.css'

const NODE_URL = import.meta.env.VITE_NODE_SERVER_URL;

interface Regulacao {
  id_regulacao: number;
  num_prontuario: number | null;
  nome_paciente: string;
  un_origem: string;
  un_destino: string;
  num_regulacao: number | null;
  nome_regulador_medico: string;
  data_hora_regulacao_medico: string;
}

const RegulacoesAprovadas: React.FC = () => {
  const [regulacoes, setRegulacoes] = useState<Regulacao[]>([]); // Tipo do estado
  const [showModalOrigem, setShowModalOrigem] = useState(false);
  const [showModalDeny, setShowModalDeny] = useState(false);
  const [currentRegulacao, setCurrentRegulacao] = useState<Regulacao | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRegulacoes = async () => {
      try {
        const response = await axios.get(`${NODE_URL}/api/internal/get/ListaRegulacoesAprovadas`);

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
    const dateSolicitacao = new Date(dataHoraSolicitacao);
    const dateAtual = new Date(dataHoraAtual);

    const diffInMilliseconds = dateAtual.getTime() - dateSolicitacao.getTime();

    const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60)); // Horas completas
    const diffInMinutes = Math.floor((diffInMilliseconds % (1000 * 60 * 60)) / (1000 * 60)); // Minutos restantes

    return `${diffInHours}h ${diffInMinutes}min`;
  };


  const obterDataHoraAtual = () => {
    const now = new Date();
    return now.toISOString(); // Retorna a data e hora atual no formato ISO (por exemplo: "2024-12-30T16:00:00Z")
  };


  /*MODAIS*/

  const handleOpenModalOrigem = (regulacao: Regulacao) => {
    setCurrentRegulacao(regulacao);
    setShowModalOrigem(true);
  };

  const handleCloseModal = () => {
    setShowModalOrigem(false);
    //window.location.reload(); // Recarregar a página ao fechar o modal
  };


  return (
    <>
      <div className='Header-ListaRegulaçoes'>
        <label className='Title-Tabela'>Regulações Aprovadas</label>
      </div>

      <div>
        <table className='Table-Regulacoes'>
          <thead>
            <tr>
              <th>Pront.</th>
              <th>Nome Paciente</th>
              <th>Num. Regulação</th>
              <th>Un. Origem</th>
              <th>Un. Destino</th>
              <th>Médico Regulador</th>
              <th>Data/Hora da Autorização</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {regulacoes.map(regulacao => (
              <tr key={regulacao.id_regulacao}>
                <td>{regulacao.num_prontuario}</td>
                <td>{regulacao.nome_paciente}</td>
                <td>{regulacao.num_regulacao}</td>
                <td>{regulacao.un_origem}</td>
                <td>{regulacao.un_destino}</td>
                <td>{regulacao.nome_regulador_medico}</td>
                <td>{formatDateToPtBr(regulacao.data_hora_regulacao_medico)}</td>
                <td className='td-Icons'>
                  <FcHome className='Icons-Regulacao' onClick={() => handleOpenModalOrigem(regulacao)} />
                  <FcGlobe className='Icons-Regulacao' />
                  <FcInTransit className='Icons-Regulacao' />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModalOrigem && currentRegulacao && (
        <Modal show={showModalOrigem} onClose={handleCloseModal} title='Setor de Origem'>
          <SetorOrigem
            id_regulacao={currentRegulacao.id_regulacao}
            nome_paciente={currentRegulacao.nome_paciente}
            num_regulacao={currentRegulacao.num_regulacao}
            un_origem={currentRegulacao.un_origem}
            un_destino={currentRegulacao.un_destino}
            nome_regulador_medico={currentRegulacao.nome_regulador_medico}
          />
        </Modal>
      )}

    </>

  );
};


export default RegulacoesAprovadas;