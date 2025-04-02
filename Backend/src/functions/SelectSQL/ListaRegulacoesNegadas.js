import { DBconnection } from "../Controller/connection.js";

async function ListaRegulacoesNegadas() {
    const DBtable = "regulacao";
    const DBtableRegulacaoMedico = "regulacao_medico";

    try {
        // Inicie a conexão com o banco de dados
        const connection = await DBconnection.getConnection();

        // Execute a query para selecionar os registros da tabela regulacao
        const [rows] = await connection.query(`
            SELECT 
                r.id_regulacao, 
                r.nome_regulador_nac, 
                r.num_prontuario, 
                r.nome_paciente, 
                r.num_regulacao, 
                r.un_origem, 
                r.un_destino,
                r.data_hora_solicitacao_02,
                r.link,
                rm.nome_regulador_medico,
                rm.justificativa_neg
            FROM ${DBtable} r
            JOIN ${DBtableRegulacaoMedico} rm ON r.id_regulacao = rm.id_regulacao
            WHERE r.status_regulacao LIKE ?
        `, ["NEGADO"]);

        connection.release(); // Libera a conexão

        return { success: true, data: rows };

    } catch (error) {
        // Tratamento de erro
        console.error("Erro ao carregar regulações:", error);
        return { success: false, message: "Erro ao carregar regulações.", error };
    }
}

export default ListaRegulacoesNegadas;
