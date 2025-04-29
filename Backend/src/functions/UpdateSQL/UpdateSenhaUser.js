import bcrypt from 'bcrypt'; // Para hashing de senhas
import { DBconnection } from "../Controller/connection.js"; // Importa apenas o objeto DBconnection

async function UpdateSenha(FormData) {
    const DBtable = 'usuarios';

    // Verificação de comprimento mínimo da senha
    if (!FormData.senha || FormData.senha.length < 6) {
        return { success: false, message: "A senha deve ter no mínimo 6 caracteres." };
    }

    try {
        // Criptografa a senha antes de salvar no banco
        const saltRounds = 10; // Define o número de rounds para o hash
        const hashedPassword = await bcrypt.hash(FormData.senha, saltRounds);

        // Inicie a conexão com o banco de dados
        const connection = await DBconnection.getConnection();

        // Atualiza a senha no banco de dados
        const [updateResult] = await connection.query(
            `UPDATE ${DBtable} 
             SET senha = ?, 
             primeiroAcesso = ?
             WHERE login = ?`,
            [hashedPassword, false, FormData.login]
        );

        connection.release(); // Libera a conexão

        if (updateResult.affectedRows > 0) {
            console.log('✅ Senha Atualizada com sucesso:', FormData.login);
            return { success: true, message: "Senha Atualizada com sucesso." };
        } else {
            console.error('⚠️ Nenhum usuário foi atualizado.');
            return { success: false, message: "Falha ao atualizar senha." };
        }
    } catch (error) {
        console.error('❌ Erro ao atualizar senha:', error);
        return { success: false, message: "Erro ao atualizar senha.", error };
    }
}

export default UpdateSenha;
