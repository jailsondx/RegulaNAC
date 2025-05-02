// UpdateStatus.js
async function UpdateStatus(id_regulacao, status, connection) {
    const DBtable = 'regulacao';

    try {
        const [updateResult] = await connection.query(
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
    }
}

export default UpdateStatus;
