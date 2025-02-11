/*DADOS DE REGULAÇÃO*/

export interface NovaRegulacaoData {
  id_user: string;
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
  nome_regulador_nac: string;
  num_regulacao: number;
  nome_regulador_medico: string;
  data_hora_acionamento_medico: string;
  status_regulacao: string;
  link: string;
}

export interface RegulacaoData extends NovaRegulacaoData {
  id_regulacao: number;
  desfecho: string;
}

export interface RegulacaoAprovadaData extends RegulacaoData{
  num_leito: number;
  data_hora_regulacao_medico: string;
}





/*UPDATE REGULAÇÃO*/
export interface PartialUpdateRegulacaoData {
  un_origem: string;
  un_destino: string;
  data_hora_solicitacao_02: string;
}

export interface UpdateRegulacaoData extends PartialUpdateRegulacaoData {
  id_user: string;
  num_prontuario: number | null;
  link: string;
}






/*REGULAÇÃO MÉDICA*/
export interface RegulacaoMedicoData {
  id_user: string;
  vaga_autorizada?: boolean;
  num_leito?: string;
  justificativa_neg?: string;
  nome_regulador_medico: string;
  data_hora_regulacao_medico: string;
  justificativa_tempo30?: string;
}

