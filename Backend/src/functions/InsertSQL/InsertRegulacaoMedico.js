//ESSA FUNÇÃO É CHAMADA DENTRO DA NOVAREGULACAO.JS E É CHAMADA SE A ORIGEM E DESTINO FOREM VALORES ESPECIAIS DEFINIDOS NA FUNÇÃO PAI

async function InsertRegulacaoMedico(id_regulacao, id_user, connection) {
    const DBtable = "regulacao_medico";

    // Define valores obrigatórios e padrão
    const values = {
        id_user: id_user,
        id_regulacao: id_regulacao,
        vaga_autorizada: true, // aprovado por padrão nas especiais
        autorizacao: "AUTORIZADO",
        data_hora_regulacao_medico: new Date(), // agora
    };

    try {
        await connection.query(
            `INSERT INTO ${DBtable} SET ?`,
            [values]
        );
        return { success: true };
    } catch (error) {
        console.error("Erro ao inserir na tabela regulacao_medico:", error);
        return { success: false, message: "Erro ao inserir na tabela regulacao_medico", error };
    }
}

export default InsertRegulacaoMedico;
