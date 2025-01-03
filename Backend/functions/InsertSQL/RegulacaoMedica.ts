/// <reference types="node" />
const express = require('express');
const { DBconnection } = require("../../connection.ts"); // Importa apenas o objeto DBconnection

async function RegulacaoMedicaApproved(FormData) {
    const DBtable = 'regulacao_medico';

    try {
        // Inicie a conexão com o banco de dados
        const connection = await DBconnection.getConnection();

        // Insira os dados no banco
        const result = await connection.query(`INSERT INTO ${DBtable} SET ?`, FormData);

        connection.release(); // Libera a conexão

        console.log('Regulação Médica Aprovada: inserido com sucesso:', result);
        return { success: true, message: "Regulação Médica cadastrada com sucesso." };

    } catch (error) {
        // Tratamento de erro
        console.error('Erro no cadastro:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return { success: false, message: "Nome de usuário já está em uso, por favor escolha outro." };
        }
        return { success: false, message: "Erro ao cadastrar regulação.", error };
    }
}


module.exports = RegulacaoMedicaApproved;
