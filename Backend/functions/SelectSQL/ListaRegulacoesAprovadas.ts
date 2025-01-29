/// <reference types="node" />
const express = require('express');
const { DBconnection } = require("../../connection.ts"); // Importa apenas o objeto DBconnection
const { getCurrentTimestamp } = require("../Time/Timestamp.ts");

async function ListaRegulacoesAprovadas() {
    const DBtable = 'regulacao';
    const DBtable2 = 'regulacao_medico'; // Tabela de reguladores

    try {
        // Inicie a conexão com o banco de dados
        const connection = await DBconnection.getConnection();

        // Query com JOIN para unir dados de ambas as tabelas
        const [rows] = await connection.query(`
            SELECT 
                r.*, 
                rm.nome_regulador_medico, data_hora_regulacao_medico
            FROM ${DBtable} r
            LEFT JOIN ${DBtable2} rm ON r.id_regulacao = rm.id_regulacao
            WHERE r.status_regulacao LIKE ?`, 
            ['ABERTO - APROVADO%']
        );

        connection.release(); // Libera a conexão

        // Retorna os dados combinados
        return { success: true, data: rows };

    } catch (error) {
        // Tratamento de erro
        console.error('Erro ao carregar regulações:', error);
        return { success: false, message: "Erro ao carregar regulações.", error };
    }
}

module.exports = ListaRegulacoesAprovadas;
