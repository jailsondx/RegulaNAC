import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { formatDateToPtBr } from '../../functions/DateTimes';

const NODE_URL = import.meta.env.VITE_NODE_SERVER_URL;

// Interface para os dados de Regulacao
interface Regulacao {
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
    status_regulacao: string;
}

const AtualizaRegulacao: React.FC = () => {
  const location = useLocation();
  const [numProntuario, setNumProntuario] = useState<number | ''>('');
  const [dadosPront, setDadosPront] = useState<Regulacao | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { num_prontuario } = location.state || {};
    if (num_prontuario) {
      setNumProntuario(parseInt(num_prontuario, 10));
    }
  }, [location]);

  useEffect(() => {
    if (!numProntuario) return;

    const fetchProntuario = async () => {
      try {
        const response = await axios.get(`${NODE_URL}/api/internal/get/VerificaProntuario`, {
          params: { num_prontuario: numProntuario },
        });
        setDadosPront(response.data.data || null); // Armazena os dados no estado
        setError(null);
      } catch (error: any) {
        console.error('Erro ao carregar regulações:', error);
        setError('Erro ao carregar os dados do prontuário.');
      }
    };

    fetchProntuario();
  }, [numProntuario]);

  return (
    <div>
      <h1>Atualizar Regulação</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {dadosPront ? (
        <div>
          <p><strong>Prontuário:</strong> {dadosPront.num_prontuario}</p>
          <p><strong>Nome do Paciente:</strong> {dadosPront.nome_paciente}</p>
          <p><strong>Idade:</strong> {dadosPront.num_idade} Anos</p>
          <p><strong>Unidade Origem:</strong> {dadosPront.un_origem}</p>
          <p><strong>Unidade Destino:</strong> {dadosPront.un_destino}</p>
          <p><strong>Prioridade:</strong> {dadosPront.num_prioridade}</p>
          <p><strong>Data/Hora Solicitação 01:</strong> {formatDateToPtBr(dadosPront.data_hora_solicitacao_01)}</p>
          <p><strong>Solicitação Recente:</strong> {formatDateToPtBr(dadosPront.data_hora_solicitacao_02)}</p>
          <p><strong>Nome do Regulador:</strong> {dadosPront.nome_regulador_nac}</p>
          <p><strong>Número da Regulação:</strong> {dadosPront.num_regulacao}</p>
          <p><strong>Nome do Regulador Médico:</strong> {dadosPront.nome_regulador_medico}</p>
          <p><strong>Data/Hora de Acionamento Médico:</strong> {formatDateToPtBr(dadosPront.data_hora_acionamento_medico)}</p>
          <p><strong>Fase Regulação:</strong> {dadosPront.status_regulacao}</p>
        </div>
      ) : (
        !error && <p>Carregando dados do prontuário...</p>
      )}
    </div>
  );
};

export default AtualizaRegulacao;
