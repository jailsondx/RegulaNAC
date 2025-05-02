import { DBconnection } from "../Controller/connection.js";
import VerificaStatus from "../Checked/VerificaStatus.js";
import UpdateStatus from "../UpdateSQL/UpdateStatus.js";

async function RegulacaoOrigem(FormData) {
    const DBtable = "setor_origem";
    const DBtableUsuarios = "usuarios";
    const StatusAtual = "ABERTO - APROVADO - AGUARDANDO ORIGEM";
    const NovoStatus = "ABERTO - APROVADO - AGUARDANDO DESTINO";
    const msgError = "Origem não pode ser atualizada; Status atual é: ";

    let connection;

    try {
        // Inicia a conexão com o banco de dados
        connection = await DBconnection.getConnection();
        await connection.beginTransaction(); // ⬅️ Início da transação

        // Verifica a permissão do usuário
        const [rowsUserPrivilege] = await connection.query(
            `SELECT tipo FROM ${DBtableUsuarios} WHERE id_user = ?`,
            [FormData.id_user]
        );

        if (rowsUserPrivilege.length === 0) {
            console.error("Usuário não encontrado: ID:", FormData.id_user);
            await connection.rollback();
            return { success: false, message: "Usuário não encontrado." };
        }

        const userType = rowsUserPrivilege[0].tipo;

        if (userType === "MEDICO") {
            console.error(`Usuário ID: ${FormData.id_user} sem permissão para Regulação Origem`);
            await connection.rollback();
            return {
                success: false,
                message: "Usuário não tem permissão para realizar esta ação.",
            };
        }

        // Verifica o status da regulação
        const statusCheck = await VerificaStatus(FormData.id_regulacao, StatusAtual, msgError);

        if (!statusCheck.success) {
            await connection.rollback();
            return { success: false, message: statusCheck.message };
        }

        // Verifica se já existe um destino com o mesmo ID da regulação
        const [existingRecord] = await connection.query(
            `SELECT * FROM ${DBtable} WHERE id_regulacao = ?`,
            [FormData.id_regulacao]
        );

        if (existingRecord.length > 0) {
            // Se o registro existir, realiza a atualização
            const [updateResult] = await connection.query(
                `UPDATE ${DBtable} SET ? WHERE id_regulacao = ?`,
                [FormData, FormData.id_regulacao]
            );

            if (updateResult.affectedRows === 0) {
                await connection.rollback();
                return {
                    success: false,
                    message: "Nenhuma atualização realizada. Verifique os dados.",
                };
            }

            console.log(`Origem atualizada para a regulação ${FormData.id_regulacao}`);
        } else {
            // Caso não exista, insere um novo registro
            const [insertResult] = await connection.query(
                `INSERT INTO ${DBtable} SET ?`,
                [FormData]
            );

            if (insertResult.affectedRows === 0) {
                await connection.rollback();
                return {
                    success: false,
                    message: "Nenhum registro foi inserido. Verifique os dados enviados.",
                };
            }

            console.log(`Nova origem inserida para a regulação ${FormData.id_regulacao}`);
        }

        // Atualiza o status da regulação, usando a mesma conexão
        const statusResult = await UpdateStatus(FormData.id_regulacao, NovoStatus, connection);

        if (!statusResult.success) {
            await connection.rollback();
            return {
                success: false,
                message: "Erro ao atualizar status da regulação.",
            };
        }

        await connection.commit(); // ⬅️ Confirma todas as alterações
        connection.release(); // Libera a conexão
        return {
            success: true,
            message: "Regulação Origem: Cadastrada/Atualizada com Sucesso.",
        };

    } catch (error) {
        if (connection) {
            await connection.rollback(); // ⬅️ Reverte tudo em caso de erro
            connection.release();
        }
        console.error("Erro no cadastro Regulação Origem:", error);
        return {
            success: false,
            message: "Erro ao cadastrar/atualizar Regulação Origem.",
            error,
        };
    }
}

export default RegulacaoOrigem;
