export interface DadosPacienteData {
    id_regulacao: number;
    nome_paciente: string;
    num_regulacao: number | null;
    num_prontuario: number | null;
    num_leito?: number | null;
    un_origem: string;
    un_destino: string;
    nome_regulador_medico: string;
};
