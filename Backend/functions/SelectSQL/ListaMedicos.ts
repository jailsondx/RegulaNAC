/// <reference types="node" />
const express = require('express');
const { DBconnection } = require("../../connection.ts"); // Importa apenas o objeto DBconnection

async function ListaMedicos() {
    const DBtable = 'usuarios';

    try {
        const connection = await DBconnection.getConnection();

        const [rows] = await connection.query(`SELECT nome FROM ${DBtable} WHERE tipo = ?`, ['Medico']);

        connection.release();

        // Extrai apenas os nomes dos médicos
        const nomes = rows.map((row) => row.nome);

        //console.log(nomes); // Verifica os nomes extraídos
        return { success: true, data: nomes };
    } catch (error) {
        console.error('Erro ao carregar médicos:', error);
        return { success: false, message: "Erro ao carregar médicos.", error };
    }
}

module.exports = ListaMedicos;


module.exports = ListaMedicos;
