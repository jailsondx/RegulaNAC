import { DBconnection } from "../Controller/connection.js";
import UpdateStatus from "../UpdateSQL/UpdateStatus.js";
import UpdateMedico from "../UpdateSQL/UpdateMedico.js";
import { RowDataPacket, ResultSetHeader } from "mysql2";

/*IMPORT INTERFACES*/
import { RegulacaoMedicoData } from "../../Interfaces/Regulacao.js";

async function RegulacaoMedica(FormData: RegulacaoMedicoData) {
    const DBtable = "regulacao_medico";
    const DBtableUsuarios = "usuarios";
    const NovoStatusApproved = "ABERTO - APROVADO - AGUARDANDO ORIGEM";
    const NovoStatusDeny = "ABERTO - NEGADO";

    try {
        // Inicie a conexão com o banco de dados
        const connection = await DBconnection.getConnection();

        // Verifica a permissão do usuário
        const [rows] = await connection.query<RowDataPacket[]>(
            `SELECT tipo FROM ${DBtableUsuarios} WHERE id_user = ?`,
            [FormData.id_user]
        );

        if (rows.length === 0) {
            console.error("Usuário não encontrado: ID:", FormData.id_user);
            return { success: false, message: "Usuário não encontrado." };
        }

        const userType = rows[0].tipo;

        if (userType !== "MEDICO") {
            console.error(
                `\nUsuário ID: ${FormData.id_user} \nSem permissão: Regulação Médica\n`
            );
            return {
                success: false,
                message: "Usuário não tem permissão para realizar esta ação.",
            };
        }

        // Insira os dados no banco
        const [result] = await connection.query<ResultSetHeader>(
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
            message: `Regulação Médica: ${
                FormData.vaga_autorizada ? "Aprovada" : "Negada"
            }.`,
        };
    } catch (error: any) {
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
