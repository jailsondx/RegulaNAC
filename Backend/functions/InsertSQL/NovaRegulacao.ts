/// <reference types="node" />
const express = require('express');
const { DBconnection } = require("../../connection.ts"); // Importa apenas o objeto DBconnection

async function NovaRegulacao(FormData) {
    const DBtable = 'regulacao';
    const DBtableUsuarios = 'usuarios';

    try {
        // Defina a data_hora_solicitacao_02 como o mesmo valor que a data_hora_solicitacao_01
        FormData.data_hora_solicitacao_02 = FormData.data_hora_solicitacao_01;

        // Inicie a conexão com o banco de dados
        const connection = await DBconnection.getConnection();

        // Verifica a permissão do usuário
        const [rowsUserPrivilege] = await connection.query(
            `SELECT tipo FROM ${DBtableUsuarios} WHERE id_user = ?`, 
            [FormData.id_user]
        );

        connection.release(); // Libera a conexão

        if (rowsUserPrivilege.length === 0) {
            // Usuário não encontrado
            console.error('Usuário não encontrado: ID:', FormData.id_user);
            return { success: false, message: "Usuário não encontrado." };
        }

        const userType = rowsUserPrivilege[0].tipo;

        if (userType === 'Medico') {
            // Usuário sem permissão
            console.error('\nUsuário ID: ' + FormData.id_user + ' \nSem permissão: Nova Regulação\n');
            return { success: false, message: "Usuário não tem permissão para realizar esta ação." };
        }

        // Usuário possui permissão, insira os dados no banco
        const [result] = await connection.query(
            `INSERT INTO ${DBtable} SET ?`, 
            FormData
        );

        console.log('Registro regulacao inserido com sucesso! ID:', FormData.id_regulacao);
        return { success: true, message: "Regulação cadastrada com sucesso." };

    } catch (error) {
        // Tratamento de erro
        console.error('Erro no cadastro:', error);
        return { success: false, message: "Erro ao cadastrar regulação.", error };
    }
}

module.exports = NovaRegulacao;
