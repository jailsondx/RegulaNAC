const express = require("express");
const path = require("path");
const fs = require("fs");
const { uploadPDF: handleUploadPDF, uploadMiddleware: handleuploadMiddleware, viewPDF: handlviewPDF } = require("../../functions/Controller/pdfController.ts");

const routerUpload = express.Router();


routerUpload.post("/uploadPDF", handleuploadMiddleware, async (req, res) => {
  try {
    await handleUploadPDF(req, res);
  } catch (error) {
    console.error("Erro na rota de upload:", error);
    return res.status(500).json({ message: "Erro interno no servidor." });
  }
});

routerUpload.get("/ViewPDF", async (req, res) => {
  const { year, month, day, filename } = req.query;

  // Validar se todos os parâmetros foram passados
  if (!year || !month || !day || !filename) {
    return res.status(400).json({ message: 'Parâmetros inválidos' });
  }

  // Montar o caminho absoluto para o arquivo PDF
  const filePath = path.join(__dirname, '../../uploadsReg/', year, month, day, filename + '.pdf');
  console.log('Caminho do arquivo:', filePath);  // Verifique no terminal se o caminho está correto

   // Verificar se o arquivo existe
   if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'Arquivo não encontrado' });  // Erro 404: Arquivo não encontrado
  }

  // Enviar o arquivo como resposta
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('Erro ao buscar o arquivo:', err);  // Detalhes do erro
      res.status(500).json({ message: 'Erro ao buscar o arquivo' });
    }
  });
});

module.exports = routerUpload;
