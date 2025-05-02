import { DBconnection } from "../Controller/connection.js";
import VerificaStatus from "../Checked/VerificaStatus.js";
import UpdateStatus from "../UpdateSQL/UpdateStatus.js";

async function saveTransporte(FormData) {
    const DBtable = "transporte";
    const DBtableUsuarios = "usuarios";
    const StatusAtual = "ABERTO - APROVADO - AGUARDANDO ACIONAMENTO TRANSPORTE";
    const NovoStatus = "ABERTO - APROVADO - AGUARDANDO FINALIZACAO TRANSPORTE";
    const msgError = "Acionamento do Transporte não pode ser realizado; Status atual é: ";

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
            throw new Error(`Usuário ID: ${FormData.id_user} não tem permissão para Acionamento de Transporte.`);
        }

        // Verifica o status da regulação
        const statusCheck = await VerificaStatus(FormData.id_regulacao, StatusAtual, msgError);
        if (!statusCheck.success) {
            throw new Error(statusCheck.message);
        }

        // Verifica se já existe um transporte com o mesmo ID de regulação
        const [existingRecord] = await connection.query(
            `SELECT * FROM ${DBtable} WHERE id_regulacao = ?`,
            [FormData.id_regulacao]
        );

        if (existingRecord.length > 0) {
            // Se o transporte já existir, realiza a atualização
            const [updateResult] = await connection.query(
                `UPDATE ${DBtable} SET ? WHERE id_regulacao = ?`,
                [FormData, FormData.id_regulacao]
            );

            if (updateResult.affectedRows === 0) {
                throw new Error("Erro ao atualizar transporte no banco de dados.");
            }

            console.log(`Transporte atualizado para a regulação ${FormData.id_regulacao}`);
        } else {
            // Caso não exista, insere um novo registro
            const [insertResult] = await connection.query(
                `INSERT INTO ${DBtable} SET ?`,
                [FormData]
            );

            if (insertResult.affectedRows === 0) {
                throw new Error("Erro ao inserir no banco de dados.");
            }

            console.log(`Novo transporte inserido para a regulação ${FormData.id_regulacao}`);
        }

        // Atualiza o status
        const updateResult = await UpdateStatus(FormData.id_regulacao, NovoStatus, connection);
        if (!updateResult.success) {
            throw new Error(updateResult.message);
        }

        await connection.commit();
        return { success: true, message: "Transporte cadastrado/atualizado com sucesso." };

    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Erro no cadastro de transporte:", error);
        return { success: false, message: "Erro ao cadastrar/atualizar Transporte.", error };
    } finally {
        if (connection) connection.release();
    }
}

export default saveTransporte;
