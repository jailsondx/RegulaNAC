import { DBconnection } from "../Controller/connection.js";

async function ListaRegulacoesAprovadas(Origem) {
    let DBtable;
    let DBtable2;
    let rows = [];
    let query;
    let queryParams = [];

    switch (Origem) {
        case "Interna":
            DBtable = "regulacao";
            DBtable2 = "regulacao_medico";
            query = `
                SELECT 
                    r.*,
                    rm.nome_regulador_medico, data_hora_regulacao_medico, num_leito
                FROM ${DBtable} r
                LEFT JOIN ${DBtable2} rm ON r.id_regulacao = rm.id_regulacao
                WHERE r.status_regulacao LIKE ? AND vaga_autorizada = ?
            `;
            queryParams = ["ABERTO - APROVADO%", 1];
            break;
        case "Externa":
            DBtable = "externa_regulacao";
            DBtable2 = "externa_regulacao_medico";
            query = `
                SELECT 
                    r.*,
                    rm.nome_regulador_medico_01, data_hora_regulacao_medico_01, num_leito
                FROM ${DBtable} r
                LEFT JOIN ${DBtable2} rm ON r.id_regulacao = rm.id_regulacao
                WHERE r.status_regulacao LIKE ? AND vaga_autorizada = ?
            `;
            queryParams = ["ABERTO - APROVADO%", 1];
            break;
        default:
            throw new Error("Origem inválida. Use 'Interna' ou 'Externa'.");
    }

    try {
        const connection = await DBconnection.getConnection();

        [rows] = await connection.query(query, queryParams);

        connection.release(); // Libera a conexão

        // ✅ Proteção extra: garante que o retorno seja sempre um array
        if (!rows || rows.length === 0) {
            return { success: true, data: [] };
        }

        return { success: true, data: rows };

    } catch (error) {
        console.error("Erro ao carregar regulações:", error);
        return { success: false, message: "Erro ao carregar regulações.", error };
    }
}

export default ListaRegulacoesAprovadas;
