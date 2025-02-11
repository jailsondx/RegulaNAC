import { DBconnection } from "../Controller/connection.js"; // Importa apenas o objeto DBconnection
import { RowDataPacket } from "mysql2/promise"; // 🔹 Importa RowDataPacket para tipagem correta

async function VerificaProntuario(num_prontuario: string) {
    const DBtable = 'regulacao';

    try {
        // Inicie a conexão com o banco de dados
        const connection = await DBconnection.getConnection();

        // Execute a query para verificar o prontuário na tabela com LIMIT 1
        const [rows] = await connection.query<RowDataPacket[]>(
            `SELECT * FROM ${DBtable} WHERE num_prontuario = ? AND status_regulacao LIKE 'ABERTO%' LIMIT 1`,
            [num_prontuario]
        );

        connection.release(); // Libera a conexão

        // Verifica se há um resultado
        if (rows.length > 0) {
            return { success: true, message: "Regulação pendente em aberto", data: rows[0] };
        } else {
            return { success: true, message: "Nenhuma regulação pendente encontrada.", data: null };
        }
    } catch (error) {
        // Tratamento de erro
        console.error('Erro ao verificar prontuário:', error);
        return { success: false, message: "Erro ao carregar regulações.", error };
    }
}

export default VerificaProntuario;
