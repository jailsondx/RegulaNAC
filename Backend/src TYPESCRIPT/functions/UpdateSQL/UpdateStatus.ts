import { DBconnection } from "../Controller/connection.js";
import { ResultSetHeader } from "mysql2";

async function UpdateStatus(id_regulacao: number, status: string) {
    const DBtable = 'regulacao';

    let connection;
    try {
        // Inicia a conexão com o banco de dados
        connection = await DBconnection.getConnection();

        // Atualiza os dados na tabela regulacao
        const [updateResult] = await connection.query<ResultSetHeader>(
            `UPDATE ${DBtable} 
             SET status_regulacao = ?
             WHERE id_regulacao = ?`,
            [status, id_regulacao]
        );

        if (updateResult.affectedRows === 0) {
            console.error('Nenhum registro foi atualizado: Verifique os valores de id_regulacao.');
            return { success: false, message: "Nenhum registro foi atualizado. Verifique os critérios fornecidos." };
        }

        return { success: true, message: "Regulação atualizada com sucesso." };

    } catch (error) {
        console.error('Erro na atualização:', error);
        return { success: false, message: "Erro ao atualizar regulação.", error };
    } finally {
        if (connection) connection.release(); // Libera a conexão no final
    }
}

export default UpdateStatus;
