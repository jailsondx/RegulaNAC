import bcrypt from "bcrypt";
import { DBconnection } from "../Controller/connection.js";

async function LoginUser(login, password) {
    const DBtable = "usuarios";

    try {
        // Inicie a conexão com o banco de dados
        const connection = await DBconnection.getConnection();

        // Execute a query para buscar o usuário na tabela de usuários
        const [rows] = await connection.query(`SELECT * FROM ${DBtable} WHERE login = ? LIMIT 1`, [login]);

        connection.release(); // Libera a conexão

        // Verifica se o usuário foi encontrado
        if (rows.length === 0) {
            return { success: false, message: "Usuário não encontrado." };
        }

        const user = rows[0];

        // Verifica se o usuário está ativo
        if (user.ativo !== 1) { // Considerando que 1 é ativo, 0 é inativo
            return { success: false, message: "Usuário inativo. Não é possível realizar o login." };
        }

        // Verifica se é o primeiro acesso
        if (user.primeiroAcesso === true || user.primeiroAcesso === 1) {
            if (password === 'ISGH') {
                return { success: 200, message: "Redefina sua senha pessoal", data: user.login };
            } else {
                return { success: false, message: "Credenciais inválidas." };
            }
        }

        // Verifica se a senha fornecida bate com a senha armazenada
        const isPasswordValid = await bcrypt.compare(password, user.senha); // Usando bcrypt para comparar as senhas

        if (isPasswordValid) {
            console.log("✅ Usuário logado:", login);
            return { success: true, message: "Login realizado com sucesso.", data: user };
        } else {
            return { success: false, message: "Credenciais inválidas." };
        }
    } catch (error) {
        console.error("❌ Erro ao verificar usuário:", error);
        return { success: false, message: "Erro ao verificar usuário.", error };
    }
}

export default LoginUser;
