/// <reference types="node" />
import bcrypt from 'bcrypt'; // Para hashing de senhas
import { DBconnection } from "../Controller/connection.js"; // Importa apenas o objeto DBconnection
import { ResultSetHeader } from "mysql2"; // Importa a tipagem correta

/*IMPORT INTERFACES*/
import { UserData } from "../../Interfaces/User.js";

async function CadastroUser(FormData: UserData) {
    const DBtable = 'usuarios';

    try {
        // Criptografa a senha antes de salvar no banco
        const saltRounds = 10; // Define o número de rounds para o hash
        const hashedPassword = await bcrypt.hash(FormData.senha, saltRounds);

        // Cria um novo objeto para não modificar o original
        const userData = { ...FormData, senha: hashedPassword };

        // Inicie a conexão com o banco de dados
        const connection = await DBconnection.getConnection();

        // Insere os dados no banco de dados
        const [result] = await connection.query<ResultSetHeader>(
            `INSERT INTO ${DBtable} (login, senha, nome) VALUES (?, ?, ?)`,
            [userData.login, userData.senha, userData.nome]
        );

        connection.release(); // Libera a conexão

        if (result.affectedRows > 0) {
            console.log('✅ Usuário cadastrado com sucesso:', userData.login);
            return { success: true, message: "Usuário cadastrado com sucesso." };
        } else {
            console.error('⚠️ Nenhum usuário foi cadastrado.');
            return { success: false, message: "Falha ao cadastrar usuário." };
        }
    } catch (error) {
        console.error('❌ Erro ao cadastrar usuário:', error);
        return { success: false, message: "Erro ao cadastrar usuário.", error };
    }
}

export default CadastroUser;
