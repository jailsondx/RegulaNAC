/// <reference types="node" />
const express = require('express');
const { DBconnection } = require("../../connection.ts"); // Importa apenas o objeto DBconnection

async function PesquisaPaciente(nomePaciente, numProntuario, numRegulacao, statusRegulacao) {
    const DBtable = 'regulacao'; // Tabela onde estão as regulações de pacientes

    try {
        const connection = await DBconnection.getConnection();

        // Iniciar a query básica
        let query = `SELECT * FROM ${DBtable} WHERE 1=1`; // "WHERE 1=1" permite adicionar filtros dinamicamente
        let queryParams = []; // Array para os parâmetros da query

        // Adicionar filtros condicionais se os parâmetros não forem vazios
        if (nomePaciente) {
            query += ' AND nome_paciente LIKE ?'; // Filtrar pelo nome do paciente
            queryParams.push(`%${nomePaciente}%`);
        }

        if (numProntuario) {
            query += ' AND num_prontuario = ?'; // Filtrar pelo número do prontuário
            queryParams.push(numProntuario);
        }

        if (numRegulacao) {
            query += ' AND num_regulacao = ?'; // Filtrar pelo número da regulação
            queryParams.push(numRegulacao);
        }

        
        if (statusRegulacao) {
            query += ' AND status_regulacao = ?'; // Filtrar pelo status da regulação
            queryParams.push(statusRegulacao);
        }

        // Excluir registros com status 'FECHADO'
        query += ' AND status_regulacao != "FECHADO"';

        // Executar a consulta com os parâmetros dinâmicos
        const [rows] = await connection.query(query, queryParams);

        connection.release();

        // Retornar os resultados
        return { success: true, data: rows };
    } catch (error) {
        console.error('Erro ao carregar regulações:', error);
        return { success: false, message: "Erro ao carregar regulações.", error };
    }
}

module.exports = PesquisaPaciente;
