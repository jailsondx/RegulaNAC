export const calcularIdade = (dataNascimento: string): number => {
    if (!dataNascimento) return 0;
    
    const dataNasc = new Date(dataNascimento);
    const hoje = new Date();
    
    let idade = hoje.getFullYear() - dataNasc.getFullYear();
    const mesAtual = hoje.getMonth();
    const mesNascimento = dataNasc.getMonth();
    const diaAtual = hoje.getDate();
    const diaNascimento = dataNasc.getDate();
    
    // Ajustar caso ainda não tenha passado o aniversário no ano atual
    if (mesAtual < mesNascimento || (mesAtual === mesNascimento && diaAtual < diaNascimento)) {
        idade--;
    }
    
    return idade;
};
