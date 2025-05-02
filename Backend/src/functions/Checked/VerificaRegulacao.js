import { DBconnection } from '../Controller/connection.js'; // Importa o objeto DBconnection

async function verificaRegulacao(num_regulacao, id_regulacao) {
    const DBtable = 'regulacao';
    let connection;

    try {
        // Inicia a conexão com o banco de dados
        connection = await DBconnection.getConnection();

        // Verifica se já existe outra regulação com o mesmo num_regulacao
        const [rows] = await connection.query(
            `SELECT id_regulacao FROM ?? WHERE num_regulacao = ? AND id_regulacao != ?`,
            [DBtable, num_regulacao, id_regulacao]
        );

        if (rows.length > 0) {
            return {
                success: false,
                message: `Já existe uma regulação com o número ${num_regulacao}.`,
            };
        }

        return { success: true }; // Não existe duplicação

    } catch (error) {
        console.error('Erro ao verificar número da regulação:', error);
        return {
            success: false,
            message: "Erro ao verificar número da regulação.",
            error,
        };
    } finally {
        if (connection) connection.release();
    }
}

export default verificaRegulacao;
