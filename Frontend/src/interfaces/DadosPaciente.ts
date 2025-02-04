export interface DadosPacienteData {
    nome_paciente: string;
    num_regulacao: number | null;
    num_leito?: number | null;
    un_origem: string;
    un_destino: string;
    id_regulacao: number;
    nome_regulador_medico: string;
};
