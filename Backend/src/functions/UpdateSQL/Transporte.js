import { DBconnection } from "../Controller/connection.js"; // Importa apenas o objeto DBconnection
import VerificaStatus from "../Checked/VerificaStatus.js";
import UpdateStatus from "./UpdateStatus.js";

async function updateTransporte(FormData) {
    const DBtable = 'transporte';
    const DBtableUsuarios = 'usuarios';
    const StatusAtual = 'ABERTO - APROVADO - AGUARDANDO FINALIZACAO TRANSPORTE';
    const NovoStatus = 'ABERTO - APROVADO - AGUARDANDO DESFECHO';
    const msgError = 'Finalização do Transporte não pode ser realizado; Status atual é: ';

    let connection;

    try {
        // Inicie a conexão com o banco de dados
        connection = await DBconnection.getConnection();
        await connection.beginTransaction();  // Inicia a transação

        // Verifica a permissão do usuário
        const [rowsUserPrivilege] = await connection.query(
            `SELECT tipo FROM ${DBtableUsuarios} WHERE id_user = ?`, 
            [FormData.id_user]
        );

        if (rowsUserPrivilege.length === 0) {
            console.error('Usuário não encontrado: ID:', FormData.id_user);
            await connection.rollback(); // Reverte a transação em caso de erro
            return { success: false, message: "Usuário não encontrado." };
        }

        const userType = rowsUserPrivilege[0].tipo;

        if (userType === 'MEDICO') {
            console.error(`Usuário ID: ${FormData.id_user} - Sem permissão para atualizar regulação.`);
            await connection.rollback(); // Reverte a transação em caso de erro
            return { success: false, message: "Usuário não tem permissão para realizar esta ação." };
        }

        // Verifica o status da regulação
        const statusCheck = await VerificaStatus(FormData.id_regulacao, StatusAtual, msgError);

        if (!statusCheck.success) {
            await connection.rollback(); // Reverte a transação em caso de erro
            return { success: false, message: statusCheck.message };
        }

        // Atualiza os dados no banco
        await connection.query(
            `UPDATE ${DBtable} SET ? WHERE id_regulacao = ?`, 
            [FormData, FormData.id_regulacao]
        );

        // Atualiza o status da regulação
        await UpdateStatus(FormData.id_regulacao, NovoStatus);

        // Confirma as alterações na transação
        await connection.commit();

        return { success: true, message: "Transporte atualizado com sucesso." };

    } catch (error) {
        if (connection) await connection.rollback(); // Reverte a transação em caso de erro
        console.error('Erro ao atualizar Transporte:', error);
        return { success: false, message: "Erro ao atualizar Transporte.", error };
    } finally {
        if (connection) {
            connection.release(); // Libera a conexão, independentemente de sucesso ou erro
        }
    }
}

export default updateTransporte;
