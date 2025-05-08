import { DBconnection } from "../Controller/connection.js"; // Importa apenas o objeto DBconnection

async function updateFastmedic(FormData) {
    const DBtable = 'desfecho';
    const DBtableUsuarios = 'usuarios';

    console.log(FormData);

    let connection;

    try {
        // Inicie a conexão com o banco de dados
        connection = await DBconnection.getConnection();
        await connection.beginTransaction();  // Inicia a transação

        // Verifica a permissão do usuário
        const [rowsUserPrivilege] = await connection.query(
            `SELECT tipo FROM ${DBtableUsuarios} WHERE id_user = ?`, 
            [FormData.id_user]
        );

        if (rowsUserPrivilege.length === 0) {
            console.error('Usuário não encontrado: ID:', FormData.id_user);
            await connection.rollback(); // Reverte a transação em caso de erro
            return { success: false, message: "Usuário não encontrado." };
        }

        const userType = rowsUserPrivilege[0].tipo;

        if (userType === 'MEDICO') {
            console.error(`Usuário ID: ${FormData.id_user} - Sem permissão para atualizar regulação.`);
            await connection.rollback(); // Reverte a transação em caso de erro
            return { success: false, message: "Usuário não tem permissão para realizar esta ação." };
        }

        
        // Atualiza os dados no banco
        const [updateResult] = await connection.query(
            `UPDATE ${DBtable} SET fastmedic = ? WHERE id_regulacao = ?`,
            [FormData.fastmedic, FormData.id_regulacao]
        );        
        
        if (updateResult.affectedRows === 0) {
            throw new Error("Nenhuma linha foi atualizada no Fastmedic.");
        }        


        // Confirma as alterações na transação
        await connection.commit();

        return { success: true, message: "Fastmedic atualizado com sucesso." };

    } catch (error) {
        if (connection) await connection.rollback(); // Reverte a transação em caso de erro
        console.error('Erro ao atualizar Fastmedic:', error);
        return { success: false, message: "Erro ao atualizar Fastmedic.", error };
    } finally {
        if (connection) {
            connection.release(); // Libera a conexão, independentemente de sucesso ou erro
        }
    }
}

export default updateFastmedic;
