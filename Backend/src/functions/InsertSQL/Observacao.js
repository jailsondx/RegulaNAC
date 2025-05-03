import { DBconnection } from "../Controller/connection.js";

async function Observacao(FormData) {
    const DBtable = "observacao";
    const DBtableUsuarios = "usuarios";

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
            throw new Error(`Usuário ID: ${FormData.id_user} não tem permissão para fazer observações.`);
        }

        // Verifica se já existe uma observação para esse id_regulacao e tipo_observacao
        const [rowsExist] = await connection.query(
            `SELECT id_observacao FROM ${DBtable} WHERE id_regulacao = ?`,
            [FormData.id_regulacao]
        );

        if (rowsExist.length > 0) {
            // Atualiza a observação existente
            const idObs = rowsExist[0].id_observacao;
            await connection.query(
                `UPDATE ${DBtable} SET ? WHERE id_observacao = ?`,
                [FormData, idObs]
            );
        } else {
            // Insere nova observação
            await connection.query(
                `INSERT INTO ${DBtable} SET ?`,
                [FormData]
            );
        }

        await connection.commit();
        return { success: true, message: "Observação registrada com sucesso." };

    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Erro ao registrar observação:", error);
        return { success: false, message: "Erro ao registrar observação.", error };
    } finally {
        if (connection) connection.release();
    }
}

export default Observacao;
