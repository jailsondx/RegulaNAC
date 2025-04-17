export interface RegulacaoObstetrica{
    id_user: number | null;
    nome_paciente: string;
    data_nascimento: string;
    num_idade: number | null;
    num_regulacao: number | null;
    num_prontuario: number | null;
}

export interface Vinculada extends RegulacaoObstetrica {
    data_hora_chegada: string;
    status: string;
}