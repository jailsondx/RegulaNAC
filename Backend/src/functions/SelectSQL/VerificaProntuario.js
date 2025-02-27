import { DBconnection } from "../Controller/connection.js"; // Importa apenas o objeto DBconnection

async function VerificaProntuario(num_prontuario) {
    const DBtable = 'regulacao';
    const DBtable2 = 'regulacao_medico';

    try {
        // Inicie a conexão com o banco de dados
        const connection = await DBconnection.getConnection();

        // Execute a query para verificar o prontuário na tabela com LIMIT 1
        const [rows] = await connection.query(
            `SELECT * FROM ${DBtable} WHERE num_prontuario = ? AND status_regulacao LIKE 'ABERTO%' LIMIT 1`,
            [num_prontuario]
        );

        if (rows.length > 0) {
            const [rows2] = await connection.query(
                `SELECT num_leito FROM ${DBtable2} WHERE id_regulacao = ? LIMIT 1`,
                [rows[0].id_regulacao]
            );

            connection.release(); // Libera a conexão

            // Combine os resultados das duas consultas em um único objeto
            const result = {
                ...rows[0],
                num_leito: rows2.length > 0 ? rows2[0].num_leito : null
            };
            return { success: true, message: "Regulação pendente em aberto", data: result };
        } else {
            connection.release(); // Libera a conexão
            return { success: true, message: "Nenhuma regulação pendente encontrada.", data: null };
        }
    } catch (error) {
        // Tratamento de erro
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
