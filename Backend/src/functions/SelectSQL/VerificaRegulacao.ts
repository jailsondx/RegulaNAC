import { DBconnection } from "../Controller/connection.js"; // Importa apenas o objeto DBconnection
import { RowDataPacket } from "mysql2/promise"; // 🔹 Importa RowDataPacket para tipagem correta

async function VerificaRegulacao(num_regulacao: string) {
    const DBtable = 'regulacao';

    try {
        // Inicie a conexão com o banco de dados
        const connection = await DBconnection.getConnection();

        // Execute a query para verificar a regulação na tabela com LIMIT 1
        const [row] = await connection.query<RowDataPacket[]>(
            `SELECT * FROM ${DBtable} WHERE num_regulacao = ? AND status_regulacao LIKE 'ABERTO%' LIMIT 1`,
            [num_regulacao]
        );

        connection.release(); // Libera a conexão

        // Verifica se há um resultado
        if (row[0]) {
            return { success: true, message: "Regulação pendente em aberto", data: row[0] };
        } else {
            return { success: true, message: "Nenhuma regulação pendente encontrada.", data: null};
        }
    } catch (error) {
        // Tratamento de erro
        console.error('Erro ao verificar regulacao:', error);
        return { success: false, message: "Erro ao carregar regulações.", error };
    }
}

async function VerificaRegulacaoID(id_regulacao: string) {
    const DBtable = 'regulacao';

    try {
        // Inicie a conexão com o banco de dados
        const connection = await DBconnection.getConnection();

        // Execute a query para verificar a regulação na tabela com LIMIT 1
        const [row] = await connection.query<RowDataPacket[]>(
            `SELECT * FROM ${DBtable} WHERE id_regulacao = ? AND status_regulacao LIKE 'ABERTO%' LIMIT 1`,
            [id_regulacao]
        );

        connection.release(); // Libera a conexão

        // Verifica se há um resultado
        if (row[0]) {
            return { success: true, message: "Regulação pendente em aberto", data: row[0] };
        } else {
            return { success: true, message: "Nenhuma regulação pendente encontrada.", data: null};
        }
    } catch (error) {
        // Tratamento de erro
        console.error('Erro ao verificar regulacao:', error);
        return { success: false, message: "Erro ao carregar regulações.", error };
    }
}

// Exporta as funções
export { VerificaRegulacao, VerificaRegulacaoID };
