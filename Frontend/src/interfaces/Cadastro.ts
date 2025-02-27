export interface FormCadastro{
    login: string;
    nome: string;
    cpf: string;
    senha: string;
    primeiroAcesso: boolean;
    tipo: 'REGULADOR' | 'MEDICO' | 'GERENCIA';
}

export interface UpdateSenhaData{
    login: string;
    senha: string;
}