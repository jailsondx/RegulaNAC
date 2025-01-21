/// <reference types="node" />
const express = require('express');
const { DBconnection } = require("../../connection.ts"); // Importa apenas o objeto DBconnection
const UpdateStatus = require("../UpdateSQL/UpdateStatus.ts");

async function RegulacaoOrigem(FormData) {
    const DBtable = 'setor_origem';
    const DBtableUsuarios = 'usuarios';
    const NovoStatus = 'ABERTO - APROVADA - ESPERANDO DESTINO';

    console.log(FormData);
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

        if (userType === 'Medico') {
            // Usuário sem permissão
            console.error('\nUsuário ID: ' + FormData.id_user + ' \nSem permissão: Regulação Origem\n');
            return { success: false, message: "Usuário não tem permissão para realizar esta ação." };
        }

        // Usuário possui permissão, insira os dados no banco
        const [result] = await connection.query(
            `INSERT INTO ${DBtable} SET ?`, 
            FormData
        );

        const UpdateStatusRegulacao = UpdateStatus(FormData.id_regulacao, NovoStatus);

        return { success: true, message: "Regulação Origem: sucesso." };

    } catch (error) {
        // Tratamento de erro
        console.error('Erro no cadastro Regulação Origem:', error);
        return { success: false, message: "Erro ao cadastrar Regulação Origem.", error };
    }
}

module.exports = RegulacaoOrigem;
