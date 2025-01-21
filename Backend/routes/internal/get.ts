/// <reference types="node" />
const express = require('express');
const { ListaRegulacoesPendentes, ListaRegulacoesPendentes24 } = require("../../functions/SelectSQL/ListaRegulacoesPendentes.ts");
const ListaRegulacoesAprovadas = require("../../functions/SelectSQL/ListaRegulacoesAprovadas.ts");
const VerificaProntuario = require("../../functions/SelectSQL/VerificaProntuario.ts");
const VerificaRegulacao = require("../../functions/SelectSQL/VerificaRegulacao.ts");
const ListaMedicos = require("../../functions/SelectSQL/ListaMedicos.ts");

const routerGet = express.Router();

routerGet.get('/ListaRegulacoesPendentes', async (req, res) => {
  try {
    // Chama a função para buscar as regulagens pendentes
    const { success, data, error } = await ListaRegulacoesPendentes();
    const serverTime = new Date().toISOString(); // Hora atual do servidor em formato ISO

    if (success) {
      res.status(200).json({ message: 'Lista de regulações carregada com sucesso.', data, serverTime });
    } else {
      res.status(500).json({ message: 'Erro ao carregar lista de regulações.', error });
    }
  } catch (error) {
    console.error('Erro no processamento:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

routerGet.get('/ListaRegulacoesPendentes24', async (req, res) => {
  try {
    // Chama a função para buscar as regulagens pendentes
    const { success, data, error } = await ListaRegulacoesPendentes24();
    const serverTime = new Date().toISOString(); // Hora atual do servidor em formato ISO

    if (success) {
      res.status(200).json({ message: 'Lista de regulações carregada com sucesso.', data, serverTime });
    } else {
      res.status(500).json({ message: 'Erro ao carregar lista de regulações.', error });
    }
  } catch (error) {
    console.error('Erro no processamento:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

routerGet.get('/ListaRegulacoesAprovadas', async (req, res) => {
  try {
    // Chama a função para buscar as regulagens pendentes
    const { success, data, error } = await ListaRegulacoesAprovadas();

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

routerGet.get('/VerificaProntuario', async (req, res) => {
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

routerGet.get('/VerificaRegulacao', async (req, res) => {
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

routerGet.get('/ListaMedicos', async (req, res) => {
  
  try {
    // Sua lógica para verificar prontuário

    const { success, data, error } = await ListaMedicos();

    if (success) {
      res.status(200).json({ message: 'Lista Carregada', data});
    } else {
      res.status(500).json({ message: 'Erro na lista de médicos.', error });
    }
  } catch (error) {
    console.error('Erro no processamento:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

module.exports = routerGet;
