import express from 'express';
import { convertObjectToUpperCase } from '../../functions/Manipulation/ObjectUpperCase.js';
import { relatorioRegulacao, relatorioGerencial } from '../../functions/SelectSQL/Relatorios.js';

const routerReport = express.Router();

// Rota para relatório de regulação
routerReport.post('/', async (req, res) => {
  try {
    const formData = convertObjectToUpperCase(req.body); // Converte os dados para maiúsculas
    const result = await relatorioRegulacao(formData);

    if (result.success && result.filePath) {
      handleDownload(res, result.filePath, 'Relatorio.csv');
    } else {
      res.status(401).json({ message: 'Credenciais inválidas.', error: result.error });
    }
  } catch (error) {
    console.error('Erro no processamento:', error);
  res.status(500).json({
    message: 'Erro interno do servidor',
    error: 'Erro desconhecido',
  });
  }
});

// Rota para relatório gerencial
routerReport.post('/Gerencial', async (req, res) => {
  try {
    const formData = convertObjectToUpperCase(req.body); // Converte os dados para maiúsculas

    const result = await relatorioGerencial(formData);

    if (result.success && result.filePath) {
      handleDownload(res, result.filePath, 'RelatorioGerencial.csv');
    } else {
      res.status(401).json({ message: 'Credenciais inválidas.', error: result.error });
    }
  } catch (error) {
    console.error('Erro no processamento:', error);
  res.status(500).json({
    message: 'Erro interno do servidor',
    error: 'Erro desconhecido',
  });
  }
});

// Métodos auxiliares para padronizar respostas e erros
const handleDownload = (res, filePath, fileName) => {
  res.status(200).download(filePath, fileName, (err) => {
    if (err) {
      console.error('Erro ao fazer o download do arquivo:', err);
      res.status(500).send('Erro ao fazer o download do arquivo');
    }
  });
};

const handleError = (res, error) => {
  console.error('Erro no processamento:', error);
  res.status(500).json({
    message: 'Erro interno do servidor',
    error: error instanceof Error ? error.message : 'Erro desconhecido',
  });
};

export default routerReport;
