import { DBconnection } from "../Controller/connection.js";
import UpdateLinkDOC from "../UpdateSQL/UpdateLinkTransactSQL.js";
import InsertRegulacaoMedico from "../InsertSQL/InsertRegulacaoMedico.js";

async function NovaRegulacao(FormData) {
    const DBtable = "regulacao";
    const DBtableUsuarios = "usuarios";
    const NovoStatus_Padrao = "ABERTO - AGUARDANDO AVALIACAO";
    const NovoStatus_Especial = "ABERTO - APROVADO - AGUARDANDO ORIGEM";

    let connection;

    console.log("Idempotency key recebida:", FormData.idempotency_key, "Para Nova Regulação:", FormData.num_regulacao);

    try {
        // Define valores padrões
        FormData.qtd_solicitacoes = 1;
        FormData.data_hora_solicitacao_02 = FormData.data_hora_solicitacao_01;

        // Lógica para status especial
        const origemEspecial = FormData.un_origem === 'CENTRO CIRURGICO';
        const destinoEspecial = ['CLINICA CIRURGICA I', 'CLINICA CIRURGICA II'].includes(FormData.un_destino);

        FormData.status_regulacao = (origemEspecial && destinoEspecial)
            ? NovoStatus_Especial
            : NovoStatus_Padrao;

        connection = await DBconnection.getConnection();
        await connection.beginTransaction();

        // Checa se já existe essa operação (idempotente)
        const [checkIdempotency] = await connection.query(
            `SELECT id_regulacao FROM ${DBtable} WHERE idempotency_key = ?`,
            [FormData.idempotency_key]
        );
        
        if (checkIdempotency.length > 0) {
            await connection.rollback();
            return {
            success: false,
            message: "Regulação registrada, verifique as listas.",
            id_regulacao: checkIdempotency[0].id_regulacao,
            };
        }
  

        // Verifica a permissão do usuário
        const [rowsUserPrivilege] = await connection.query(
            `SELECT tipo FROM ${DBtableUsuarios} WHERE id_user = ?`,
            [FormData.id_user]
        );

        if (rowsUserPrivilege.length === 0) {
            throw new Error(`Usuário não encontrado: ID ${FormData.id_user}`);
        }

        const userType = rowsUserPrivilege[0].tipo;
        if (userType === "MEDICO") {
            throw new Error(`Usuário ID ${FormData.id_user} não tem permissão para nova regulação.`);
        }

        // Insere os dados
        const [insertResult] = await connection.query(
            `INSERT INTO ${DBtable} SET ?`,
            [{
              ...FormData,
              idempotency_key: FormData.idempotency_key,
            }]
          );
          

        if (insertResult.affectedRows === 0) {
            throw new Error("Erro ao inserir regulação.");
        }

        const id_regulacao = insertResult.insertId;

        // Se for um status especial, insere também em regulacao_medico
        if (FormData.status_regulacao === NovoStatus_Especial) {
            //const InsertRegulacaoMedico = (await import("../InsertSQL/InsertRegulacaoMedico.js")).default;
            const medicoResult = await InsertRegulacaoMedico(id_regulacao, FormData.id_user, connection);
            if (!medicoResult.success) {
                throw new Error(medicoResult.message);
            }
        }

        // Atualiza o link do documento
        const updateLinkResult = await UpdateLinkDOC(FormData.num_regulacao, FormData.link, connection);
        if (!updateLinkResult.success) {
            throw new Error(updateLinkResult.message || "Erro ao atualizar link.");
        }

        await connection.commit();
        return { success: true, message: "Regulação cadastrada com sucesso." };

    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Erro no cadastro:", error);
        return { success: false, message: "Erro ao cadastrar regulação.", error };
    } finally {
        if (connection) connection.release();
    }
}

export default NovaRegulacao;
