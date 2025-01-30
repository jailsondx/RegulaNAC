/// <reference types="node" />
const express = require('express');
const { DBconnection } = require("../../connection.ts"); // Importa apenas o objeto DBconnection

async function UpdateLinkDOC(num_regulacao,link) {
    const DBtable = 'regulacao';

    console.log('\nRegulacao: ' + num_regulacao);
    console.log('PDF: ' + link);
    try {
        // Inicie a conexão com o banco de dados
        const connection = await DBconnection.getConnection();

        // Atualiza os dados na tabela regulacao
        const [updateResult] = await connection.query(
            `UPDATE ${DBtable} 
             SET link = ?
             WHERE num_regulacao = ? `, [link, num_regulacao]
        );

        connection.release(); // Libera a conexão

        if (updateResult.affectedRows === 0) {
            console.error('\nLink PDF: NÃO Registrado \nVerifique os valores de link e num_regulacao.');
            return { success: false, message: "Nenhum registro foi atualizado. Verifique os critérios fornecidos." };
        }

        return { success: true, message: "Link PDF: Registrado." };

    } catch (error) {
        // Tratamento de erro
        console.error('Erro na atualização:', error);
        return { success: false, message: "Erro ao atualizar regulação.", error };
    }
}

module.exports = UpdateLinkDOC;
