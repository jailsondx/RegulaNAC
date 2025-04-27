import React from 'react';
import { LuArrowDownWideNarrow, LuArrowUpNarrowWide } from "react-icons/lu";
import { FcFullTrash, FcInspection, FcExpired, FcApproval, FcBadDecision, FcNews } from "react-icons/fc";
import TimeTracker from "../../../TimeTracker/TimeTracker.tsx";
import { RegulacaoData, RegulacaoAprovadaData } from '../../../../interfaces/Regulacao.ts';
import { useNavigate } from 'react-router-dom';

/*IMPORT INTERFACE*/
import { UserData } from '../../../../interfaces/UserData.ts';

/*IMPORT FUNCTION*/
import { removerText } from "../../../../functions/RemoveText.ts";

interface TabelaRegulacoesProps {
  currentRegulacoes: RegulacaoData[];
  selectedColumn: keyof RegulacaoData | null;
  sortConfig: { key: keyof RegulacaoData; direction: "asc" | "desc" } | null;
  handleSort: (key: keyof RegulacaoData) => void;
  fetchPDF: (datetime: string, filename: string) => void;
  serverTime: string;
  handleAtualizarRegulacao?: (regulacao: RegulacaoData) => void;
  handleOpenModalApproved?: (regulacao: RegulacaoData) => void;
  handleOpenModalDeny?: (regulacao: RegulacaoData) => void;
  handleOpenModalDesfecho?: (regulacao: RegulacaoAprovadaData) => void;
  IconOpcoes: 'normais' | 'expiradas' | 'medico' | 'desfecho';
  UserData: UserData;
}

