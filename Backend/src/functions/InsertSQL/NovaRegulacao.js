import { DBconnection } from "../Controller/connection.js";
import UpdateLinkDOC from "../UpdateSQL/UpdateLinkTransactSQL.js";
import InsertRegulacaoMedico from "../InsertSQL/InsertRegulacaoMedico.js";
import { limparEspacos } from "../Manipulation/ClearString.js";

async function NovaRegulacao(FormData) {
    const DBtable = "regulacao";
    const DBtableUsuarios = "usuarios";
    const NovoStatus_Padrao = "ABERTO - AGUARDANDO AVALIACAO";
    const NovoStatus_Especial = "ABERTO - APROVADO - AGUARDANDO ORIGEM";

    let connection;

    try {
        // Define valores padrões
        FormData.nome_paciente = limparEspacos(FormData.nome_paciente);
        FormData.qtd_solicitacoes = 1;
        FormData.data_hora_solicitacao_02 = FormData.data_hora_solicitacao_01;

        // Lógica para status especial
        const origemDestinoEspecial =
            (FormData.un_origem === 'CENTRO CIRURGICO' &&
            ['CLINICA CIRURGICA I', 'CLINICA CIRURGICA II'].includes(FormData.un_destino)) ||

            (FormData.un_origem.startsWith('UTI ADULTO') &&
            FormData.un_destino === 'CLINICA CIRURGICA III');

        FormData.status_regulacao = origemDestinoEspecial
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
            console.error(`Usuário não encontrado: ID ${FormData.id_user}`);
            throw new Error(`Usuário não encontrado: ID ${FormData.id_user}`);
        }

        const userType = rowsUserPrivilege[0].tipo;
        if (userType === "MEDICO") {
            console.error(`Usuário ID: ${FormData.id_user} sem permissão para Nova Regulação`);
            await connection.rollback();
            return {
                success: false,
                message: "Usuário não tem permissão para realizar esta ação.",
            };
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
            await connection.rollback();
            return {
                success: false,
                message: "Erro ao inserir regulação - CODE R01."
            };
        }

        const id_regulacao = insertResult.insertId;

        // Se for um status especial, insere também em regulacao_medico
        if (FormData.status_regulacao === NovoStatus_Especial) {
            const medicoResult = await InsertRegulacaoMedico(id_regulacao, FormData.id_user, connection);
            if (!medicoResult.success) {
                await connection.rollback();
                return {
                    success: false,
                    message: "Erro ao inserir regulação - CODE R02."
                };
            }
        }

        // Atualiza o link do documento
        const updateLinkResult = await UpdateLinkDOC(FormData.num_regulacao, FormData.link, connection);
        if (!updateLinkResult.success) {
            await connection.rollback();
            return {
                success: false,
                message: updateLinkResult.message || "Erro ao atualizar PDF."
            };
        }

        await connection.commit();
        return { success: true, message: "Regulação cadastrada com sucesso." };

    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Erro no cadastro:", error);
        return { 
            success: false,
            message: "Erro ao cadastrar regulação.", 
            error 
        };
    } finally {
        if (connection) connection.release();
    }
}

export default NovaRegulacao;
