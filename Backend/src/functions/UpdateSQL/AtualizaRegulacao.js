import { DBconnection } from "../Controller/connection.js"; // Importa apenas o objeto DBconnection
//import VerificaStatus from "../Checked/VerificaStatus.js";
import UpdateLinkDOC from "./UpdateLinkTransactSQL.js";

async function AtualizaRegulacao(FormData) {
    const DBtable = 'regulacao';
    const DBtableUsuarios = 'usuarios';

    const connection = await DBconnection.getConnection();

    try {
        // Inicia a transação
        await connection.beginTransaction();

        // Verifica a permissão do usuário
        const [rowsUserPrivilege] = await connection.query(
            `SELECT tipo FROM ${DBtableUsuarios} WHERE id_user = ?`,
            [FormData.id_user]
        );

        if (rowsUserPrivilege.length === 0) {
            console.error('❌ Usuário não encontrado:', FormData.id_user);
            await connection.rollback();
            return { success: false, message: "Usuário não encontrado." };
        }

        const userType = rowsUserPrivilege[0].tipo;
        if (userType === 'MEDICO') {
            console.error(`❌ Usuário ID: ${FormData.id_user} - Sem permissão para atualizar regulação.`);
            await connection.rollback();
            return {
                success: false,
                message: "Usuário não tem permissão para realizar esta ação."
            };
        }

        // Busca a quantidade de solicitações atual
        const [valueRequests] = await connection.query(
            `SELECT qtd_solicitacoes FROM ${DBtable} WHERE id_regulacao = ?`,
            [FormData.id_regulacao]
        );

        if (valueRequests.length === 0) {
            console.error(`❌ Regulação não encontrada: ID ${FormData.id_regulacao}`);
            await connection.rollback();
            return { success: false, message: "Regulação não encontrada." };
        }

        // Atualiza os dados da regulação
        await connection.query(`
            UPDATE ${DBtable} 
            SET 
                id_user = ?,
                data_hora_solicitacao_02 = ?, 
                data_hora_acionamento_medico = ?, -- mesmo valor da solicitação
                nome_responsavel_nac = ?
            WHERE id_regulacao = ?
        `, [
            FormData.id_user,
            FormData.data_hora_solicitacao_02,
            FormData.data_hora_solicitacao_02,
            FormData.nome_responsavel_nac,
            FormData.id_regulacao
        ]);

        // Atualiza o link do documento vinculado
        const updateLinkResult = await UpdateLinkDOC(FormData.num_regulacao, FormData.link, connection);
        if (!updateLinkResult.success) {
            console.error('❌ Erro ao atualizar link do documento:', updateLinkResult.message);
            await connection.rollback();
            return { success: false, message: "Erro ao atualizar o link do documento." };
        }

        // Commit das alterações
        await connection.commit();

        return { success: true, message: "Regulação atualizada com sucesso." };

    } catch (error) {
        // Reverte a transação em caso de erro
        await connection.rollback();
        console.error('❌ Erro na atualização da regulação:', error);
        return { success: false, message: "Erro ao atualizar regulação.", error };
    } finally {
        // Libera a conexão
        connection.release();
    }
}

export default AtualizaRegulacao;
