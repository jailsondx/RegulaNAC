import React from 'react';
import { LuArrowDownWideNarrow, LuArrowUpNarrowWide } from "react-icons/lu";
import { RegulacaoData } from '../../interfaces/Regulacao';

interface TabelaRegulacoesProps {
  currentRegulacoes: RegulacaoData[];
  selectedColumn: keyof RegulacaoData | null;
  sortConfig: { key: keyof RegulacaoData; direction: "asc" | "desc" } | null;
  handleSort: (key: keyof RegulacaoData) => void;
  fetchPDF: (datetime: string, filename: string) => void;
}

const TabelaRegulacoesFinalizadas: React.FC<TabelaRegulacoesProps> = ({
  currentRegulacoes,
  selectedColumn,
  sortConfig,
  handleSort,
  fetchPDF,
}) => {
  return (
    <table className='Table-Regulacoes'>
      <thead>
        <tr>
          <th className={`col-NomeRegNac clicked${selectedColumn === "nome_regulador_nac" ? " selected" : ""}`} onClick={() => handleSort("nome_regulador_nac")}>
            <span>
              <label>Regulador de Cadastro</label>
              <label>{sortConfig?.key === "nome_regulador_nac" ? (sortConfig.direction === "asc" ? <LuArrowUpNarrowWide /> : <LuArrowDownWideNarrow />) : ""}</label>
            </span>
          </th>

          <th className={`col-NomeRegNac clicked${selectedColumn === "regulador_final" ? " selected" : ""}`} onClick={() => handleSort("regulador_final")}>
            <span>
              <label>Regulador Final</label>
              <label>{sortConfig?.key === "regulador_final" ? (sortConfig.direction === "asc" ? <LuArrowUpNarrowWide /> : <LuArrowDownWideNarrow />) : ""}</label>
            </span>
          </th>

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

          <th className={`col-Desfecho clicked${selectedColumn === "prioridade" ? " selected" : ""}`} onClick={() => handleSort("desfecho")}>
            <span>
              <label>Desfecho</label>
              <label>{sortConfig?.key === "desfecho" ? (sortConfig.direction === "asc" ? <LuArrowUpNarrowWide /> : <LuArrowDownWideNarrow />) : ""}</label>
            </span>
          </th>

        </tr>
      </thead>
      <tbody>
        {currentRegulacoes.map(regulacao => (
          <tr key={regulacao.id_regulacao}>
            <td>{regulacao.nome_regulador_nac}</td>
            <td>{regulacao.regulador_final}</td>
            <td>{regulacao.num_prontuario}</td>
            <td>
              <a onClick={() => fetchPDF(regulacao.data_hora_solicitacao_02, regulacao.link)}>
                {regulacao.nome_paciente}
              </a>
            </td>
            <td>{regulacao.num_regulacao}</td>
            <td>{regulacao.un_origem}</td>
            <td>{regulacao.un_destino}</td>
            <td>{regulacao.desfecho}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TabelaRegulacoesFinalizadas;