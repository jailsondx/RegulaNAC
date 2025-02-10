/// <reference types="node" />
import { RowDataPacket } from "mysql2";
import { DBconnection } from "../Controller/connection.js"; // Importa apenas o objeto DBconnection

interface RegulacaoStatus {
    status_regulacao: string;
}

async function VerificaStatus(id_regulacao: number, status: string, msgError: string) {
    const DBtable = 'regulacao';
    let connection;

    try {
        // Inicie a conexão com o banco de dados
        connection = await DBconnection.getConnection();

        // Verifica o status da regulação
        const [rowsRegulacaoStatus] = await connection.query<RegulacaoStatus[] & RowDataPacket[]>(
            `SELECT status_regulacao FROM ?? WHERE id_regulacao = ?`,
            [DBtable, id_regulacao]
        );        

        if (rowsRegulacaoStatus.length === 0) {
            console.error('Regulação não encontrada: id_regulacao:', id_regulacao);
            return { success: false, message: "Regulação não encontrada." };
        }

        const currentStatus = rowsRegulacaoStatus[0].status_regulacao;

        if (currentStatus !== status) {
            console.error(`Regulação não pode ser atualizada: Status atual é '${currentStatus}'`);
            return {
                success: false,
                message: msgError + currentStatus
            };
        }

        // Caso passe na verificação
        return { success: true };

    } catch (error) {
        console.error('Erro ao verificar status:', error);
        return { success: false, message: "Erro ao verificar status da regulação.", error };
    } finally {
        // Libera a conexão no final, garantindo que sempre será chamada
        if (connection) connection.release();
    }
}

export default VerificaStatus;