export interface DadosPacienteData {
    id_regulacao: number;
    nome_paciente: string;
    num_regulacao: number | null;
    num_prontuario: number | null;
    num_leito?: number | null;
    un_origem: string;
    nome_colaborador_origem?: string;
    un_destino: string;
    nome_colaborador_destino?: string;
    preparo_leito?: string;
    nome_regulador_medico: string;
    status_regulacao?: string;
};

export interface DadosPacienteExternoData {
    id_regulacao: number;
    nome_paciente: string;
    num_regulacao: number | null;
    num_prontuario: number | null;
    num_leito?: number | null;
    un_origem: string;
    nome_regulador_medico?: string | null;
    vinculo?: string;
    status_regulacao?: string;
};
