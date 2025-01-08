/// <reference types="node" />
const express = require('express');
const ListaRegulacoesPendentes = require("../../functions/SelectSQL/ListaRegulacoesPendentes.ts");
const VerificaProntuario = require("../../functions/SelectSQL/VerificaProntuario.ts");
const VerificaRegulacao = require("../../functions/SelectSQL/VerificaRegulacao.ts");

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

router.get('/VerificaProntuario', async (req, res) => {
  const { num_prontuario } = req.query; // Extrai o parâmetro da consulta
  try {
    // Sua lógica para verificar prontuário

    const { success, message, data, error } = await VerificaProntuario(num_prontuario);

    if (success) {
      res.status(200).json({ message, data});
    } else {
      res.status(500).json({ message: 'Erro ao verificar pendências.', error });
    }
  } catch (error) {
    console.error('Erro no processamento:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

router.get('/VerificaRegulacao', async (req, res) => {
  const { num_regulacao } = req.query; // Extrai o parâmetro da consulta
  try {
    // Sua lógica para verificar prontuário

    const { success, message, data, error } = await VerificaRegulacao(num_regulacao);

    if (success) {
      res.status(200).json({ message, data});
    } else {
      res.status(500).json({ message: 'Erro ao verificar pendências.', error });
    }
  } catch (error) {
    console.error('Erro no processamento:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});


module.exports = router;
