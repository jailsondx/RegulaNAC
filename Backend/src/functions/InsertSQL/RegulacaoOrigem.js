import { DBconnection } from "../Controller/connection.js";
import VerificaStatus from "../Checked/VerificaStatus.js";
import UpdateStatus from "../UpdateSQL/UpdateStatus.js";

async function RegulacaoOrigem(FormData) {
    const DBtable = "setor_origem";
    const DBtableUsuarios = "usuarios";
    const StatusAtual = "ABERTO - APROVADO - AGUARDANDO ORIGEM";
    const NovoStatus = "ABERTO - APROVADO - AGUARDANDO DESTINO";
    const msgError = "Origem não pode ser atualizado; Status atual é: ";

    try {
        // Inicia a conexão com o banco de dados
        const connection = await DBconnection.getConnection();

        // Verifica a permissão do usuário
        const [rowsUserPrivilege] = await connection.query(
            `SELECT tipo FROM ${DBtableUsuarios} WHERE id_user = ?`,
            [FormData.id_user]
        );

        if (rowsUserPrivilege.length === 0) {
            console.error("Usuário não encontrado: ID:", FormData.id_user);
            return { success: false, message: "Usuário não encontrado." };
        }

        const userType = rowsUserPrivilege[0].tipo;

        if (userType === "MEDICO") {
            console.error(`Usuário ID: ${FormData.id_user} sem permissão para Regulação Origem`);
            return {
                success: false,
                message: "Usuário não tem permissão para realizar esta ação.",
            };
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

        if (result.affectedRows === 0) {
            return {
                success: false,
                message: "Nenhum registro foi inserido. Verifique os dados enviados.",
            };
        }

        // Atualiza o status
        await UpdateStatus(FormData.id_regulacao, novoStatus, connection);

        return {
            success: true,
            message: "Regulação Origem: Cadastrada com Sucesso.",
        };
    } catch (error) {
        console.error("Erro no cadastro Regulação Origem:", error);
        return {
            success: false,
            message: "Erro ao cadastrar Regulação Origem.",
            error,
        };
    }
}

export default RegulacaoOrigem;
