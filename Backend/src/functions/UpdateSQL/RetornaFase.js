import { DBconnection } from "../Controller/connection.js";
import VerificaStatus from "../Checked/VerificaStatus.js";
import UpdateStatus from "./UpdateStatus.js";

async function RetornaFase(FormData) {
    const DBtableUsuarios = "usuarios";
    const CodFase = FormData.value_fase;
    let NovoStatus;

    switch (CodFase) {
        case 1:
            NovoStatus = "ABERTO - AGUARDANDO AVALIACAO";
            break;
        case 2:
            NovoStatus = "ABERTO - APROVADO - AGUARDANDO ORIGEM";
            break;
        case 3:
            NovoStatus = "ABERTO - APROVADO - AGUARDANDO DESTINO";
            break;
        case 4:
            NovoStatus = "ABERTO - APROVADO - AGUARDANDO ACIONAMENTO TRANSPORTE";
            break;
        case 5:
            NovoStatus = "ABERTO - APROVADO - AGUARDANDO FINALIZACAO TRANSPORTE";
            break;
        case 6:
            NovoStatus = "ABERTO - APROVADO - AGUARDANDO DESFECHO";
            break;
        default:
            console.error("Codigo de Fase inválido:", CodFase);
            throw new Error("Codigo de Fase inválido. Não foi possível determinar o Novo Status/Fase.");
    }

    let connection;

    try {
        // Inicia a conexão com o banco de dados
        connection = await DBconnection.getConnection();
        await connection.beginTransaction(); // ⬅️ Início da transação

        // Verifica a permissão do usuário
        const [rowsUserPrivilege] = await connection.query(
            `SELECT tipo FROM ${DBtableUsuarios} WHERE id_user = ?`,
            [FormData.id_user]
        );

        if (rowsUserPrivilege.length === 0) {
            console.error("Usuário não encontrado: ID:", FormData.id_user);
            await connection.rollback();
            return { success: false, message: "Usuário não encontrado." };
        }

        const userType = rowsUserPrivilege[0].tipo;

        if (userType === "MEDICO") {
            console.error(`Usuário ID: ${FormData.id_user} sem permissão para Retornar a Fase.`);
            await connection.rollback();
            return {
                success: false,
                message: "Usuário não tem permissão para realizar esta ação.",
            };
        }


        // Atualiza o status da regulação, usando a mesma conexão
        const statusResult = await UpdateStatus(FormData.id_regulacao, NovoStatus, connection);

        if (!statusResult.success) {
            await connection.rollback();
            return {
                success: false,
                message: "Erro ao atualizar status da regulação.",
            };
        }

        await connection.commit(); // ⬅️ Confirma todas as alterações
        connection.release(); // Libera a conexão
        return {
            success: true,
            message: `Fase Retornada para: ${NovoStatus}.`,
        };

    } catch (error) {
        if (connection) {
            await connection.rollback(); // ⬅️ Reverte tudo em caso de erro
            connection.release();
        }
        console.error("Erro no retorno da fase:", error);
        return {
            success: false,
            message: "Erro ao retornar fase.",
            error,
        };
    }
}

export default RetornaFase;
