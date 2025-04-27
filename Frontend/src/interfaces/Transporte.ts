export interface OrigemData {
  id_user: string;
  un_origem: string;
  nome_colaborador: string;
  data_hora_comunicacao: string;
  preparo_leito: string;
}

export interface DestinoData {
  id_user: string;
  un_destino: string;
  nome_colaborador: string;
  data_hora_comunicacao: string;
}

export interface TransporteData {
  id_user: string;
  nome_colaborador: string;
  data_hora_acionamento: string;
  data_hora_liberacao_leito: string;
  criticidade: string;
}

export interface TransporteDatesData {
  data_hora_chegada_origem: string;
  data_hora_saida_origem: string;
  data_hora_chegada_destino: string;
  justificativa_atraso_leito?: string;
  observacao?: string[]; // Agora está correto como um array de strings
}

export interface AtrasoLeitoOptions{
  value: string;
  label: string;
}