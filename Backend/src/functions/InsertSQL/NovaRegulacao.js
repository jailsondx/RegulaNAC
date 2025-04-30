import { DBconnection } from "../Controller/connection.js";
import UpdateLinkDOC from "../UpdateSQL/UpdateLink.js";

async function NovaRegulacao(FormData) {
    const DBtable = "regulacao";
    const DBtableUsuarios = "usuarios";

    try {
        // Define valores padrões
        FormData.qtd_solicitacoes = 1;
        FormData.data_hora_solicitacao_02 = FormData.data_hora_solicitacao_01;
        FormData.status_regulacao = "ABERTO - AGUARDANDO AVALIACAO";

        // Inicia a conexão
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
            console.error(`Usuário ID: ${FormData.id_user} sem permissão para nova regulação`);
            return {
                success: false,
                message: "Usuário não tem permissão para realizar esta ação.",
            };
        }


        // Insere os dados no banco
        await connection.query(
            `INSERT INTO ${DBtable} SET ?`,
            [FormData]
        );

        const updateLinkResult = await UpdateLinkDOC(FormData.num_regulacao, FormData.link);
        if (!updateLinkResult.success) {
            console.error('Erro ao gerar o link do documento:', updateLinkResult.message);
            connection.release();
            return { success: false, message: "Erro ao gerar o link do documento." };
        }

        return { success: true, message: "Regulação cadastrada com sucesso." };
    } catch (error) {
        console.error("Erro no cadastro:", error);
        return { success: false, message: "Erro ao cadastrar regulação.", error };
    }
}

export default NovaRegulacao;
