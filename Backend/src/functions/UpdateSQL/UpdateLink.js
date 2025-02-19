/// <reference types="node" />
import { DBconnection } from "../Controller/connection.js"; // Importa apenas o objeto DBconnection

async function UpdateLinkDOC(num_regulacao, link) {
    const DBtable = 'regulacao';
    
    let connection;

    try {
        // Inicie a conexão com o banco de dados
        connection = await DBconnection.getConnection();

        // Executa a atualização
        const [updateResult] = await connection.query(
            `UPDATE ${DBtable} 
             SET link = ?
             WHERE num_regulacao = ?`, 
            [link, num_regulacao]
        );

        connection.release(); // Libera a conexão

        if (updateResult.affectedRows === 0) {
            console.error('\nLink PDF: NÃO Registrado \nVerifique os valores de link e num_regulacao.');
            return { success: false, message: "Nenhum registro foi atualizado. Verifique os critérios fornecidos." };
        }

        return { success: true, message: "Link PDF: Registrado." };

    } catch (error) {
        if (connection) connection.release();
        console.error('Erro na atualização:', error);
        return { success: false, message: "Erro ao atualizar regulação.", error };
    }
}

export default UpdateLinkDOC;
