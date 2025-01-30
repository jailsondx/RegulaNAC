/// <reference types="node" />
const express = require('express');
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const UpdateLinkDOC = require('../../functions/UpdateSQL/UpdateLink.ts');

const NODE_URL = process.env.NODE_SERVER_IP+':'+process.env.NODE_SERVER_PORT;

const routerUpload = express.Router();

// Obtém a data atual
const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, "0");
const day = String(now.getDate()).padStart(2, "0");

const uniqueName = Date.now().toString(); // Nome único com base no timestamp

// Caminho dinâmico das pastas de armazenamento (uploads/AAAA-MM-DD)
const uploadDir = path.join(__dirname, `../../uploadsReg/${year}/${month}/${day}`);

// Criar a pasta se não existir
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuração do Multer para salvar arquivos organizados por data
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Usando Date.now() para garantir um nome único para o arquivo
    
    cb(null, `${uniqueName}.pdf`); // Salvando o arquivo com o nome único
  },
});

const upload = multer({ storage });

// Rota para upload de PDF vinculado a uma regulação
routerUpload.post("/uploadPDF", upload.single("file"), async (req, res) => {
const { num_regulacao } = req.body;

  try {
    // Verifica se o arquivo foi enviado
    if (!req.file) {
      return res.status(400).json({ message: "Nenhum arquivo enviado" });
    }

    // URL para acessar o arquivo
    const fileUrl = `http://${NODE_URL}/uploadsReg/${year}/${month}/${day}/${req.file.filename}`;

    // Chama a função UpdateLinkDOC passando o nome único
    const responseLink = await UpdateLinkDOC(num_regulacao, uniqueName);
    console.log(responseLink.message);

    // Aqui você pode salvar o `fileUrl` no banco de dados vinculado ao `uniqueName`
    console.log(`Arquivo vinculado com o nome único ${uniqueName}: ${fileUrl}`);

    // Responde com sucesso
    return res.json({ message: "Upload realizado com sucesso", fileUrl });
  } catch (error) {
    console.error('Erro durante o upload:', error);
    return res.status(500).json({ message: "Erro interno no servidor. Tente novamente mais tarde." });
  }
});

// Rota para servir os arquivos da pasta "uploads"
routerUpload.use("/ViewPDF", express.static(uploadDir));

module.exports = routerUpload;
