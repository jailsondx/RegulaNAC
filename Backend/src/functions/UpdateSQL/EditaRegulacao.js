import { DBconnection } from "../Controller/connection.js"; // Importa apenas o objeto DBconnection
import VerificaStatus from "../Checked/VerificaStatus.js";

async function EditaRegulacao(FormData) {
    const DBtable = 'regulacao';
    const DBtableUsuarios = 'usuarios';
    const StatusAtual = 'ABERTO - AGUARDANDO AVALIACAO';
    const msgError = 'Regulação não pode ser atualizada; Status atual é: ';

    let connection;

    try {
        // Inicie a conexão com o banco de dados
        connection = await DBconnection.getConnection();

        // Verifica a permissão do usuário
        const [rowsUserPrivilege] = await connection.query(
            `SELECT tipo FROM ${DBtableUsuarios} WHERE id_user = ?`, 
            [FormData.id_user]
        );

        if (rowsUserPrivilege.length === 0) {
            console.error('Usuário não encontrado: ID:', FormData.id_user);
            connection.release();
            return { success: false, message: "Usuário não encontrado." };
        }

        const userType = rowsUserPrivilege[0].tipo;

        if (userType === 'MEDICO') {
            console.error(`Usuário ID: ${FormData.id_user} - Sem permissão para atualizar regulação.`);
            connection.release();
            return { success: false, message: "Usuário não tem permissão para realizar esta ação." };
        }

        // Verifica o status da regulação
        const statusCheck = await VerificaStatus(FormData.id_regulacao, StatusAtual, msgError);
        if (!statusCheck.success) {
            return { success: false, message: statusCheck.message };
        }

        await connection.query(`
            UPDATE ${DBtable} 
            SET id_user = ?,
                nome_paciente = ?, 
                num_prontuario = ?, 
                data_nascimento = ?, 
                num_idade = ?, 
                num_regulacao = ?, 
                prioridade = ?, 
                nome_regulador_nac = ?, 
                nome_regulador_medico = ? 
            WHERE id_regulacao = ?`, 
            [
                FormData.id_user,
                FormData.nome_paciente,
                FormData.num_prontuario,
                FormData.data_nascimento,
                FormData.num_idade,
                FormData.num_regulacao,
                FormData.prioridade,
                FormData.nome_regulador_nac,
                FormData.nome_regulador_medico,
                FormData.id_regulacao
            ]);

        connection.release();

        return { success: true, message: "Regulação editada com sucesso." };

    } catch (error) {
        if (connection) connection.release();
        console.error('Erro na atualização:', error);
        return { success: false, message: "Erro ao atualizar regulação.", error };
    }
}

export default EditaRegulacao;
