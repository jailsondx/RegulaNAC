import { DBconnection } from "../Controller/connection.js";
import { ResultSetHeader } from "mysql2";

async function UpdateMedico(id_regulacao: number, nomeMedico: string) {
    const DBtable = "regulacao";

    try {
        // Inicia a conexão com o banco de dados
        const connection = await DBconnection.getConnection();

        // Atualiza os dados na tabela regulacao
        const [updateResult] = await connection.query<ResultSetHeader>(
            `UPDATE ${DBtable} 
             SET nome_regulador_medico = ?
             WHERE id_regulacao = ?`,
            [nomeMedico, id_regulacao]
        );

        connection.release(); // Libera a conexão

        if (updateResult.affectedRows === 0) {
            console.error("❌ Nenhum registro foi atualizado: Verifique o ID da regulação.");
            return {
                success: false,
                message: "Nenhum registro foi atualizado. Verifique os critérios fornecidos.",
            };
        }

        return { success: true, message: "Regulação atualizada com sucesso." };
    } catch (error: any) {
        // Tratamento de erro
        console.error("❌ Erro na atualização:", error);
        return { success: false, message: "Erro ao atualizar regulação.", error };
    }
}

export default UpdateMedico;
