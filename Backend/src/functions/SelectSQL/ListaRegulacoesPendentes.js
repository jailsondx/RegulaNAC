import { DBconnection } from "../Controller/connection.js";
import { getCurrentTimestamp } from "../Time/Timestamp.js";

async function ListaRegulacoesPendentes(Origem) {
    let DBtable, query, queryParams;

    switch (Origem) {
        case "Interna":
            DBtable = "regulacao";
            query = `
                SELECT * 
                FROM ${DBtable}
                WHERE status_regulacao LIKE ?
                AND TIMESTAMPDIFF(HOUR, data_hora_solicitacao_02, ?) < 24
            `;
            queryParams = ["ABERTO - AGUARDANDO AVALIACAO%", getCurrentTimestamp()];
            break;
        case "Externa":
            DBtable = "externa_regulacao";
            query = `
                SELECT * 
                FROM ${DBtable}
                WHERE status_regulacao LIKE ?
            `;
            queryParams = ["ABERTO - AGUARDANDO AVALIACAO%"];
            break;
        default:
            throw new Error("Origem inválida. Use 'Interna' ou 'Externa'.");
    }

    try {
        const connection = await DBconnection.getConnection();
        const [rows] = await connection.query(query, queryParams);
        connection.release();

        return {
            success: true,
            data: Array.isArray(rows) ? rows : []
        };

    } catch (error) {
        console.error("Erro ao carregar regulações:", error);
        return {
            success: false,
            message: "Erro ao carregar regulações.",
            error
        };
    }
}

async function ListaRegulacoesPendentes24() {
    const DBtable = "regulacao";

    try {
        const connection = await DBconnection.getConnection();

        const [rows] = await connection.query(`
            SELECT * 
            FROM ${DBtable}
            WHERE TIMESTAMPDIFF(HOUR, data_hora_solicitacao_02, ?) >= 24 
            AND status_regulacao LIKE 'ABERTO%'
        `, [getCurrentTimestamp()]);

        connection.release();

        return {
            success: true,
            data: Array.isArray(rows) ? rows : []
        };

    } catch (error) {
        console.error("Erro ao carregar regulações:", error);
        return {
            success: false,
            message: "Erro ao carregar regulações.",
            error
        };
    }
}

export { ListaRegulacoesPendentes, ListaRegulacoesPendentes24 };
