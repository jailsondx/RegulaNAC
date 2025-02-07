/// <reference types="node" />
const express = require('express');
const { convertObjectToUpperCase } = require('../../functions/Manipulation/ObjectUpperCase.ts');
const {relatorioRegulacao, relatorioGerencial} = require('../../functions/SelectSQL/Relatorios.ts');

const routerReport = express.Router();
let lastGeneratedFilePath = null; // Variável para armazenar o último arquivo gerado

routerReport.post('/', async (req, res) => {

  const formData = convertObjectToUpperCase(req.body);

  try {
    // Chama a função para autenticar o usuário
    const { success, data, error, filePath } = await relatorioRegulacao(formData);

    if (success) {
      //res.status(200).json({ message: 'Relatorio gerado com sucesso.', data });/*
      res.status(200).download(filePath, `Relatorio.csv`, (err) => {
        if (err) {
            console.error('Erro ao fazer o download do arquivo:', err);
            res.status(500).send('Erro ao fazer o download do arquivo');
        }
    });
    } else {
      res.status(401).json({ message: 'Credenciais inválidas.', error });
    }
  } catch (error) {
    console.error('Erro no processamento:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
    
});

routerReport.post('/Gerencial', async (req, res) => {

  const formData = convertObjectToUpperCase(req.body);

  console.log(formData);

  try {
    // Chama a função para autenticar o usuário
    const { success, data, error, filePath } = await relatorioGerencial(formData);

    if (success) {
      //res.status(200).json({ message: 'Relatorio gerado com sucesso.', data });/*
      res.status(200).download(filePath, `RelatorioGerencial.csv`, (err) => {
        if (err) {
            console.error('Erro ao fazer o download do arquivo:', err);
            res.status(500).send('Erro ao fazer o download do arquivo');
        }
    });
    } else {
      res.status(401).json({ message: 'Credenciais inválidas.', error });
    }
  } catch (error) {
    console.error('Erro no processamento:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
    
});


module.exports = routerReport;
