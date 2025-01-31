export interface Regulacao {
    id_user: string;
    num_prontuario: number | null;
    nome_paciente: string;
    data_nascimento: string;
    num_idade: number | null;
    un_origem: string;
    un_destino: string;
    prioridade: string | null;
    data_hora_solicitacao_01: string;
    data_hora_solicitacao_02: string;
    nome_regulador_nac: string;
    num_regulacao: number | null;
    nome_regulador_medico: string;
    data_hora_acionamento_medico: string;
    status_regulacao: string;
    link: string;
  }