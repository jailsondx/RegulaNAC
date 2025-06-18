import React, { useEffect, useState } from 'react';
import { LuArrowDownWideNarrow, LuArrowUpNarrowWide } from "react-icons/lu";
import { FcFullTrash, FcInspection, FcApproval, FcBadDecision, FcNews } from "react-icons/fc";
import TimeTracker from "../../../TimeTracker/TimeTracker.tsx";
import { RegulacaoData } from '../../../../interfaces/Regulacao.ts';
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
  confirmarExclusao?: (id_user: number | null, id_regulacao: number | null, num_regulacao: number | null) => void;
  serverTime: string;
  handleAtualizarRegulacao?: (regulacao: RegulacaoData) => void;
  handleOpenModalApproved?: (regulacao: RegulacaoData) => void;
  handleOpenModalDeny?: (regulacao: RegulacaoData) => void;
  handleOpenModalDesfecho?: (regulacao: RegulacaoData) => void;
  IconOpcoes: 'normais' | 'expiradas' | 'medico' | 'desfecho';
  UserData: UserData;
  handleOpenModalObservacao?: (regulacao: RegulacaoData) => void;
}

const TabelaRegulacoesInternas: React.FC<TabelaRegulacoesProps> = ({
  currentRegulacoes,
  selectedColumn,
  sortConfig,
  handleSort,
  fetchPDF,
  confirmarExclusao,
  serverTime,
  handleAtualizarRegulacao,
  handleOpenModalApproved,
  handleOpenModalDeny,
  handleOpenModalDesfecho,
  IconOpcoes,
  UserData,
  handleOpenModalObservacao
}) => {
  const navigate = useNavigate();
  const [selectedUserViewer, setSelectedUserViewer] = useState<string>(''); // Novo estado para o tipo de usuário selecionado


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

  //Define a vizualização de usuário selecionado com base no sessionStorage
  useEffect(() => {
    setSelectedUserViewer(sessionStorage.getItem('userViewer') || 'null'); // Define o tipo de usuário selecionado inicialmente
  }, [UserData]);

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

          <th className={`col-DataSolicitacao clicked${selectedColumn === "data_hora_solicitacao_01" ? " selected" : ""}`} onClick={() => handleSort("data_hora_solicitacao_01")}>
            <span>
              <label>1ª Solicitação</label>
              <label>{sortConfig?.key === "data_hora_solicitacao_01" ? (sortConfig.direction === "asc" ? <LuArrowUpNarrowWide /> : <LuArrowDownWideNarrow />) : ""}</label>
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

          <th>
            Tempo de Espera da 1ª Sol.
          </th>

          <th>
            Tempo de Espera Ac. Med.
          </th>

          {IconOpcoes === 'normais' && (
            <>
              <th>Gerenciar</th>
            </>
          )}

          {IconOpcoes === 'expiradas' && (
            <>
              <th>Gerenciar</th>
            </>
          )}

          {IconOpcoes === 'desfecho' && (
            <>
              <th>Fase</th>
              <th>Desfecho</th>
            </>
          )}

          {IconOpcoes === 'medico' && (selectedUserViewer === 'MEDICO' || UserData.tipo === 'MEDICO') && (
            <th>Aprovação</th>
          )}

          <th>Obs.</th>


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
            <td>{new Date(regulacao.data_hora_solicitacao_01).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
            <td>{new Date(regulacao.data_hora_solicitacao_02).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
            <td>{new Date(regulacao.data_hora_acionamento_medico).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
            
            <td className='td-TempoEspera' title='Tempo de Espera calculado com base na 1ª solicitação'>
              <TimeTracker startTime={regulacao.data_hora_solicitacao_01} serverTime={serverTime} />
            </td>

            <td className='td-TempoEspera' title='Tempo de Espera calculado com base no tempo do acionamento médico'>
              <TimeTracker startTime={regulacao.data_hora_acionamento_medico} serverTime={serverTime} />
            </td>




            {IconOpcoes === 'desfecho' && (
              <>
                <td>{removerText(regulacao.status_regulacao)}</td>
              </>
            )}

            {IconOpcoes === 'normais' && (UserData.tipo === 'GERENCIA' || 'AUX. ADMINISTRATIVO') && (
              <>
                <td>
                  <label className="td-Icons">
                    <FcInspection
                      className='Icon Icons-Regulacao'
                      onClick={() => handleEditarRegulacao && handleEditarRegulacao(regulacao.id_regulacao)}
                      title='Editar Regulação' />

                    {regulacao.id_regulacao && selectedUserViewer === 'GERENCIA' && (
                      <FcFullTrash
                        className='Icon Icons-Regulacao'
                        onClick={() => confirmarExclusao && confirmarExclusao(UserData.id_user, regulacao.id_regulacao, regulacao.num_regulacao)}
                        title='Apagar Regulação' />
                    )}

                  </label>
                </td>
              </>
            )}

            {IconOpcoes === 'expiradas' && (
              <>
                <td>
                  <label className="td-Icons">
                    <img
                      src="/IconsTables/renew.png"
                      alt="Atualizar/Renovar Regulação"
                      className='Icon Icons-Regulacao Icon-Rotate'
                      title="Atualizar/Renovar Regulação"
                      onClick={() => handleAtualizarRegulacao && handleAtualizarRegulacao(regulacao)}
                    />
                  </label>
                </td>
              </>

            )}
            {IconOpcoes === 'desfecho' && (
              <>
                <td>
                  <label className="td-Icons">
                    <FcNews
                      className="Icon Icons-Regulacao"
                      onClick={() => handleOpenModalDesfecho && handleOpenModalDesfecho(regulacao as RegulacaoData)}
                      title="Aprovar"
                    />
                  </label></td>
              </>
            )}

            {IconOpcoes === 'medico' && (selectedUserViewer === 'MEDICO' || UserData.tipo === 'MEDICO') && (
              <>
                <td>
                  <label className="td-Icons">
                    <FcApproval
                      className="Icon Icons-Regulacao"
                      onClick={() => handleOpenModalApproved && handleOpenModalApproved(regulacao)}
                      title="Aprovar"
                    />
                    <FcBadDecision
                      className="Icon Icons-Regulacao"
                      onClick={() => handleOpenModalDeny && handleOpenModalDeny(regulacao)}
                      title="Negar"
                    />
                  </label></td>
              </>
            )}

            <td>
              {regulacao.num_regulacao && (
                <label
                  className='td-Icons'
                  onClick={() => handleOpenModalObservacao && handleOpenModalObservacao(regulacao)}
                  title={regulacao.observacaoTexto ? regulacao.observacaoTexto : 'Inserir Observação'}
                >
                  {regulacao.observacaoTexto
                    ? (
                      <span className="texto-resumo">
                        {regulacao.observacaoTexto.slice(0, 20)}...
                      </span>
                    )
                    : <img
                      src="/IconsTables/infor.png"
                      alt="Inserir Observação"
                      className='Icon Icons-Regulacao'
                      title="Inserir Observação"
                    />
                  }
                </label>
              )}
            </td>

          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TabelaRegulacoesInternas;

