/// <reference types="node" />
const express = require('express');
const { DBconnection } = require("../../connection.ts"); // Importa apenas o objeto DBconnection

async function ListaRegulacoesPendentes() {
    const DBtable = 'regulacao';

    try {
        // Inicie a conexão com o banco de dados
        const connection = await DBconnection.getConnection();

        // Execute a query para selecionar todos os registros da tabela regulacao
        //const [rows] = await connection.query(`SELECT * FROM ${DBtable} WHERE`);
        const [rows] = await connection.query(`
            SELECT * 
            FROM regulacao 
            WHERE id_regulacao NOT IN (
              SELECT id_regulacao 
              FROM regulacao_medico
            )
          `);
          

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
