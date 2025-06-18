/*DADOS DE REGULAÇÃO*/

export interface NovaRegulacaoData {
  id_user: number | null;
  num_prontuario: number | null;
  nome_paciente: string;
  data_nascimento: string;
  num_idade: number | null;
  un_origem: string;
  un_destino: string;
  prioridade?: string | null;
  data_hora_solicitacao_01: string;
  data_hora_solicitacao_02: string;
  qtd_solicitacoes: number | null;
  nome_responsavel_nac: string;
  num_regulacao: number | null;
  nome_regulador_medico: string;
  data_hora_acionamento_medico: string;
  status_regulacao: string;
  link: string;
}

export interface RegulacaoData extends NovaRegulacaoData {
  id_regulacao: number;
  data_hora_regulacao_medico?: string;
  justificativa_neg?: string;
  tempo_espera?: number | null;
  preparo_leito?: string;
  num_leito?: number;
  desfecho?: string;
  forcado?: string;
  observacaoTexto?: string;
  fastmedic?: string;
  autorizacao?: string;
}



/*UPDATE REGULAÇÃO*/
export interface UpdateRegulacaoData {
  id_user: number | null;
  num_prontuario: number | null;
  num_regulacao: number | null;
  data_hora_solicitacao_02: string;
  link: string;
}

export interface EditaRegulacaoData {
  id_user: number | null;
  num_prontuario: number | null;
  nome_paciente?: string;
  data_nascimento: string;
  num_idade?: number | null;
  un_origem?: string;
  un_destino?: string;
  prioridade?: string | null;
  data_hora_solicitacao_01?: string;
  data_hora_solicitacao_02?: string;
  qtd_solicitacoes?: number | null;
  nome_responsavel_nac?: string;
  num_regulacao: number | null;
  nome_regulador_medico?: string;
  data_hora_acionamento_medico?: string;
  status_regulacao?: string;
  link?: string;
  id_regulacao?: number;
  desfecho?: string;
  regulador_final?: string;
  justificativa_neg?: string;
  tempo_espera?: number | null;
  num_leito?: number | null;
  data_hora_regulacao_medico?: string;
  autorizacao?: string;
  preparo_leito?: string;
}



/*REGULAÇÃO MÉDICA*/
export interface RegulacaoMedicoData {
  id_user: number | null;
  vaga_autorizada?: boolean;
  num_leito?: string;
  extra?: boolean;
  justificativa_neg?: string;
  nome_regulador_medico: string;
  data_hora_regulacao_medico: string;
  autorizacao: string;
  justificativa_tempo30?: string;
  un_destino?: string;
}

