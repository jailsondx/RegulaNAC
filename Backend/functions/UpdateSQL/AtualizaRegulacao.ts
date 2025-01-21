/// <reference types="node" />
const express = require('express');
const { DBconnection } = require("../../connection.ts"); // Importa apenas o objeto DBconnection

async function AtualizaRegulacao(FormData) {
    const DBtable = 'regulacao';
    const DBtableUsuarios = 'usuarios';

    try {
        // Inicie a conexão com o banco de dados
        const connection = await DBconnection.getConnection();

        // Verifica a permissão do usuário
        const [rowsUserPrivilege] = await connection.query(
            `SELECT tipo FROM ${DBtableUsuarios} WHERE id_user = ?`, 
            [FormData.id_user]
        );

        if (rowsUserPrivilege.length === 0) {
            // Usuário não encontrado
            console.error('Usuário não encontrado: ID:', FormData.id_user);
            connection.release(); // Libera a conexão
            return { success: false, message: "Usuário não encontrado." };
        }

        const userType = rowsUserPrivilege[0].tipo;

        if (userType === 'Medico') {
            // Usuário sem permissão
            console.error('\nUsuário ID: ' + FormData.id_user + ' \nSem permissão para atualizar regulação.\n');
            connection.release(); // Libera a conexão
            return { success: false, message: "Usuário não tem permissão para realizar esta ação." };
        }

        // Verifica o status da regulação
        const [rowsRegulacaoStatus] = await connection.query(
            `SELECT status_regulacao FROM ${DBtable} WHERE num_regulacao = ? AND num_prontuario = ?`, 
            [FormData.num_regulacao, FormData.num_prontuario]
        );

        if (rowsRegulacaoStatus.length === 0) {
            console.error('Regulação não encontrada: num_regulacao:', FormData.num_regulacao);
            connection.release(); // Libera a conexão
            return { success: false, message: "Regulação não encontrada." };
        }

        const currentStatus = rowsRegulacaoStatus[0].status_regulacao;

        if (currentStatus !== 'ABERTO - NOVO') {
            console.error(`Regulação não pode ser atualizada: Status atual é '${currentStatus}'`);
            connection.release(); // Libera a conexão
            return {
                success: false,
                message: "Regulação já foi aprovada pelo médico e não pode ser atualizada ou modificada."
            };
        }

        // Atualiza os dados na tabela regulacao
        const [updateResult] = await connection.query(
            `UPDATE ${DBtable} 
             SET un_origem = ?, un_destino = ?, data_hora_solicitacao_02 = ?
             WHERE num_prontuario = ? AND num_regulacao = ?`,
            [
                FormData.un_origem, 
                FormData.un_destino, 
                FormData.data_hora_solicitacao_02,
                FormData.num_prontuario,
                FormData.num_regulacao
            ]
        );

        connection.release(); // Libera a conexão

        if (updateResult.affectedRows === 0) {
            console.error('Nenhum registro foi atualizado: Verifique os valores de num_prontuario e num_regulacao.');
            return { success: false, message: "Nenhum registro foi atualizado. Verifique os critérios fornecidos." };
        }

        console.log('Atualização bem-sucedida na tabela regulacao!');
        return { success: true, message: "Regulação atualizada com sucesso." };

    } catch (error) {
        // Tratamento de erro
        console.error('Erro na atualização:', error);
        return { success: false, message: "Erro ao atualizar regulação.", error };
    }
}

module.exports = AtualizaRegulacao;
