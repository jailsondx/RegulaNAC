export interface FormCadastroUser{
    login: string;
    nome: string;
    cpf: string;
    senha: string;
    primeiroAcesso: boolean;
    tipo?: '' | 'AUX. ADMINISTRATIVO' | 'MEDICO' | 'GERENCIA';
}

export interface UpdateSenhaData{
    login: string;
    senha: string;
}