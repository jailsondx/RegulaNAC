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

    const connection = await DBconnection.getConnection();

    try {
        await connection.beginTransaction();

        const [rows] = await connection.query(
            `SELECT tipo FROM ${DBtableUsuarios} WHERE id_user = ?`,
            [FormData.id_user]
        );

        if (rows.length === 0) {
            await connection.rollback();
            return { success: false, message: "Usuário não encontrado." };
        }

        const userType = rows[0].tipo;
        if (userType !== "MEDICO") {
            console.error(`Usuário ID: ${FormData.id_user} sem permissão para Regulação Médica`);
            await connection.rollback();
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
            'autorizacao',
            'id_regulacao'
        ];

        const insertData = filterFields(FormData, allowedFields);

        const [existing] = await connection.query(
            `SELECT id_regulacao FROM ${DBtable} WHERE id_regulacao = ?`,
            [FormData.id_regulacao]
        );

        if (existing.length > 0) {
            // Já existe: atualizar
            await connection.query(
                `UPDATE ${DBtable} SET ? WHERE id_regulacao = ?`,
                [insertData, FormData.id_regulacao]
            );
        } else {
            // Não existe: inserir
            await connection.query(
                `INSERT INTO ${DBtable} SET ?`,
                [insertData]
            );
        }

        const NovoStatus = FormData.vaga_autorizada
            ? NovoStatusApproved
            : NovoStatusDeny;

        await UpdateStatus(FormData.id_regulacao, NovoStatus, connection);
        await UpdateMedico(FormData.id_regulacao, FormData.nome_regulador_medico, connection);

        if (FormData.un_destino && FormData.un_destino.trim() !== '') {
            await UpdateUnDestino(FormData.id_regulacao, FormData.un_destino, connection);

        }

        await connection.commit();

        return {
            success: true,
            message: `Regulação Médica: ${FormData.vaga_autorizada ? "Aprovada" : "Negada"}.`,
        };
    } catch (error) {
        await connection.rollback();
        console.error("Erro no cadastro:", error);
        return {
            success: false,
            message: "Erro ao cadastrar/atualizar regulação.",
            error,
        };
    } finally {
        connection.release();
    }
}

export default RegulacaoMedica;
