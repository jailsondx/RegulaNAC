import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { 
  uploadPDF as handleUploadPDF, 
  uploadMiddleware as handleuploadMiddleware, 
} from '../../functions/Controller/pdfController.js';

// Obter o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const routerUpload = express.Router();

// Rota para upload de PDF
routerUpload.post('/uploadPDF', handleuploadMiddleware, async (req, res) => {
  try {
    await handleUploadPDF(req, res);
  } catch (error) {
    console.error('Erro na rota de upload:', error);
    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
});

// Rota para visualizar PDF
routerUpload.get('/ViewPDF', async (req, res) => {
  const { year, month, day, filename } = req.query;

  // Validação de parâmetros
  if (!year || !month || !day || !filename) {
    return res.status(400).json({ message: 'Parâmetros inválidos' });
  }

  // Caminho do arquivo
  const filePath = path.join(__dirname, '../../uploadsReg/', year, month, day, filename);
  console.log('Caminho do arquivo:', filePath);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'Arquivo não encontrado' });
  }

  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('Erro ao buscar o arquivo:', err);
      return res.status(500).json({ message: 'Erro ao buscar o arquivo' });
    }
  });
});

export default routerUpload;
