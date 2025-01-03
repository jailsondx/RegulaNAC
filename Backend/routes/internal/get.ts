/// <reference types="node" />
const express = require('express');
const ListaRegulacoesPendentes = require("../../functions/SelectSQL/ListaRegulacoesPendentes.ts");

const router = express.Router();

router.get('/ListaRegulacoesPendentes', async (req, res) => {
  try {
    // Chama a função para buscar as regulagens pendentes
    const { success, data, error } = await ListaRegulacoesPendentes();

    if (success) {
      res.status(200).json({ message: 'Lista de regulações carregada com sucesso.', data });
    } else {
      res.status(500).json({ message: 'Erro ao carregar lista de regulações.', error });
    }
  } catch (error) {
    console.error('Erro no processamento:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

module.exports = router;
