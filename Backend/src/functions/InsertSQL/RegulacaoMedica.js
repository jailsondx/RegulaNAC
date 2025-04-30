import { DBconnection } from "../Controller/connection.js";
import UpdateStatus from "../UpdateSQL/UpdateStatus.js";
import UpdateMedico from "../UpdateSQL/UpdateMedico.js";
import UpdateUnDestino from "../UpdateSQL/UpdateUnDestino.js";
import { filterFields } from "../Manipulation/filterFields.js";

async function RegulacaoMedica(FormData) {
    const DBtable = "regulacao_medico";
    const DBtableUsuarios = "usuarios";
    const NovoStatusApproved = "ABERTO - APROVADO - AGUARDANDO ORIGEM";
    const NovoStatusDeny = "NEGADO";

    try {
        const connection = await DBconnection.getConnection();

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
            return {
                success: false,
                message: "Usuário não tem permissão para realizar esta ação.",
            };
        }

        if (FormData.extra === true || FormData.extra === 1) {
            FormData.num_leito = 'EXTRA.' + FormData.num_leito;
        }

        const allowedFields = [
            'id_user',
            'vaga_autorizada',
            'num_leito',
            'extra',
            'justificativa_neg',
            'nome_regulador_medico',
            'data_hora_regulacao_medico',
            'justificativa_tempo30',
            'id_regulacao'
          ];
          
          const insertData = filterFields(FormData, allowedFields);

            // Verifica se o id_regulacao já existe na tabela regulacao_medico
            const [existing] = await connection.query(
                `SELECT id_regulacao FROM ${DBtable} WHERE id_regulacao = ?`,
                [FormData.id_regulacao]
            );

            if (existing.length > 0) {
                return {
                    success: false,
                    message: `Já existe uma regulação médica com o ID ${FormData.id_regulacao}.`,
                };
            }
          
          const [result] = await connection.query(
            `INSERT INTO ${DBtable} SET ?`,
            [insertData]
          );
          

        if (result.affectedRows === 0) {
            throw new Error("Erro ao inserir no banco de dados.");
        }

        const novoStatus = FormData.vaga_autorizada
            ? NovoStatusApproved
            : NovoStatusDeny;

        await UpdateStatus(FormData.id_regulacao, novoStatus);
        await UpdateMedico(FormData.id_regulacao, FormData.nome_regulador_medico);

        // ✅ NOVO: Verifica se un_destino existe e chama updateUnDestino
        if (FormData.un_destino && FormData.un_destino.trim() !== '') {
            await UpdateUnDestino(FormData.id_regulacao, FormData.un_destino);
        }

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
