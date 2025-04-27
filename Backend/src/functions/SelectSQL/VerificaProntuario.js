import { DBconnection } from "../Controller/connection.js"; // Importa apenas o objeto DBconnection

async function VerificaProntuario(num_prontuario, Origem) {
    let DBtable;

    switch (Origem) {
        case "Interna":
            DBtable = "regulacao";
            break;
        case "Externa":
            DBtable = "externa_regulacao";
            break;
        default:
            throw new Error("Origem inválida. Use 'Interna' ou 'Externa'.");
    }

    try {
        // Inicie a conexão com o banco de dados
        const connection = await DBconnection.getConnection();

        // Execute a query para verificar o prontuário na tabela com LIMIT 1
        const [rows] = await connection.query(
            `SELECT * FROM ${DBtable} 
            WHERE num_prontuario = ? AND (status_regulacao LIKE 'ABERTO%' OR status_regulacao LIKE 'NEGADO%') 
            LIMIT 1`,
            [num_prontuario]
        );

        connection.release(); // Libera a conexão

        if (rows.length > 0) {
            return { success: true, message: "Regulação pendente em aberto", data: rows[0] };
        } else {
            return { success: true, message: "Nenhuma regulação pendente encontrada.", data: null };
        }
    } catch (error) {
        console.error('Erro ao verificar prontuário:', error);
        return { success: false, message: "Erro ao carregar regulações.", error };
    }
}


async function VerificaProntuarioAutoComplete(num_prontuario) {
    const DBtable = 'regulacao';

    try {
        // Inicie a conexão com o banco de dados
        const connection = await DBconnection.getConnection();

        // Execute a query para verificar o prontuário na tabela com LIMIT 1
        const [rows] = await connection.query(
            `SELECT nome_paciente, data_nascimento, num_idade FROM ${DBtable} WHERE num_prontuario = ? LIMIT 1`,
            [num_prontuario]
        );

        if (rows.length > 0) {
            connection.release(); // Libera a conexão
            return { success: true, message: "Dados do prontuario já existem", data: rows[0] };
        } else {
            connection.release(); // Libera a conexão
            return { success: false, message: "Dados do prontuario não encontrados."};
        }
    } catch (error) {
        // Tratamento de erro
        console.error('Erro ao verificar prontuário:', error);
        return { success: false, message: "Erro ao carregar prontuario.", error };
    }
}

export {VerificaProntuario, VerificaProntuarioAutoComplete};
