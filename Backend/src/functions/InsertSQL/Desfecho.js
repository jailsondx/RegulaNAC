import { DBconnection } from "../Controller/connection.js";
import UpdateStatus from "../UpdateSQL/UpdateStatus.js";

async function Desfecho(FormData) {
    const DBtable = "desfecho";
    const DBtableUsuarios = "usuarios";
    const NovoStatus = "FECHADO";

    let connection;

    try {
        connection = await DBconnection.getConnection();
        await connection.beginTransaction();

        // Verifica a permissão do usuário
        const [rowsUserPrivilege] = await connection.query(
            `SELECT tipo FROM ${DBtableUsuarios} WHERE id_user = ?`,
            [FormData.id_user]
        );

        if (rowsUserPrivilege.length === 0) {
            throw new Error(`Usuário não encontrado: ID: ${FormData.id_user}`);
        }

        const userType = rowsUserPrivilege[0].tipo;
        if (userType === "MEDICO") {
            throw new Error(`Usuário ID: ${FormData.id_user} não tem permissão para desfecho.`);
        }

        // Verifica se já existe um desfecho para a regulação
        const [existing] = await connection.query(
            `SELECT * FROM ${DBtable} WHERE id_regulacao = ?`,
            [FormData.id_regulacao]
        );

        if (existing.length > 0) {
            // Atualiza se já existir
            const [updateResult] = await connection.query(
                `UPDATE ${DBtable} SET ? WHERE id_regulacao = ?`,
                [FormData, FormData.id_regulacao]
            );
            if (updateResult.affectedRows === 0) {
                throw new Error("Erro ao atualizar o desfecho.");
            }
        } else {
            // Insere se não existir
            const [insertResult] = await connection.query(
                `INSERT INTO ${DBtable} SET ?`,
                [FormData]
            );
            if (insertResult.affectedRows === 0) {
                throw new Error("Erro ao inserir o desfecho.");
            }
        }

        // Atualiza o status da regulação
        const statusUpdate = await UpdateStatus(FormData.id_regulacao, NovoStatus, connection);
        if (!statusUpdate.success) {
            throw new Error(statusUpdate.message || "Erro ao atualizar status.");
        }

        await connection.commit();
        return { success: true, message: "Desfecho cadastrado/atualizado com sucesso." };

    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Erro no cadastro de desfecho:", error);
        return { success: false, message: "Erro ao cadastrar/atualizar desfecho.", error };
    } finally {
        if (connection) connection.release();
    }
}

export default Desfecho;
