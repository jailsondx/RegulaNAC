/// <reference types="node" />
const express = require('express');
const { DBconnection } = require("../../connection.ts"); // Importa apenas o objeto DBconnection

async function UpdateStatus(id_regulacao, status) {
    const DBtable = 'regulacao';

    try {
        // Inicie a conexão com o banco de dados
        const connection = await DBconnection.getConnection();

        // Atualiza os dados na tabela regulacao
        const [updateResult] = await connection.query(
            `UPDATE ${DBtable} 
             SET status_regulacao = ?
             WHERE id_regulacao = ? `, [status, id_regulacao]
        );

        connection.release(); // Libera a conexão

        if (updateResult.affectedRows === 0) {
            console.error('Nenhum registro foi atualizado: Verifique os valores de num_prontuario e num_regulacao.');
            return { success: false, message: "Nenhum registro foi atualizado. Verifique os critérios fornecidos." };
        }

        return { success: true, message: "Regulação atualizada com sucesso." };

    } catch (error) {
        // Tratamento de erro
        console.error('Erro na atualização:', error);
        return { success: false, message: "Erro ao atualizar regulação.", error };
    }
}

module.exports = UpdateStatus;
