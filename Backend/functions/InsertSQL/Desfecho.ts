/// <reference types="node" />
const express = require('express');
const { DBconnection } = require("../../connection.ts"); // Importa apenas o objeto DBconnection
const VerificaStatus = require("../Checked/VerificaStatus.ts");
const UpdateStatus = require("../UpdateSQL/UpdateStatus.ts");

async function Desfecho(FormData) {
    const DBtable = 'desfecho';
    const DBtableUsuarios = 'usuarios';
    const StatusAtual = 'ABERTO - APROVADO - AGUARDANDO DESFECHO';
    const NovoStatus = 'FECHADO';
    const msgError = 'Desfecho não pode ser atualizado; Status atual é: ';

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

        // Usuário possui permissão, insira os dados no banco
        const [result] = await connection.query(
            `INSERT INTO ${DBtable} SET ?`,
            FormData
        );
        await UpdateStatus(FormData.id_regulacao, NovoStatus);

        return { success: true, message: "Desfecho: Cadastrada com Sucesso." };

    } catch (error) {
        // Tratamento de erro
        console.error('Erro no cadastro Desfecho:', error);
        return { success: false, message: "Erro ao cadastrar Desfecho.", error };
    }
}

module.exports = Desfecho;
