import React, { useEffect, useState } from 'react';
import { LuArrowDownWideNarrow, LuArrowUpNarrowWide } from "react-icons/lu";
import { FcFullTrash } from "react-icons/fc";
import { RegulacaoData } from '../../../../interfaces/Regulacao';
import { formatDateTimeToPtBr } from '../../../../functions/DateTimes';

/*INTERFACES*/
import { UserData } from '../../../../interfaces/UserData';


interface TabelaRegulacoesProps {
  UserData: UserData;
  currentRegulacoes: RegulacaoData[];
  selectedColumn: keyof RegulacaoData | null;
  sortConfig: { key: keyof RegulacaoData; direction: "asc" | "desc" } | null;
  handleSort: (key: keyof RegulacaoData) => void;
  fetchPDF: (datetime: string, filename: string) => void;
  confirmarExclusao?: (id_user: number | null, id_regulacao: number | null) => void;
  handleAtualizarRegulacao?: (regulacao: RegulacaoData) => void;
  handleOpenModalObservacao: (regulacao: RegulacaoData) => void;
}

const TabelaRegulacoesNegadas: React.FC<TabelaRegulacoesProps> = ({
  currentRegulacoes,
  selectedColumn,
  sortConfig,
  handleSort,
  fetchPDF,
  confirmarExclusao,
  handleAtualizarRegulacao,
  UserData,
  handleOpenModalObservacao
}) => {
  const [selectedUserViewer, setSelectedUserViewer] = useState<string>(''); // Novo estado para o tipo de usuário selecionado

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

          <th className={`col-NomeRegMedico clicked${selectedColumn === "nome_regulador_medico" ? " selected" : ""}`} onClick={() => handleSort("nome_regulador_medico")}>
            <span>
              <label>Médico Regulador</label>
              <label>{sortConfig?.key === "nome_regulador_medico" ? (sortConfig.direction === "asc" ? <LuArrowUpNarrowWide /> : <LuArrowDownWideNarrow />) : ""}</label>
            </span>
          </th>

          <th className={`col-Desfecho clicked${selectedColumn === "data_hora_solicitacao_02" ? " selected" : ""}`} onClick={() => handleSort("data_hora_solicitacao_02")}>
            <span>
              <label>Data Solicitação</label>
              <label>{sortConfig?.key === "data_hora_solicitacao_02" ? (sortConfig.direction === "asc" ? <LuArrowUpNarrowWide /> : <LuArrowDownWideNarrow />) : ""}</label>
            </span>
          </th>

          <th className={`col-Text clicked${selectedColumn === "justificativa_neg" ? " selected" : ""}`} onClick={() => handleSort("justificativa_neg")}>
            <span>
              <label>Just.</label>
              <label>{sortConfig?.key === "justificativa_neg" ? (sortConfig.direction === "asc" ? <LuArrowUpNarrowWide /> : <LuArrowDownWideNarrow />) : ""}</label>
            </span>
          </th>

          {(UserData.tipo !== 'MEDICO' && selectedUserViewer !== 'MEDICO') && (
            <th>Gerenciar</th>
          )}

          <th>Obs.</th>

        </tr>
      </thead>
      <tbody>
        {currentRegulacoes.map(regulacao => (
          <tr key={regulacao.id_regulacao}>
            <td>{regulacao.num_prontuario}</td>
            <td>
              <a onClick={() => fetchPDF(regulacao.data_hora_solicitacao_02, regulacao.link)}>
                {regulacao.nome_paciente}
              </a>
            </td>
            <td>{regulacao.num_regulacao}</td>
            <td>{regulacao.un_origem}</td>
            <td>{regulacao.un_destino}</td>
            <td>{regulacao.nome_regulador_medico}</td>
            <td>{formatDateTimeToPtBr(regulacao.data_hora_solicitacao_02)}</td>
            <td className='col-Text'>{regulacao.justificativa_neg}</td>

            {(UserData.tipo !== 'MEDICO' && selectedUserViewer !== 'MEDICO') && (
              <td>
                <label className="td-Icons">
                  <img
                    src="/IconsTables/renew.png"
                    alt="Atualizar/Renovar Regulação"
                    className='Icon Icons-Regulacao Icon-Rotate'
                    title="Atualizar/Renovar Regulação"
                    onClick={() => handleAtualizarRegulacao && handleAtualizarRegulacao(regulacao)}
                  />

                  {UserData.tipo === 'GERENCIA' && selectedUserViewer === 'GERENCIA' && (
                    <FcFullTrash
                      className='Icon Icons-Regulacao'
                      onClick={() => confirmarExclusao && confirmarExclusao(UserData.id_user, regulacao.id_regulacao)}
                      title='Apagar Regulação' />
                  )}

                </label>
              </td>
            )}

            <td>
              {regulacao.num_regulacao && (
                <label
                  className='td-Icons'
                  onClick={() => handleOpenModalObservacao(regulacao)}
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
                      alt="Observação não inserida"
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

export default TabelaRegulacoesNegadas;