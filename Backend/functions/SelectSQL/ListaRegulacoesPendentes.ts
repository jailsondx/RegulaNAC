/// <reference types="node" />
const express = require('express');
const { DBconnection } = require("../../connection.ts"); // Importa apenas o objeto DBconnection
const { getCurrentTimestamp } = require("../Time/Timestamp.ts");

async function ListaRegulacoesPendentes() {
    const DBtable = 'regulacao';
    const Agora = new Date(); // Hora atual do servidor como objeto Date

    try {
        // Inicie a conexão com o banco de dados
        const connection = await DBconnection.getConnection();

        // Execute a query para selecionar os registros
        const [rows] = await connection.query(`
            SELECT * 
            FROM ${DBtable}
            WHERE status_regulacao LIKE ?
            AND TIMESTAMPDIFF(HOUR, data_hora_solicitacao_02, ?) < 24
        `, ['ABERTO - NOVO%', getCurrentTimestamp()]);

        connection.release(); // Libera a conexão

        return { success: true, data: rows };

    } catch (error) {
        // Tratamento de erro
        console.error('Erro ao carregar regulacoes:', error);
        return { success: false, message: "Erro ao carregar regulacoes.", error };
    }
}

async function ListaRegulacoesPendentes24() {
    const DBtable = 'regulacao';
    const Agora = new Date(); // Hora atual do servidor como objeto Date

    try {
        // Inicie a conexão com o banco de dados
        const connection = await DBconnection.getConnection();

        // Execute a query para selecionar os registros
        const [rows] = await connection.query(`
            SELECT * 
            FROM ${DBtable}
            WHERE status_regulacao = ?
            AND TIMESTAMPDIFF(HOUR, data_hora_solicitacao_02, ?) >= 24
        `, ['ABERTO - NOVO', getCurrentTimestamp()]);

        connection.release(); // Libera a conexão

        return { success: true, data: rows };

    } catch (error) {
        // Tratamento de erro
        console.error('Erro ao carregar regulacoes:', error);
        return { success: false, message: "Erro ao carregar regulacoes.", error };
    }
}


module.exports = { ListaRegulacoesPendentes, ListaRegulacoesPendentes24 };
