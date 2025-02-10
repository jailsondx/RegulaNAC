import { DBconnection } from "../Controller/connection.js";
import VerificaStatus from "../Checked/VerificaStatus.js";
import UpdateStatus from "../UpdateSQL/UpdateStatus.js";
import { RowDataPacket, ResultSetHeader } from "mysql2";

/*IMPORT INTERFACES*/
import { DestinoData } from "../../Interfaces/Transporte.js";

async function RegulacaoDestino(FormData: DestinoData) {
    const DBtable = "setor_destino";
    const DBtableUsuarios = "usuarios";
    const StatusAtual = "ABERTO - APROVADO - AGUARDANDO DESTINO";
    const NovoStatus = "ABERTO - APROVADO - AGUARDANDO ACIONAMENTO TRANSPORTE";
    const msgError = "Destino não pode ser atualizado; Status atual é: ";

    try {
        // Inicie a conexão com o banco de dados
        const connection = await DBconnection.getConnection();

        // Verifica a permissão do usuário
        const [rowsUserPrivilege] = await connection.query<RowDataPacket[]>(
            `SELECT tipo FROM ${DBtableUsuarios} WHERE id_user = ?`,
            [FormData.id_user]
        );

        if (rowsUserPrivilege.length === 0) {
            console.error("Usuário não encontrado: ID:", FormData.id_user);
            return { success: false, message: "Usuário não encontrado." };
        }

        const userType = rowsUserPrivilege[0].tipo;

        if (userType === "MEDICO") {
            console.error(
                `\nUsuário ID: ${FormData.id_user} \nSem permissão: Regulação Destino\n`
            );
            return {
                success: false,
                message: "Usuário não tem permissão para realizar esta ação.",
            };
        }

        // Verifica o status da regulação
        const statusCheck = await VerificaStatus(
            FormData.id_regulacao,
            StatusAtual,
            msgError
        );

        if (!statusCheck.success) {
            return { success: false, message: statusCheck.message };
        }

        // Usuário possui permissão, insira os dados no banco
        const [result] = await connection.query<ResultSetHeader>(
            `INSERT INTO ${DBtable} SET ?`,
            [FormData]
        );

        if (result.affectedRows === 0) {
            return {
                success: false,
                message: "Nenhum registro foi inserido. Verifique os dados enviados.",
            };
        }

        await UpdateStatus(FormData.id_regulacao, NovoStatus);

        return {
            success: true,
            message: "Regulação destino: Cadastrada com Sucesso.",
        };
    } catch (error) {
        console.error("Erro no cadastro Regulação destino:", error);
        return {
            success: false,
            message: "Erro ao cadastrar Regulação destino.",
            error,
        };
    }
}

export default RegulacaoDestino;
