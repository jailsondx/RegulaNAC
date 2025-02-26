import { DBconnection } from "../Controller/connection.js"; // Importa apenas o objeto DBconnection

async function VerificaID(id_regulacao) {
    const DBtable = 'regulacao';

    try {
        // Inicie a conexão com o banco de dados
        const connection = await DBconnection.getConnection();

        // Execute a query para verificar o prontuário na tabela com LIMIT 1
        const [rows] = await connection.query(
            `SELECT * FROM ${DBtable} WHERE id_regulacao = ? AND status_regulacao LIKE 'ABERTO%' LIMIT 1`,
            [id_regulacao]
        );

        if (rows.length > 0) {
            connection.release(); // Libera a conexão
            return { success: true, message: "Regulação pendente em aberto", data: rows[0] };
        } else {
            connection.release(); // Libera a conexão
            return { success: true, message: "Nenhuma regulação pendente encontrada.", data: null };
        }
    } catch (error) {
        // Tratamento de erro
        console.error('Erro ao verificar prontuário:', error);
        return { success: false, message: "Erro ao carregar regulações.", error };
    }
}

export default VerificaID;
