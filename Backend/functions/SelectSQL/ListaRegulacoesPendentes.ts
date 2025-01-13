/// <reference types="node" />
const express = require('express');
const { DBconnection } = require("../../connection.ts"); // Importa apenas o objeto DBconnection
const { getCurrentTimestamp } = require("../Time/Timestamp.ts");

async function ListaRegulacoesPendentes() {
    const DBtable = 'regulacao';
    const Agora = getCurrentTimestamp();

    try {
        // Inicie a conexão com o banco de dados
        const connection = await DBconnection.getConnection();

        // Execute a query para selecionar todos os registros da tabela regulacao
        //const [rows] = await connection.query(`SELECT * FROM ${DBtable} WHERE`);
        const [rows] = await connection.query(`
            SELECT * 
            FROM ${DBtable}
            WHERE status_regulacao = ?
            AND TIMESTAMPDIFF(HOUR, data_hora_solicitacao_02, ?) <= 24
          `, ['Aberto - Aguardando Regulacao Medica', Agora]);
          

        connection.release(); // Libera a conexão

        //console.log('Regulacoes carregadas com sucesso:', rows);
        //console.log('Resultado da query:', rows); // Na função ListaRegulacoesPendentes
        return { success: true, data: rows };

    } catch (error) {
        // Tratamento de erro
        console.error('Erro ao carregar regulacoes:', error);
        return { success: false, message: "Erro ao carregar regulacoes.", error };
    }
}

module.exports = ListaRegulacoesPendentes;
