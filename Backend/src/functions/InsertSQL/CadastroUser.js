import bcrypt from 'bcrypt'; // Para hashing de senhas
import { DBconnection } from "../Controller/connection.js"; // Importa apenas o objeto DBconnection

async function CadastroUser(FormData) {
    const DBtable = 'usuarios';

    try {
        // Validação do CPF
        if (!/^\d{11}$/.test(FormData.cpf)) {
            return { success: false, message: "CPF deve ter exatamente 11 dígitos." };
        }

        if(FormData.tipo === 'MEDICO'){
            FormData.login = FormData.login+'CRM'
        }

        // Inicie a conexão com o banco de dados
        const connection = await DBconnection.getConnection();

        // Verifica se o login já existe
        const [loginRows] = await connection.query(
            `SELECT COUNT(*) as count FROM ${DBtable} WHERE login = ?`,
            [FormData.login]
        );
        if (loginRows[0].count > 0) {
            connection.release();
            return { success: false, message: "Login já existe." };
        }

        // Verifica se o CPF já existe
        const [cpfRows] = await connection.query(
            `SELECT COUNT(*) as count FROM ${DBtable} WHERE cpf = ?`,
            [FormData.cpf]
        );
        if (cpfRows[0].count > 0) {
            connection.release();
            return { success: false, message: "CPF já existe." };
        }

        if (FormData.primeiroAcesso === true) {
            FormData.senha = 'ISGH';
        }

        // Criptografa a senha antes de salvar no banco
        const saltRounds = 10; // Define o número de rounds para o hash
        const hashedPassword = await bcrypt.hash(FormData.senha, saltRounds);

        // Cria um novo objeto para não modificar o original
        const userData = { 
            ...FormData, 
            senha: hashedPassword,
            ativo: 1
        };

        // Insere os dados no banco de dados
        const [result] = await connection.query(
            `INSERT INTO ${DBtable} SET ?`,
            userData
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
