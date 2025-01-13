/// <reference types="node" />
const express = require('express');
const { DBconnection } = require("../../connection.ts"); // Importa apenas o objeto DBconnection

async function RegulacaoMedica(FormData) {
    const DBtable = 'regulacao_medico';
    const DBtable2 = 'regulacao';

    let connection;
    try {
        // Inicie a conexão com o banco de dados
        connection = await DBconnection.getConnection();

        // Insira os dados no banco
        const result = await connection.query(`INSERT INTO ${DBtable} SET ?`, FormData);

        // Atualize o status de regulação
        if (FormData.vaga_autorizada) {
            await connection.query(
                `UPDATE ${DBtable2} SET status_regulacao = ? WHERE id_regulacao = ?`,
                ['Aberto - Pendente Transporte', FormData.id_regulacao]
            );
        } else {
            await connection.query(
                `UPDATE ${DBtable2} SET status_regulacao = ? WHERE id_regulacao = ?`,
                ['Negado', FormData.id_regulacao]
            );
        }

        console.log('Regulação Médica: Atualizada com Sucesso! ID Regulacao: ' + FormData.id_regulacao);
        return { success: true, message: "Regulação Médica cadastrada com sucesso." };

    } catch (error) {
        console.error('Erro no cadastro:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return { success: false, message: "Entrada duplicada: já existe um registro com os mesmos dados." };
        }
        return { success: false, message: "Erro ao cadastrar regulação.", error };

    } finally {
        if (connection) connection.release();
    }
}

module.exports = RegulacaoMedica;
