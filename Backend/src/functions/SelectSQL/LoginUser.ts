import bcrypt from "bcrypt";
import { DBconnection } from "../Controller/connection.js";
import { RowDataPacket } from "mysql2/promise"; // Importa RowDataPacket para tipagem correta

async function LoginUser(login: string, password: string) {
    const DBtable = "usuarios";

    try {
        // Inicie a conexão com o banco de dados
        const connection = await DBconnection.getConnection();

        // Execute a query para buscar o usuário na tabela de usuários
        const [rows] = await connection.query<RowDataPacket[]>(`
            SELECT * FROM ${DBtable} WHERE login = ? LIMIT 1
        `, [login]);

        connection.release(); // Libera a conexão

        // Verifica se o usuário foi encontrado
        if (rows.length > 0) {
            const user = rows[0];

            // Verifica se a senha fornecida bate com a senha armazenada
            const isPasswordValid = await bcrypt.compare(password, user.senha); // Usando bcrypt para comparar as senhas

            if (isPasswordValid) {
                console.log("LOGIN USER:", login);
                return { success: true, message: "Login realizado com sucesso.", data: user };
            } else {
                return { success: false, message: "Credenciais inválidas." };
            }
        } else {
            return { success: false, message: "Usuário não encontrado." };
        }
    } catch (error) {
        console.error("Erro ao verificar usuário:", error);
        return { success: false, message: "Erro ao verificar usuário.", error };
    }
}

export default LoginUser;
