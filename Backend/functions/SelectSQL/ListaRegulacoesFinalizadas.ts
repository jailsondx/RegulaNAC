/// <reference types="node" />
const express = require('express');
const { DBconnection } = require("../../connection.ts"); // Importa apenas o objeto DBconnection
const { getCurrentTimestamp } = require("../Time/Timestamp.ts");

async function ListaRegulacoesFinalizadas() {
    const DBtable = 'regulacao';
    const DBtableDesfecho = 'desfecho';
    const Agora = new Date(); // Hora atual do servidor como objeto Date

    try {
        // Inicie a conexão com o banco de dados
        const connection = await DBconnection.getConnection();

        // Execute a query para selecionar os registros da tabela regulacao
        const [rows] = await connection.query(`
            SELECT * 
            FROM ${DBtable}
            WHERE status_regulacao LIKE ?
        `, ['FECHADO']);

        // Adicione os desfechos relacionados
        const idsRegulacao = rows.map(row => row.id_regulacao); // Obtenha todos os IDs de regulacao

        if (idsRegulacao.length > 0) {
            // Busque os desfechos para os IDs de regulacao obtidos
            const [desfechos] = await connection.query(`
                SELECT id_regulacao, desfecho 
                FROM ${DBtableDesfecho}
                WHERE id_regulacao IN (?)
            `, [idsRegulacao]);

            // Mapeie os desfechos aos registros correspondentes
            rows.forEach(row => {
                const desfechoRelacionado = desfechos.find(d => d.id_regulacao === row.id_regulacao);
                row.desfecho = desfechoRelacionado ? desfechoRelacionado.desfecho : null; // Adicione o desfecho ou null
            });
        }

        connection.release(); // Libera a conexão

        return { success: true, data: rows };

    } catch (error) {
        // Tratamento de erro
        console.error('Erro ao carregar regulacoes:', error);
        return { success: false, message: "Erro ao carregar regulacoes.", error };
    }
}

module.exports = ListaRegulacoesFinalizadas;
