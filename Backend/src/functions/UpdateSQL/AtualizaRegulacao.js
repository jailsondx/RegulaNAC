import { DBconnection } from "../Controller/connection.js"; // Importa apenas o objeto DBconnection
import VerificaStatus from "../Checked/VerificaStatus.js";

async function AtualizaRegulacao(FormData) {
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

        const [valueRequests] = await connection.query(
            `SELECT qtd_solicitacoes FROM ${DBtable} WHERE id_regulacao = ?`, 
            [FormData.id_regulacao]
        );
        
        if (valueRequests.length === 0) {
            console.error(`Regulação com ID ${FormData.id_regulacao} não encontrada.`);
            connection.release();
            return { success: false, message: "Regulação não encontrada." };
        }

        const qtdSolicitacoes = valueRequests[0].qtd_solicitacoes;
        console.log('SOLICITAÇÕES JÁ REALIZADAS:', qtdSolicitacoes);

        await connection.query(`
            UPDATE ${DBtable} 
            SET id_user = ?, un_origem = ?, un_destino = ?, data_hora_solicitacao_02 = ?, nome_regulador_nac = ?, qtd_solicitacoes = ?
            WHERE id_regulacao = ?`, [
                FormData.id_user, 
                FormData.un_origem, 
                FormData.un_destino, 
                FormData.data_hora_solicitacao_02,
                FormData.nome_regulador_nac,
                qtdSolicitacoes + 1, // Incrementa a quantidade de solicitações
                FormData.id_regulacao
            ]);

        connection.release();

        return { success: true, message: "Regulação atualizada com sucesso." };

    } catch (error) {
        if (connection) connection.release();
        console.error('Erro na atualização:', error);
        return { success: false, message: "Erro ao atualizar regulação.", error };
    }
}

export default AtualizaRegulacao;
