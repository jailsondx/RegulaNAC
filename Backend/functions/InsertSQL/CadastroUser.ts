/// <reference types="node" />
const express = require('express');
const bcrypt = require('bcrypt'); // Para hashing de senhas
const { DBconnection } = require("../../connection.ts"); // Importa apenas o objeto DBconnection

async function CadastroUser(FormData) {
    const DBtable = 'usuarios';

    try {
        // Criptografa a senha antes de salvar no banco
        const saltRounds = 10; // Define o número de rounds para o hash
        const hashedPassword = await bcrypt.hash(FormData.senha, saltRounds);

        // Substitui a senha original pela senha criptografada
        FormData.senha = hashedPassword;

        // Inicie a conexão com o banco de dados
        const connection = await DBconnection.getConnection();

        // Insere os dados no banco de dados
        const result = await connection.query(`INSERT INTO ${DBtable} SET ?`, FormData);

        connection.release(); // Libera a conexão

        console.log('Usuário cadastrado com sucesso:', FormData.login);
        return { success: true, message: "Usuário cadastrado com sucesso." };
    } catch (error) {
        // Tratamento de erro
        console.error('Erro ao cadastrar usuário:', error);
        return { success: false, message: "Erro ao cadastrar usuário.", error };
    }
}

module.exports = CadastroUser;
