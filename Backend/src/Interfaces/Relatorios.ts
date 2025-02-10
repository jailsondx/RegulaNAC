export interface ReportsPacienteCSV {
    nome_regulador_nac: string;
    nome_paciente: string;
    num_prontuario: string;
    num_regulacao: string;
    un_origem: string;
    un_destino: string;
    prioridade: string;
    data_nascimento: string;
    num_idade: string;
    data_hora_solicitacao_01: string;
    data_hora_solicitacao_02: string;
    nome_regulador_medico: string;
    data_hora_acionamento_medico: string;
    data_hora_regulacao_medico: string;
    status_regulacao: string;
    transporte_nome_colaborador: string;
    desfecho: string;
    criticidade: string;
    fastmedic: string;
}

export interface ReportsGerenciaCSV {
    un_destino: string;
    especificacao: string;
    valor_absoluto: number;
}