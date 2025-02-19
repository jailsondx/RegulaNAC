import { DBconnection } from "../Controller/connection.js";
import VerificaStatus from "../Checked/VerificaStatus.js";
import UpdateStatus from "../UpdateSQL/UpdateStatus.js";

async function Desfecho(FormData) {
    const DBtable = 'desfecho';
    const DBtableUsuarios = 'usuarios';
    const DesfechoForcado = FormData.forcado;
    const StatusAtual = 'ABERTO - APROVADO - AGUARDANDO DESFECHO';
    const NovoStatus = 'FECHADO';
    const msgError = 'Desfecho não pode ser atualizado; Status atual é: ';

    let connection;
    try {
        // Inicia a conexão com o banco de dados
        connection = await DBconnection.getConnection();

        // Verifica a permissão do usuário
        const [rowsUserPrivilege] = await connection.query(
            `SELECT tipo FROM ${DBtableUsuarios} WHERE id_user = ?`,
            [FormData.id_user]
        );

        if (rowsUserPrivilege.length === 0) {
            console.error('Usuário não encontrado: ID:', FormData.id_user);
            return { success: false, message: "Usuário não encontrado." };
        }

        const userType = rowsUserPrivilege[0].tipo;

        if (userType === 'MEDICO') {
            console.error(`Usuário ID: ${FormData.id_user} não tem permissão.`);
            return { success: false, message: "Usuário não tem permissão para realizar esta ação." };
        }

        // Verifica o status da regulação, caso não seja um desfecho forçado
        if (!DesfechoForcado) {
            const statusCheck = await VerificaStatus(FormData.id_regulacao, StatusAtual, msgError);
            if (!statusCheck.success) {
                return { success: false, message: statusCheck.message };
            }
        }

        // Insere os dados no banco
        const [result] = await connection.query(
            `INSERT INTO ${DBtable} SET ?`,
            [FormData]
        );

        if (result.affectedRows === 0) {
            return { success: false, message: "Falha ao cadastrar desfecho." };
        }

        // Atualiza o status
        await UpdateStatus(FormData.id_regulacao, NovoStatus);

        return { success: true, message: "Desfecho cadastrado com sucesso." };

    } catch (error) {
        console.error('Erro no cadastro de desfecho:', error);
        return { success: false, message: "Erro ao cadastrar desfecho.", error };
    } finally {
        if (connection) connection.release(); // Libera a conexão no final
    }
}

export default Desfecho;
