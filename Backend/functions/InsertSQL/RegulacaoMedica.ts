/// <reference types="node" />
const express = require('express');
const { DBconnection } = require("../../connection.ts"); // Importa apenas o objeto DBconnection

async function RegulacaoMedica(FormData) {
    const DBtable = 'regulacao_medico';
    const DBtable2 = 'regulacao';
    const DBtableUsuarios = 'usuarios';

    try {
        // Inicie a conexão com o banco de dados
        const connection = await DBconnection.getConnection();

        // Verifica a permissão do usuário
        const [rows] = await connection.query(
            `SELECT tipo FROM ${DBtableUsuarios} WHERE id_user = ?`, 
            [FormData.id_user]
        );

        if (rows.length === 0) {
            // Usuário não encontrado
            console.error('Usuário não encontrado: ID:', FormData.id_user);
            connection.release(); // Libera a conexão antes de retornar
            return { success: false, message: "Usuário não encontrado." };
        }

        const userType = rows[0].tipo;

        if (userType !== 'Medico') {
            // Usuário sem permissão
            console.error('\nUsuário ID: ' + FormData.id_user + ' \nSem permissão: Regulação Médica\n');
            connection.release(); // Libera a conexão antes de retornar
            return { success: false, message: "Usuário não tem permissão para realizar esta ação." };
        }

        // Insira os dados no banco
        const [result] = await connection.query(
            `INSERT INTO ${DBtable} SET ?`, 
            FormData
        );

        // Verifique se a inserção foi bem-sucedida
        if (result.affectedRows === 0) {
            throw new Error('Erro ao inserir no banco de dados.');
        } else {
            // Atualize o status de regulação
            if (FormData.vaga_autorizada) {
                await connection.query(
                    `UPDATE ${DBtable2} SET status_regulacao = ? WHERE id_regulacao = ?`,
                    ['Aberto - Pendente Transporte', FormData.id_regulacao]
                );
                connection.release(); // Libera a conexão antes de retornar
                return { success: true, message: "Regulação Médica: Aprovada." };
            } else {
                await connection.query(
                    `UPDATE ${DBtable2} SET status_regulacao = ? WHERE id_regulacao = ?`,
                    ['Negado', FormData.id_regulacao]
                );
                connection.release(); // Libera a conexão antes de retornar
                return { success: true, message: "Regulação Médica: Negada." };
            }
        }

    } catch (error) {
        console.error('Erro no cadastro:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return { success: false, message: "Entrada duplicada: já existe um registro com os mesmos dados." };
        }
        return { success: false, message: "Erro ao cadastrar regulação.", error };
    }
}

module.exports = RegulacaoMedica;
