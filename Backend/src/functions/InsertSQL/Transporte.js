import { DBconnection } from "../Controller/connection.js";
import VerificaStatus from "../Checked/VerificaStatus.js";
import UpdateStatus from "../UpdateSQL/UpdateStatus.js";

async function saveTransporte(FormData) {
    const DBtable = "transporte";
    const DBtableUsuarios = "usuarios";
    const StatusAtual = "ABERTO - APROVADO - AGUARDANDO ACIONAMENTO TRANSPORTE";
    const NovoStatus = "ABERTO - APROVADO - AGUARDANDO FINALIZACAO TRANSPORTE";
    const msgError = "Acionamento do Transporte não pode ser realizado; Status atual é: ";

    try {
        // Inicia a conexão com o banco de dados
        const connection = await DBconnection.getConnection();

        // Verifica a permissão do usuário
        const [rowsUserPrivilege] = await connection.query(
            `SELECT tipo FROM ${DBtableUsuarios} WHERE id_user = ?`, 
            [FormData.id_user]
        );

        connection.release(); // Libera a conexão

        if (rowsUserPrivilege.length === 0) {
            console.error("Usuário não encontrado: ID:", FormData.id_user);
            return { success: false, message: "Usuário não encontrado." };
        }

        const userType = rowsUserPrivilege[0].tipo;

        if (userType === "MEDICO") {
            console.error(`Usuário ID: ${FormData.id_user} não tem permissão para Acionamento de Transporte.`);
            return { success: false, message: "Usuário não tem permissão para realizar esta ação." };
        }

        // Verifica o status da regulação
        const statusCheck = await VerificaStatus(FormData.id_regulacao, StatusAtual, msgError);

        if (!statusCheck.success) {
            return { success: false, message: statusCheck.message };
        }

        // Insere os dados no banco
        const [result] = await connection.query(
            `INSERT INTO ${DBtable} SET ?`,
            [FormData]
        );

        if (result.affectedRows > 0) {
            await UpdateStatus(FormData.id_regulacao, NovoStatus);
            return { success: true, message: "Transporte cadastrado com sucesso." };
        } else {
            throw new Error("Erro ao inserir no banco de dados.");
        }
    } catch (error) {
        console.error("Erro no cadastro de transporte:", error);
        return { success: false, message: "Erro ao cadastrar Transporte.", error };
    }
}

export default saveTransporte;
