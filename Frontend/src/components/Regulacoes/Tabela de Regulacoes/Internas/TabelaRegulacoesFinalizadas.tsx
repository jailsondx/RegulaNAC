import React from 'react';
import { LuArrowDownWideNarrow, LuArrowUpNarrowWide } from "react-icons/lu";
import { MdCheckCircle, MdCancel } from "react-icons/md";
import { FcInfo } from "react-icons/fc";


/*IMPORT INTERFACE*/
import { UserData } from '../../../../interfaces/UserData.ts';
import { RegulacaoData } from '../../../../interfaces/Regulacao';

interface TabelaRegulacoesProps {
  UserData: UserData | null;
  currentRegulacoes: RegulacaoData[];
  selectedColumn: keyof RegulacaoData | null;
  sortConfig: { key: keyof RegulacaoData; direction: "asc" | "desc" } | null;
  handleSort: (key: keyof RegulacaoData) => void;
  fetchPDF: (datetime: string, filename: string) => void;
  handleOpenModalFastmedic: (regulacao: RegulacaoData) => void;
  handleOpenModalObservacao: (regulacao: RegulacaoData) => void;
}

const TabelaRegulacoesFinalizadas: React.FC<TabelaRegulacoesProps> = ({
  UserData,
  currentRegulacoes,
  selectedColumn,
  sortConfig,
  handleSort,
  fetchPDF,
  handleOpenModalFastmedic,
  handleOpenModalObservacao
}) => {
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

          <th className={`col-NomeRegMedico clicked${selectedColumn === "nome_regulador_medico" ? " selected" : ""}`} onClick={() => handleSort("nome_regulador_medico")}>
            <span>
              <label>Médico Regulador</label>
              <label>{sortConfig?.key === "nome_regulador_medico" ? (sortConfig.direction === "asc" ? <LuArrowUpNarrowWide /> : <LuArrowDownWideNarrow />) : ""}</label>
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

          <th> Desfecho Forçado? </th>

          <th> Obs. </th>

          <th> Fastmedic </th>

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
            <td>{regulacao.nome_regulador_medico}</td>
            <td>{regulacao.un_origem}</td>
            <td>{regulacao.un_destino}</td>
            <td>{regulacao.desfecho}</td>
            <td>{regulacao.forcado ? 'SIM' : 'NÃO'}</td>
            {UserData?.tipo != 'MEDICO' && (
              <>
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
                        : <FcInfo
                          className='Icon Icons-Regulacao'
                        />}
                    </label>
                  )}
                </td>

                <td>
                  <label
                    onClick={() => handleOpenModalFastmedic(regulacao)}
                    className="td-Icons"
                    title="Fastmedic"
                  >
                    {regulacao.fastmedic === "SIM" ? (
                      <MdCheckCircle 
                        className='Icon Icons-Regulacao' 
                        color="green" 
                        title='Leito Alocado Fastmedic = SIM' 
                      />
                    ) : (
                      <MdCancel 
                        className='Icon Icons-Regulacao' 
                        color="red" 
                        title='Leito Alocado Fastmedic = NÃO' 
                      />
                    )}
                  </label>
                </td>

              </>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TabelaRegulacoesFinalizadas;