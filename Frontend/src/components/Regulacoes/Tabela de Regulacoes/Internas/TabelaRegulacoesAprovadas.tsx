import React, { useEffect, useState } from 'react';
import { LuArrowDownWideNarrow, LuArrowUpNarrowWide  } from "react-icons/lu";
import { FcHome, FcOrganization, FcOnlineSupport, FcOvertime, FcAbout, FcFullTrash, FcInspection, FcDoughnutChart } from "react-icons/fc";
import { useNavigate } from 'react-router-dom';


/*IMPORT INTERFACE*/
import { UserData } from '../../../../interfaces/UserData.ts';
import { RegulacaoData } from '../../../../interfaces/Regulacao.ts';

interface TabelaRegulacoesAprovadasProps {
  UserData: UserData;
  currentRegulacoes: RegulacaoData[];
  selectedColumn: keyof RegulacaoData | null;
  sortConfig: { key: keyof RegulacaoData; direction: "asc" | "desc" } | null;
  handleSort: (key: keyof RegulacaoData) => void;
  fetchPDF: (datetime: string, filename: string) => void;
  confirmarExclusao?: (id_user: number | null, id_regulacao: number | null) => void;
  handleOpenModalOrigem: (regulacao: RegulacaoData) => void;
  handleOpenModalDestino: (regulacao: RegulacaoData) => void;
  handleOpenModalTransporte01: (regulacao: RegulacaoData) => void;
  handleOpenModalTransporte02: (regulacao: RegulacaoData) => void;
  handleOpenModalDesfecho: (regulacao: RegulacaoData) => void;
  handleOpenModalObservacao: (regulacao: RegulacaoData) => void;
  handleOpenModalFase: (regulacao: RegulacaoData) => void;
}

const TabelaRegulacoesAprovadas: React.FC<TabelaRegulacoesAprovadasProps> = ({
  UserData,
  currentRegulacoes,
  selectedColumn,
  sortConfig,
  handleSort,
  fetchPDF,
  confirmarExclusao,
  handleOpenModalOrigem,
  handleOpenModalDestino,
  handleOpenModalTransporte01,
  handleOpenModalTransporte02,
  handleOpenModalDesfecho,
  handleOpenModalObservacao,
  handleOpenModalFase
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

          <th className={`col-numLeito clicked${selectedColumn === "num_leito" ? " selected" : ""}`} onClick={() => handleSort("num_leito")}>
            <span>
              <label>Num. Leito</label>
              <label>{sortConfig?.key === "num_leito" ? (sortConfig.direction === "asc" ? <LuArrowUpNarrowWide /> : <LuArrowDownWideNarrow />) : ""}</label>
            </span>
          </th>

          <th className={`col-MedicoRegulador clicked${selectedColumn === "nome_regulador_medico" ? " selected" : ""}`} onClick={() => handleSort("nome_regulador_medico")}>
            <span>
              <label>Médico Regulador</label>
              <label>{sortConfig?.key === "nome_regulador_medico" ? (sortConfig.direction === "asc" ? <LuArrowUpNarrowWide /> : <LuArrowDownWideNarrow />) : ""}</label>
            </span>
          </th>

          <th className={`col-DataRegMedico clicked${selectedColumn === "data_hora_regulacao_medico" ? " selected" : ""}`} onClick={() => handleSort("data_hora_regulacao_medico")}>
            <span>
              <label>Autorização</label>
              <label>{sortConfig?.key === "data_hora_regulacao_medico" ? (sortConfig.direction === "asc" ? <LuArrowUpNarrowWide /> : <LuArrowDownWideNarrow />) : ""}</label>
            </span>
          </th>

          <th className={`col-TipoAuto clicked${selectedColumn === "autorizacao" ? " selected" : ""}`} onClick={() => handleSort("autorizacao")}>
            <span>
              <label>Tipo Autorização</label>
              <label>{sortConfig?.key === "autorizacao" ? (sortConfig.direction === "asc" ? <LuArrowUpNarrowWide /> : <LuArrowDownWideNarrow />) : ""}</label>
            </span>
          </th>

          {(["GERENCIA", "AUX. ADMINISTRATIVO"].includes(UserData?.tipo) && ["GERENCIA", "AUX. ADMINISTRATIVO"].includes(selectedUserViewer)) && (
            <th>Fase</th>
          )}

          {UserData?.tipo === "GERENCIA" && selectedUserViewer === 'GERENCIA' && (
            <th>Gerenciar</th>
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
            <td className="col-NumRegulacao">{regulacao.num_regulacao}</td>
            <td>{regulacao.un_origem}</td>
            <td>{regulacao.un_destino}</td>
            <td className="col-Prioridade">{regulacao.num_leito}</td>
            <td>{regulacao.nome_regulador_medico}</td>
            <td>{new Date(regulacao.data_hora_regulacao_medico ?? '').toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
            <td>{regulacao.autorizacao}</td>

            {(["GERENCIA", "AUX. ADMINISTRATIVO"].includes(UserData?.tipo) && ["GERENCIA", "AUX. ADMINISTRATIVO"].includes(selectedUserViewer)) && (
              <td>
                <label className="td-Icons">
                  {regulacao.status_regulacao === "ABERTO - APROVADO - AGUARDANDO ORIGEM" && (
                    <FcHome
                      className="Icon Icons-Regulacao"
                      onClick={() => handleOpenModalOrigem(regulacao)}
                      title='Acionamento do Setor de Origem'
                    />
                  )}
                  {regulacao.status_regulacao === "ABERTO - APROVADO - AGUARDANDO DESTINO" && (
                    <FcOrganization
                      className="Icon Icons-Regulacao"
                      onClick={() => handleOpenModalDestino(regulacao)}
                      title='Acionamento do Setor de Destino'
                    />
                  )}
                  {regulacao.status_regulacao === "ABERTO - APROVADO - AGUARDANDO ACIONAMENTO TRANSPORTE" && (
                    <FcOnlineSupport
                      className="Icon Icons-Regulacao"
                      onClick={() => handleOpenModalTransporte01(regulacao)}
                      title='Acionamento do Transporte'
                    />
                  )}
                  {regulacao.status_regulacao === "ABERTO - APROVADO - AGUARDANDO FINALIZACAO TRANSPORTE" && (
                    <FcOvertime
                      className="Icon Icons-Regulacao"
                      onClick={() => handleOpenModalTransporte02(regulacao)}
                      title='Finalização do Transporte'
                    />
                  )}
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

            {UserData?.tipo === 'GERENCIA' && selectedUserViewer === 'GERENCIA' && (
              <>
                <td>
                  {regulacao.num_regulacao && (
                    <label className="td-Icons">
                      <FcInspection
                        className='Icon Icons-Regulacao'
                        onClick={() => handleEditarRegulacao && handleEditarRegulacao(regulacao.id_regulacao)}
                        title='Editar Regulação' />

                      <FcFullTrash
                        className='Icon Icons-Regulacao'
                        onClick={() => confirmarExclusao && confirmarExclusao(UserData.id_user, regulacao.id_regulacao)}
                        title='Apagar Regulação' />

                      <FcDoughnutChart
                        className='Icon Icons-Regulacao'
                        onClick={() => handleOpenModalFase(regulacao)}
                        title='Retornar Fase de Regulação' />
                    </label>
                  )}
                </td>
              </>
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

export default TabelaRegulacoesAprovadas;