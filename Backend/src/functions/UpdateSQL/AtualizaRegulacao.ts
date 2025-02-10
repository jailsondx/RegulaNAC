import { DBconnection } from "../Controller/connection.js"; // Importa apenas o objeto DBconnection
import { RowDataPacket } from "mysql2/promise"; // Importa RowDataPacket para tipagem correta
import VerificaStatus from "../Checked/VerificaStatus.js";

/*IMPORT INTERFACES*/
import { RegulacaoData } from "../../Interfaces/Regulacao.js";

async function AtualizaRegulacao(FormData: RegulacaoData) {
    const DBtable = 'regulacao';
    const DBtableUsuarios = 'usuarios';
    const StatusAtual = 'ABERTO - AGUARDANDO AVALIACAO';
    const msgError = 'Regulação não pode ser atualizada; Status atual é: ';

    try {
        // Inicie a conexão com o banco de dados
        const connection = await DBconnection.getConnection();

        // Verifica a permissão do usuário
        const [rowsUserPrivilege] = await connection.query<RowDataPacket[]>(
            `SELECT tipo FROM ${DBtableUsuarios} WHERE id_user = ?`, 
            [FormData.id_user]
        );

        if (rowsUserPrivilege.length === 0) {
            // Usuário não encontrado
            console.error('Usuário não encontrado: ID:', FormData.id_user);
            connection.release(); // Libera a conexão
            return { success: false, message: "Usuário não encontrado." };
        }

        const userType = rowsUserPrivilege[0].tipo;

        if (userType === 'MEDICO') {
            // Usuário sem permissão
            console.error('\nUsuário ID: ' + FormData.id_user + ' \nSem permissão para atualizar regulação.\n');
            connection.release(); // Libera a conexão
            return { success: false, message: "Usuário não tem permissão para realizar esta ação." };
        }

        // Verifica o status da regulação
        const statusCheck = await VerificaStatus(FormData.id_regulacao, StatusAtual, msgError);

        if (!statusCheck.success) {
            // Retorna a mensagem de erro da VerificaStatus
            return { success: false, message: statusCheck.message };
        }

        const [valueRequests] = await connection.query<RowDataPacket[]>(
            `SELECT qtd_solicitacoes
             FROM ${DBtable}
             WHERE id_regulacao = ?`,
            [FormData.id_regulacao]
        );
                
        // Acesso correto ao valor de qtd_solicitacoes
        const qtdSolicitacoes = valueRequests[0].qtd_solicitacoes;
        console.log('SOL JA REALIZADAS:', qtdSolicitacoes);
        
        // Atualização correta da query<RowDataPacket[]>
        await connection.query<RowDataPacket[]>(
            `UPDATE ${DBtable} 
             SET id_user = ?, un_origem = ?, un_destino = ?, data_hora_solicitacao_02 = ?, nome_regulador_nac = ?, qtd_solicitacoes = ?
             WHERE id_regulacao = ?`,
            [
                FormData.id_user, 
                FormData.un_origem, 
                FormData.un_destino, 
                FormData.data_hora_solicitacao_02,
                FormData.nome_regulador_nac,
                qtdSolicitacoes + 1, // Valor existente + 1
                FormData.id_regulacao
            ]
        );

        connection.release(); // Libera a conexão

        return { success: true, message: "Regulação atualizada com sucesso." };

    } catch (error) {
        // Tratamento de erro
        console.error('Erro na atualização:', error);
        return { success: false, message: "Erro ao atualizar regulação.", error };
    }
}

export default AtualizaRegulacao;
