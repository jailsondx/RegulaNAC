/// <reference types="node" />
import { DBconnection } from "../Controller/connection.js"; // Importa apenas o objeto DBconnection
import { ResultSetHeader } from "mysql2"; // Importa a tipagem correta

async function UpdateLinkDOC(num_regulacao: string, link: string) {
    const DBtable = 'regulacao';

    console.log('\nRegulacao:', num_regulacao);
    console.log('PDF:', link);
    
    try {
        // Inicie a conexão com o banco de dados
        const connection = await DBconnection.getConnection();

        // Executa a atualização
        const [updateResult] = await connection.query<ResultSetHeader>(
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
        console.error('Erro na atualização:', error);
        return { success: false, message: "Erro ao atualizar regulação.", error };
    }
}

export default UpdateLinkDOC;
