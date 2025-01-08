/// <reference types="node" />
const express = require('express');
const { DBconnection } = require("../../connection.ts"); // Importa apenas o objeto DBconnection

async function NovaRegulacao(FormData) {
    const DBtable = 'regulacao';

    try {
        // Defina a data_hora_solicitacao_02 como o mesmo valor que a data_hora_solicitacao_01
        FormData.data_hora_solicitacao_02 = FormData.data_hora_solicitacao_01;

        console.log('\n\n'+FormData+'\n\n');

        // Inicie a conexão com o banco de dados
        const connection = await DBconnection.getConnection();

        // Insira os dados no banco
        const result = await connection.query(`INSERT INTO ${DBtable} SET ?`, FormData);

        connection.release(); // Libera a conexão

        console.log('Registro inserido com sucesso:', result);
        return { success: true, message: "Regulação cadastrada com sucesso." };

    } catch (error) {
        // Tratamento de erro
        console.error('Erro no cadastro:', error);
        
        /*
            if (error.code === 'ER_DUP_ENTRY') {
                return { success: false, message: "Nome de usuário já está em uso, por favor escolha outro." };
            }
        */
       
        return { success: false, message: "Erro ao cadastrar regulação.", error };
    }
}


module.exports = NovaRegulacao;
