export interface NovaRegulacaoExterna{
    id_user: number | null;
    vinculo: string;
    num_prontuario: number | null;
    nome_paciente: string;
    data_nascimento: string;
    num_idade: number | null;
    nome_regulador_medico?: string;
    data_hora_solicitacao_01?: string | null;
    data_hora_solicitacao_02?: string | null;
    data_hora_acionamento_medico?: string | null;
    un_origem: string;
    num_regulacao: number | null;
    data_hora_chegada?: string | null;
    qtd_solicitacoes: number | null;
    status_regulacao: string;
    link?: string;
}

export interface RegulacaoExternaData extends NovaRegulacaoExterna {
  id_regulacao: number;
  desfecho: string;
  regulador_final?: string;
}