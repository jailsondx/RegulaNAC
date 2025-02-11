import { DBconnection } from "../Controller/connection.js";

async function UpdateMedico(id_regulacao, nomeMedico) {
    const DBtable = "regulacao";

    let connection;

    try {
        // Inicia a conexão com o banco de dados
        connection = await DBconnection.getConnection();

        // Atualiza os dados na tabela regulacao
        const [updateResult] = await connection.query(
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
    } catch (error) {
        if (connection) connection.release();
        // Tratamento de erro
        console.error("❌ Erro na atualização:", error);
        return { success: false, message: "Erro ao atualizar regulação.", error };
    }
}

export default UpdateMedico;
