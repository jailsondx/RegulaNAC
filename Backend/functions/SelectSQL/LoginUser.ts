/// <reference types="node" />
const express = require('express');
const bcrypt = require('bcrypt'); // Adicionei bcrypt para hashing de senhas (caso necessário)
const { DBconnection } = require("../../connection.ts"); // Importa apenas o objeto DBconnection

async function LoginUser(login, password) {
    const DBtable = 'usuarios';

    try {
        // Inicie a conexão com o banco de dados
        const connection = await DBconnection.getConnection();

        // Execute a query para buscar o usuário na tabela de usuários
        const [rows] = await connection.query(
            `SELECT * FROM ${DBtable} WHERE login = ? LIMIT 1`,
            [login]
        );

        connection.release(); // Libera a conexão

        // Verifica se o usuário foi encontrado
        if (rows[0]) {
            const user = rows[0];

            // Verifica se a senha fornecida bate com a senha armazenada
            const isPasswordValid = await bcrypt.compare(password, user.senha); // Usando bcrypt para comparar as senhas

            if (isPasswordValid) {
                // Senha correta
                return { success: true, message: "Login realizado com sucesso.", data: user };
            } else {
                // Senha incorreta
                return { success: false, message: "Credenciais inválidas." };
            }
        } else {
            // Usuário não encontrado
            return { success: false, message: "Usuário não encontrado." };
        }
    } catch (error) {
        // Tratamento de erro
        console.error('Erro ao verificar usuário:', error);
        return { success: false, message: "Erro ao verificar usuário.", error };
    }
}

module.exports = LoginUser;
