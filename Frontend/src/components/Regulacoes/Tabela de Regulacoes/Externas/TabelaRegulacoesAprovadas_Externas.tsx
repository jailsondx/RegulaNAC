import React from 'react';
import { LuArrowDownWideNarrow, LuArrowUpNarrowWide  } from "react-icons/lu";
import { FcAbout } from "react-icons/fc";
import { RegulacaoExternaAprovadaData } from '../../../../interfaces/RegulacaoExtena';
import { UserData } from '../../../../interfaces/UserData';

interface TabelaRegulacoesAprovadasProps {
  UserData: UserData | null;
  currentRegulacoes: RegulacaoExternaAprovadaData[];
  selectedColumn: keyof RegulacaoExternaAprovadaData | null;
  sortConfig: { key: keyof RegulacaoExternaAprovadaData; direction: "asc" | "desc" } | null;
  handleSort: (key: keyof RegulacaoExternaAprovadaData) => void;
  fetchPDF: (datetime: string, filename: string) => void;
  handleOpenModalDesfecho: (regulacao: RegulacaoExternaAprovadaData) => void;
}

const TabelaRegulacoesAprovadas_Externas: React.FC<TabelaRegulacoesAprovadasProps> = ({
  UserData,
  currentRegulacoes,
  selectedColumn,
  sortConfig,
  handleSort,
  fetchPDF,
  handleOpenModalDesfecho
}) => {

  return (
    <table className='Table-Regulacoes'>
      <thead>
        <tr>
          <th className={`col-NumProntuario clicked${selectedColumn === "num_prontuario" ? " selected" : ""}`} onClick={() => handleSort("num_prontuario")}>
            <span>
              <label>Pront.</label>
              <label>{sortConfig?.key === "num_prontuario" ? (sortConfig.direction === "asc" ? <LuArrowUpNarrowWide  /> : <LuArrowDownWideNarrow />) : ""}</label>
            </span>
          </th>

          <th className={`col-NomePaciente clicked${selectedColumn === "nome_paciente" ? " selected" : ""}`} onClick={() => handleSort("nome_paciente")}>
            <span>
              <label>Nome Paciente</label>
              <label>{sortConfig?.key === "nome_paciente" ? (sortConfig.direction === "asc" ? <LuArrowUpNarrowWide  /> : <LuArrowDownWideNarrow />) : ""}</label>
            </span>
          </th>

          <th className={`col-NumRegulacao clicked${selectedColumn === "num_regulacao" ? " selected" : ""}`} onClick={() => handleSort("num_regulacao")}>
            <span>
              <label>Num. Regulação</label>
              <label>{sortConfig?.key === "num_regulacao" ? (sortConfig.direction === "asc" ? <LuArrowUpNarrowWide  /> : <LuArrowDownWideNarrow />) : ""}</label>
            </span>
          </th>

          <th className={`col-Vinculo clicked${selectedColumn === "vinculo" ? " selected" : ""}`} onClick={() => handleSort("vinculo")}>
            <span>
              <label>Vinculo</label>
              <label>{sortConfig?.key === "vinculo" ? (sortConfig.direction === "asc" ? <LuArrowUpNarrowWide  /> : <LuArrowDownWideNarrow />) : ""}</label>
            </span>
          </th>

          <th className={`col-UnOrigem clicked${selectedColumn === "un_origem" ? " selected" : ""}`} onClick={() => handleSort("un_origem")}>
            <span>
              <label>Un. Origem</label>
              <label>{sortConfig?.key === "un_origem" ? (sortConfig.direction === "asc" ? <LuArrowUpNarrowWide  /> : <LuArrowDownWideNarrow />) : ""}</label>
            </span>
          </th>

          <th className={`col-numLeito clicked${selectedColumn === "num_leito" ? " selected" : ""}`} onClick={() => handleSort("num_leito")}>
            <span>
              <label>Num. Leito</label>
              <label>{sortConfig?.key === "num_leito" ? (sortConfig.direction === "asc" ? <LuArrowUpNarrowWide  /> : <LuArrowDownWideNarrow />) : ""}</label>
            </span>
          </th>

          <th className={`col-MedicoRegulador clicked${selectedColumn === "nome_regulador_medico" ? " selected" : ""}`} onClick={() => handleSort("nome_regulador_medico")}>
            <span>
              <label>Médico Regulador</label>
              <label>{sortConfig?.key === "nome_regulador_medico" ? (sortConfig.direction === "asc" ? <LuArrowUpNarrowWide  /> : <LuArrowDownWideNarrow />) : ""}</label>
            </span>
          </th>

          <th className={`col-DataRegMedico clicked${selectedColumn === "data_hora_regulacao_medico_01" ? " selected" : ""}`} onClick={() => handleSort("data_hora_regulacao_medico_01")}>
            <span>
              <label>Autorização</label>
              <label>{sortConfig?.key === "data_hora_regulacao_medico_01" ? (sortConfig.direction === "asc" ? <LuArrowUpNarrowWide  /> : <LuArrowDownWideNarrow />) : ""}</label>
            </span>
          </th>

          {UserData?.tipo !== "MEDICO" && (
            <th>Fase</th>
          )}
        </tr>
      </thead>
      <tbody>
        {currentRegulacoes.map(regulacao => (
          <tr key={regulacao.id_regulacao}>
            <td>{regulacao.num_prontuario}</td>
            <td className="col-NomePaciente">
              <a onClick={() => fetchPDF(regulacao.data_hora_solicitacao_02 ?? '', regulacao.link ?? '')}>
                {regulacao.nome_paciente}
              </a>
            </td>
            <td className="col-NumRegulacao">{regulacao.num_regulacao}</td>
            <td>{regulacao.vinculo}</td>
            <td>{regulacao.un_origem}</td>
            <td className="col-Prioridade">{regulacao.num_leito}</td>
            <td>{regulacao.nome_regulador_medico}</td>
            <td>{new Date(regulacao.data_hora_regulacao_medico_01).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
            {UserData?.tipo !== "MEDICO" && (
              <td>
                <label className="td-Icons">
                  {regulacao.status_regulacao === "ABERTO - APROVADO - AGUARDANDO DESFECHO" && (
                    <FcAbout
                      className="Icon Icons-Regulacao"
                      onClick={() => handleOpenModalDesfecho(regulacao)}
                      title='Desfecho'
                    />
                  )}
                </label>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TabelaRegulacoesAprovadas_Externas;