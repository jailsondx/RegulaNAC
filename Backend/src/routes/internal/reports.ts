// Importações usando ESM
import express, { Request, Response } from 'express';
import { convertObjectToUpperCase } from '../../functions/Manipulation/ObjectUpperCase.js';
import { relatorioRegulacao, relatorioGerencial } from '../../functions/SelectSQL/Relatorios.js';

/*IMPORT INTERFACES*/
//import { ApiResponse } from '../../Interfaces/API.js';

const routerReport = express.Router();
//let lastGeneratedFilePath: string | null = null; // Variável para armazenar o último arquivo gerado



// Rota para relatório de regulação
routerReport.post('/', async (req: Request, res: Response) => {
  try {
    const formData = convertObjectToUpperCase(req.body) as Record<string, unknown>;
    const result = await relatorioRegulacao(formData);

    if (result.success && result.filePath) {
      handleDownload(res, result.filePath, 'Relatorio.csv');
    } else {
      res.status(401).json({ message: 'Credenciais inválidas.', error: result.error });
    }
  } catch (error) {
    handleError(res, error);
  }
});

// Rota para relatório gerencial
routerReport.post('/Gerencial', async (req: Request, res: Response) => {
  try {
    const formData = convertObjectToUpperCase(req.body) as Record<string, unknown>;
    console.log(formData); // Log para depuração

    const result = await relatorioGerencial(formData);

    if (result.success && result.filePath) {
      handleDownload(res, result.filePath, 'RelatorioGerencial.csv');
    } else {
      res.status(401).json({ message: 'Credenciais inválidas.', error: result.error });
    }
  } catch (error) {
    handleError(res, error);
  }
});


// Métodos auxiliares para padronizar respostas e erros
const handleDownload = (res: Response, filePath: string, fileName: string) => {
  res.status(200).download(filePath, fileName, (err) => {
    if (err) {
      console.error('Erro ao fazer o download do arquivo:', err);
      res.status(500).send('Erro ao fazer o download do arquivo');
    }
  });
};

const handleError = (res: Response, error: unknown) => {
  console.error('Erro no processamento:', error);
  res.status(500).json({
    message: 'Erro interno do servidor',
    error: error instanceof Error ? error.message : 'Erro desconhecido',
  });
};

export default routerReport;