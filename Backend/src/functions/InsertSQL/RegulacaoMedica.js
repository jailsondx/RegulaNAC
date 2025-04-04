import { DBconnection } from "../Controller/connection.js";
import UpdateStatus from "../UpdateSQL/UpdateStatus.js";
import UpdateMedico from "../UpdateSQL/UpdateMedico.js";

async function RegulacaoMedica(FormData) {
    const DBtable = "regulacao_medico";
    const DBtableUsuarios = "usuarios";
    const NovoStatusApproved = "ABERTO - APROVADO - AGUARDANDO ORIGEM";
    const NovoStatusDeny = "NEGADO";

    try {
        // Inicia a conexão com o banco de dados
        const connection = await DBconnection.getConnection();

        // Verifica a permissão do usuário
        const [rows] = await connection.query(
            `SELECT tipo FROM ${DBtableUsuarios} WHERE id_user = ?`,
            [FormData.id_user]
        );

        if (rows.length === 0) {
            console.error("Usuário não encontrado: ID:", FormData.id_user);
            return { success: false, message: "Usuário não encontrado." };
        }

        const userType = rows[0].tipo;

        if (userType !== "MEDICO") {
            console.error(`Usuário ID: ${FormData.id_user} sem permissão para Regulação Médica`);
            return {
                success: false,
                message: "Usuário não tem permissão para realizar esta ação.",
            };
        }

        //Verifica se é LEITO EXTRA
        if (FormData.extra === true || FormData.extra === 1){
            FormData.num_leito = 'EXTRA.' + FormData.num_leito;
        }

        // Insere os dados no banco
        const [result] = await connection.query(
            `INSERT INTO ${DBtable} SET ?`,
            [FormData]
        );

        if (result.affectedRows === 0) {
            throw new Error("Erro ao inserir no banco de dados.");
        }

        // Atualiza o status de regulação e médico responsável
        const novoStatus = FormData.vaga_autorizada
            ? NovoStatusApproved
            : NovoStatusDeny;

        await UpdateStatus(FormData.id_regulacao, novoStatus);
        await UpdateMedico(FormData.id_regulacao, FormData.nome_regulador_medico);

        return {
            success: true,
            message: `Regulação Médica: ${FormData.vaga_autorizada ? "Aprovada" : "Negada"}.`,
        };
    } catch (error) {
        console.error("Erro no cadastro:", error);
        if (error.code === "ER_DUP_ENTRY") {
            return {
                success: false,
                message: "Entrada duplicada: já existe um registro com os mesmos dados.",
            };
        }
        return {
            success: false,
            message: "Erro ao cadastrar regulação.",
            error,
        };
    }
}

export default RegulacaoMedica;
