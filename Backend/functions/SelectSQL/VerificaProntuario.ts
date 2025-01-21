/// <reference types="node" />
const express = require('express');
const { DBconnection } = require("../../connection.ts"); // Importa apenas o objeto DBconnection

async function VerificaProntuario(num_prontuario) {
    const DBtable = 'regulacao';

    try {
        // Inicie a conexão com o banco de dados
        const connection = await DBconnection.getConnection();

        // Execute a query para verificar o prontuário na tabela com LIMIT 1
        const [row] = await connection.query(
            `SELECT * FROM ${DBtable} WHERE num_prontuario = ? AND status_regulacao LIKE 'ABERTO%' LIMIT 1`,
            [num_prontuario]
        );

        connection.release(); // Libera a conexão

        // Verifica se há um resultado
        if (row[0]) {
            //console.log(`Regulação pendente encontrada para prontuário: ${num_prontuario}`);
            return { success: true, message: "Regulação pendente em aberto", data: row[0] };
        } else {
            //console.log(`Nenhuma regulação pendente encontrada para prontuário: ${num_prontuario}`);
            return { success: true, message: "Nenhuma regulação pendente encontrada.", data: null};
        }
    } catch (error) {
        // Tratamento de erro
        console.error('Erro ao verificar prontuário:', error);
        return { success: false, message: "Erro ao carregar regulações.", error };
    }
}

module.exports = VerificaProntuario;
