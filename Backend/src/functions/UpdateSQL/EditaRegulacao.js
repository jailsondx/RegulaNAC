import { DBconnection } from "../Controller/connection.js";
//import VerificaStatus from "../Checked/VerificaStatus.js";
//import verificaRegulacao from "../Checked/VerificaRegulacao.js";

async function EditaRegulacao(FormData) {
    const DBtable = 'regulacao';
    const DBtableUsuarios = 'usuarios';
    const StatusAtual = 'ABERTO - AGUARDANDO AVALIACAO';
    const msgError = 'Regulação não pode ser atualizada; Status atual é: ';

    const connection = await DBconnection.getConnection();

    try {
        await connection.beginTransaction();

        // Verifica a permissão do usuário
        const [rowsUserPrivilege] = await connection.query(
            `SELECT tipo FROM ${DBtableUsuarios} WHERE id_user = ?`,
            [FormData.id_user]
        );

        if (rowsUserPrivilege.length === 0) {
            await connection.rollback();
            return { success: false, message: "Usuário não encontrado." };
        }

        const userType = rowsUserPrivilege[0].tipo;

        if (userType === 'MEDICO') {
            await connection.rollback();
            return { success: false, message: "Usuário não tem permissão para realizar esta ação." };
        }


        
        /*
        // Verifica status atual da regulação
        const statusCheck = await VerificaStatus(FormData.id_regulacao, StatusAtual, msgError);
        if (!statusCheck.success) {
            await connection.rollback();
            return { success: false, message: statusCheck.message };
        }

        // Verifica se o num_regulacao já está em uso por outro registro
        const regulacaoCheck = await verificaRegulacao(FormData.num_regulacao, FormData.id_regulacao);
        if (!regulacaoCheck.success) {
            await connection.rollback();
            return { success: false, message: regulacaoCheck.message };
        }
        */
        
        

        // Atualiza os dados
        await connection.query(`
            UPDATE ${DBtable}
            SET 
                id_user = ?, 
                un_origem = ?,
                un_destino = ?,
                nome_paciente = ?, 
                num_prontuario = ?, 
                data_nascimento = ?, 
                num_idade = ?, 
                num_regulacao = ?, 
                prioridade = ?, 
                nome_responsavel_nac = ?, 
                nome_regulador_medico = ? 
            WHERE id_regulacao = ?`,
            [
                FormData.id_user,
                FormData.un_origem,
                FormData.un_destino,
                FormData.nome_paciente,
                FormData.num_prontuario,
                FormData.data_nascimento,
                FormData.num_idade,
                FormData.num_regulacao,
                FormData.prioridade,
                FormData.nome_responsavel_nac,
                FormData.nome_regulador_medico,
                FormData.id_regulacao
            ]);

        await connection.commit();

        return { success: true, message: "Regulação editada com sucesso." };

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Erro na atualização:', error);
        return { success: false, message: "Erro ao atualizar regulação.", error };
    } finally {
        connection.release();
    }
}

export default EditaRegulacao;
