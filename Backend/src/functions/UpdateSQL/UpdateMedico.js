async function UpdateMedico(id_regulacao, nomeMedico, connection) {
    const DBtable = "regulacao";

    try {
        const [updateResult] = await connection.query(
            `UPDATE ${DBtable} 
             SET nome_regulador_medico = ?
             WHERE id_regulacao = ?`,
            [nomeMedico, id_regulacao]
        );

        if (updateResult.affectedRows === 0) {
            console.error("❌ Nenhum registro foi atualizado: Verifique o ID da regulação.");
            return {
                success: false,
                message: "Nenhum registro foi atualizado. Verifique os critérios fornecidos.",
            };
        }

        return { success: true, message: "Regulação atualizada com sucesso." };
    } catch (error) {
        console.error("❌ Erro na atualização:", error);
        return { success: false, message: "Erro ao atualizar regulação.", error };
    }
}

export default UpdateMedico;
