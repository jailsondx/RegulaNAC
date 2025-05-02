// arquivo: UpdateSQL/UpdateLinkDOC.js
import { DBconnection } from "../Controller/connection.js";

/**
 * Atualiza o link do documento PDF para uma determinada regulação.
 * Usa conexão compartilhada, se fornecida, para evitar conflitos de transação.
 *
 * @param {number} num_regulacao - O número da regulação.
 * @param {string} link - O link do PDF a ser atualizado.
 * @param {any} externalConnection - (Opcional) Conexão ativa de transação externa.
 * @returns {Promise<{ success: boolean, message: string, error?: any }>}
 */
async function UpdateLinkDOC(num_regulacao, link, externalConnection = null) {
    const DBtable = 'regulacao';
    let connection = externalConnection;

    const releaseAfter = !externalConnection;

    try {
        if (!connection) {
            connection = await DBconnection.getConnection();
        }

        const [updateResult] = await connection.query(
            `UPDATE ${DBtable} 
             SET link = ?
             WHERE num_regulacao = ?`,
            [link, num_regulacao]
        );

        if (releaseAfter) connection.release();

        if (updateResult.affectedRows === 0) {
            console.error('\nLink PDF: NÃO Registrado \nVerifique os valores de link e num_regulacao.');
            return { success: false, message: "Nenhum registro foi atualizado. Verifique os critérios fornecidos." };
        }

        console.log(`✅ Link atualizado com sucesso para num_regulacao: ${num_regulacao}, link: ${link}`);
        return { success: true, message: "Link PDF: Atualizado." };

    } catch (error) {
        if (releaseAfter && connection) connection.release();
        console.error('❌ Erro ao atualizar link:', error);
        return { success: false, message: "Erro ao atualizar link.", error };
    }
}

export default UpdateLinkDOC;
