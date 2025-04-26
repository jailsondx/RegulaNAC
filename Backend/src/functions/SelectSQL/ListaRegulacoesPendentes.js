import { DBconnection } from "../Controller/connection.js";
import { getCurrentTimestamp } from "../Time/Timestamp.js";

async function ListaRegulacoesPendentes(Origem) {
    let DBtable;
    let rows = [];
    let query;
    let queryParams = [];

    console.log('requisicao: ',Origem);

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
        // Inicie a conexão com o banco de dados
        const connection = await DBconnection.getConnection();

        // Execute a query utilizando a constante
        [rows] = await connection.query(query, queryParams);

        connection.release(); // Libera a conexão

        return { success: true, data: rows };

    } catch (error) {
        console.error("Erro ao carregar regulações:", error);
        return { success: false, message: "Erro ao carregar regulações.", error };
    }
}

async function ListaRegulacoesPendentes24() {
    const DBtable = "regulacao";

    try {
        // Inicie a conexão com o banco de dados
        const connection = await DBconnection.getConnection();

        // Execute a query para selecionar os registros
        const [rows] = await connection.query(`
            SELECT * 
            FROM ${DBtable}
            WHERE TIMESTAMPDIFF(HOUR, data_hora_solicitacao_02, ?) >= 24 AND (status_regulacao LIKE 'ABERTO%')
        `, [getCurrentTimestamp()]);

        connection.release(); // Libera a conexão

        return { success: true, data: rows };

    } catch (error) {
        console.error("Erro ao carregar regulações:", error);
        return { success: false, message: "Erro ao carregar regulações.", error };
    }
}

export { ListaRegulacoesPendentes, ListaRegulacoesPendentes24 };