const TabelaRegulacoesInternas: React.FC<TabelaRegulacoesProps> = ({
  currentRegulacoes,
  selectedColumn,
  sortConfig,
  handleSort,
  fetchPDF,
  serverTime,
  handleAtualizarRegulacao,
  handleOpenModalApproved,
  handleOpenModalDeny,
  handleOpenModalDesfecho,
  IconOpcoes,
  UserData
}) => {
  const navigate = useNavigate();

  const handleEditarRegulacao = (id_regulacao: number): void => {
    if (!id_regulacao) {
      alert('Prontuário é obrigatório para atualizar a regulação');
      return;
    }
    // Enviando dados de forma oculta
    navigate('/EditaRegulacao', {
      state: { id_regulacao },
    });
  };

  return (
    <table className='Table-Regulacoes'>
      <thead>
        <tr>
          <th className={`col-NumProntuario clicked${selectedColumn === "num_prontuario" ? " selected" : ""}`} onClick={() => handleSort("num_prontuario")}>
            <span>
              <label>Pront.</label>
              <label>{sortConfig?.key === "num_prontuario" ? (sortConfig.direction === "asc" ? <LuArrowUpNarrowWide /> : <LuArrowDownWideNarrow />) : ""}</label>
            </span>
          </th>

          <th className={`col-NomePaciente clicked${selectedColumn === "nome_paciente" ? " selected" : ""}`} onClick={() => handleSort("nome_paciente")}>
            <span>
              <label>Nome Paciente</label>
              <label>{sortConfig?.key === "nome_paciente" ? (sortConfig.direction === "asc" ? <LuArrowUpNarrowWide /> : <LuArrowDownWideNarrow />) : ""}</label>
            </span>
          </th>

          <th className={`col-NumIdade clicked${selectedColumn === "num_idade" ? " selected" : ""}`} onClick={() => handleSort("num_idade")}>
            <span>
              <label>Id.</label>
              <label>{sortConfig?.key === "num_idade" ? (sortConfig.direction === "asc" ? <LuArrowUpNarrowWide /> : <LuArrowDownWideNarrow />) : ""}</label>
            </span>
          </th>

          <th className={`col-NumRegulacao clicked${selectedColumn === "num_regulacao" ? " selected" : ""}`} onClick={() => handleSort("num_regulacao")}>
            <span>
              <label>Num. Regulação</label>
              <label>{sortConfig?.key === "num_regulacao" ? (sortConfig.direction === "asc" ? <LuArrowUpNarrowWide /> : <LuArrowDownWideNarrow />) : ""}</label>
            </span>
          </th>

          <th className={`col-UnOrigem clicked${selectedColumn === "un_origem" ? " selected" : ""}`} onClick={() => handleSort("un_origem")}>
            <span>
              <label>Un. Origem</label>
              <label>{sortConfig?.key === "un_origem" ? (sortConfig.direction === "asc" ? <LuArrowUpNarrowWide /> : <LuArrowDownWideNarrow />) : ""}</label>
            </span>
          </th>

          <th className={`col-UnDestino clicked${selectedColumn === "un_destino" ? " selected" : ""}`} onClick={() => handleSort("un_destino")}>
            <span>
              <label>Un. Destino</label>
              <label>{sortConfig?.key === "un_destino" ? (sortConfig.direction === "asc" ? <LuArrowUpNarrowWide /> : <LuArrowDownWideNarrow />) : ""}</label>
            </span>
          </th>

          <th className={`col-Prioridade clicked${selectedColumn === "prioridade" ? " selected" : ""}`} onClick={() => handleSort("prioridade")}>
            <span>
              <label>Prio.</label>
              <label>{sortConfig?.key === "prioridade" ? (sortConfig.direction === "asc" ? <LuArrowUpNarrowWide /> : <LuArrowDownWideNarrow />) : ""}</label>
            </span>
          </th>

          <th className={`col-DataSolicitacao clicked${selectedColumn === "data_hora_solicitacao_02" ? " selected" : ""}`} onClick={() => handleSort("data_hora_solicitacao_02")}>
            <span>
              <label>Solicitação Recente</label>
              <label>{sortConfig?.key === "data_hora_solicitacao_02" ? (sortConfig.direction === "asc" ? <LuArrowUpNarrowWide /> : <LuArrowDownWideNarrow />) : ""}</label>
            </span>
          </th>

          <th className={`col-DataAcMedico clicked${selectedColumn === "data_hora_acionamento_medico" ? " selected" : ""}`} onClick={() => handleSort("data_hora_acionamento_medico")}>
            <span>
              <label>Acionamento Médico</label>
              <label>{sortConfig?.key === "data_hora_acionamento_medico" ? (sortConfig.direction === "asc" ? <LuArrowUpNarrowWide /> : <LuArrowDownWideNarrow />) : ""}</label>
            </span>
          </th>

          <th title='Tempo de Espera calculado com base no tempo do acionamento médico'>Tempo de Espera</th>

          {IconOpcoes === 'normais' && (
            <>
              <th>Editar</th>
            </>
          )}

          {IconOpcoes === 'desfecho' && (
            <>
              <th>Fase</th>
            </>
          )}
          
          {IconOpcoes === 'medico' && (
            <th>Aprovação</th>
          )}
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
            <td className='td-TempoEspera' title='Tempo de Espera calculado com base no tempo do acionamento médico'>
              <TimeTracker startTime={regulacao.data_hora_acionamento_medico} serverTime={serverTime} />
            </td>
            {IconOpcoes === 'desfecho' && (
              <>
                <td>{removerText(regulacao.status_regulacao)}</td>
              </>
            )}

            {IconOpcoes === 'normais' && UserData.tipo === 'GERENCIA' && (
              <>
                <td>
                  <label className="td-Icons">
                    <FcInspection 
                    className='Icon Icons-Regulacao' 
                    onClick={() => handleEditarRegulacao && handleEditarRegulacao(regulacao.id_regulacao)} 
                    title='Editar Regulação' />

                    <FcFullTrash 
                    className='Icon Icons-Regulacao' 
                    onClick={() => handleOpenModalDeny && handleOpenModalDeny(regulacao)} 
                    title='Apagar Regulação' />
                  </label>
                </td>
              </>
            )}

            {IconOpcoes === 'normais' && UserData.tipo === 'AUX. ADMINISTRATIVO' && (
              <>
                <td>
                  <label className="td-Icons">
                    <FcInspection 
                    className='Icon Icons-Regulacao' 
                    onClick={() => handleEditarRegulacao && handleEditarRegulacao(regulacao.id_regulacao)} 
                    title='Editar Regulação' />
                  </label>
                </td>
              </>
            )}

            {IconOpcoes === 'expiradas' && (
              <>
                <td>
                  <label className="td-Icons">
                    <FcExpired
                      className='Icon Icons-Regulacao'
                      onClick={() => handleAtualizarRegulacao && handleAtualizarRegulacao(regulacao)}
                      title='Atualizar/Renovar Regulação'
                    />
                  </label></td>
              </>

            )}
            {IconOpcoes === 'desfecho' && (
              <>
                <td>
                  <label className="td-Icons">
                    <FcNews
                      className="Icon Icons-Regulacao"
                      onClick={() => handleOpenModalDesfecho && handleOpenModalDesfecho(regulacao as RegulacaoAprovadaData)} 
                      title="Aprovar"
                    />
                  </label></td>
              </>
            )}

            {IconOpcoes === 'medico' && (
              <>
                <td>
                  <label className="td-Icons">
                    <FcApproval className="Icon Icons-Regulacao" onClick={() => handleOpenModalApproved && handleOpenModalApproved(regulacao)} title="Aprovar" />
                    <FcBadDecision className="Icon Icons-Regulacao" onClick={() => handleOpenModalDeny && handleOpenModalDeny(regulacao)} title="Negar" />
                  </label></td>
              </>
            )}
            
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TabelaRegulacoesInternas;