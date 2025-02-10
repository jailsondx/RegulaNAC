import { DBconnection } from "../Controller/connection.js";
import { RowDataPacket } from "mysql2/promise"; // Importa RowDataPacket para tipagem correta
import { getCurrentTimestamp } from "../Time/Timestamp.js";

async function ListaRegulacoesPendentes() {
    const DBtable = "regulacao";

    try {
        // Inicie a conexão com o banco de dados
        const connection = await DBconnection.getConnection();

        // Execute a query para selecionar os registros
        const [rows] = await connection.query<RowDataPacket[]>(`
            SELECT * 
            FROM ${DBtable}
            WHERE status_regulacao LIKE ?
            AND TIMESTAMPDIFF(HOUR, data_hora_solicitacao_02, ?) < 24
        `, ["ABERTO - AGUARDANDO AVALIACAO%", getCurrentTimestamp()]);

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
        const [rows] = await connection.query<RowDataPacket[]>(`
            SELECT * 
            FROM ${DBtable}
            WHERE status_regulacao = ?
            AND TIMESTAMPDIFF(HOUR, data_hora_solicitacao_02, ?) >= 24
        `, ["ABERTO - AGUARDANDO AVALIACAO", getCurrentTimestamp()]);

        connection.release(); // Libera a conexão

        return { success: true, data: rows };

    } catch (error) {
        console.error("Erro ao carregar regulações:", error);
        return { success: false, message: "Erro ao carregar regulações.", error };
    }
}

export { ListaRegulacoesPendentes, ListaRegulacoesPendentes24 };
