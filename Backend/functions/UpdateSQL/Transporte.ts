/// <reference types="node" />
const express = require('express');
const { DBconnection } = require("../../connection.ts"); // Importa apenas o objeto DBconnection
const VerificaStatus = require("../Checked/VerificaStatus.ts");
const UpdateStatus = require("../UpdateSQL/UpdateStatus.ts");

async function updateTransporte(FormData) {
    const DBtable = 'transporte';
    const DBtableUsuarios = 'usuarios';
    const StatusAtual = 'ABERTO - APROVADO - AGUARDANDO FINALIZACAO TRANSPORTE';
    const NovoStatus = 'ABERTO - APROVADO - AGUARDANDO DESFECHO';
    const msgError = 'Finalização do Transporte não pode ser realizado; Status atual é: ';

    try {
        // Inicie a conexão com o banco de dados
        const connection = await DBconnection.getConnection();

        // Verifica a permissão do usuário
        const [rowsUserPrivilege] = await connection.query(
            `SELECT tipo FROM ${DBtableUsuarios} WHERE id_user = ?`, 
            [FormData.id_user]
        );

        connection.release(); // Libera a conexão

        if (rowsUserPrivilege.length === 0) {
            // Usuário não encontrado
            console.error('Usuário não encontrado: ID:', FormData.id_user);
            return { success: false, message: "Usuário não encontrado." };
        }

        const userType = rowsUserPrivilege[0].tipo;

        if (userType === 'MEDICO') {
            // Usuário sem permissão
            console.error('\nUsuário ID: ' + FormData.id_user + ' \nSem permissão: Regulação Origem\n');
            return { success: false, message: "Usuário não tem permissão para realizar esta ação." };
        }

        // Verifica o status da regulação
        const statusCheck = await VerificaStatus(FormData.id_regulacao, StatusAtual, msgError);

        if (!statusCheck.success) {
            // Retorna a mensagem de erro da VerificaStatus
            return { success: false, message: statusCheck.message };
        }

        // Usuário possui permissão, atualize os dados no banco
        const [result] = await connection.query(
            `UPDATE ${DBtable} SET ? WHERE id_regulacao = ?`, 
            [FormData, FormData.id_regulacao]
        );

        // Verifica se algum registro foi atualizado
        if (result.affectedRows === 0) {
            return { success: false, message: "Nenhum registro foi atualizado, verifique se o id_regulacao está correto." };
        }

        await UpdateStatus(FormData.id_regulacao, NovoStatus);

        return { success: true, message: "Transporte atualizado com sucesso." };

    } catch (error) {
        // Tratamento de erro
        console.error('Erro ao atualizar Transporte:', error);
        return { success: false, message: "Erro ao atualizar Transporte.", error };
    }
}

module.exports = updateTransporte;
