/// <reference types="node" />
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const UpdateLinkDOC = require("../../functions/UpdateSQL/UpdateLink.ts");

const NODE_URL = process.env.NODE_SERVER_IP + ":" + process.env.NODE_SERVER_PORT;

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

// Configuração do Multer para armazenar arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${uniqueName}.pdf`); // Salvando o arquivo com nome único
  },
});

const upload = multer({ storage });

// Função para fazer upload de PDF
async function uploadPDF(req, res){
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

    console.log(`Arquivo vinculado com o nome único ${uniqueName}: ${fileUrl}`);

    return res.json({ message: "Upload realizado com sucesso", fileUrl });
  } catch (error) {
    console.error("Erro durante o upload:", error);
    return res.status(500).json({ message: "Erro interno no servidor. Tente novamente mais tarde." });
  }
};

// Middleware de upload
const uploadMiddleware = upload.single("file");

// Função para servir arquivos (visualização do PDF)
//const viewPDF = require("express").static(uploadDir);

// Função para gerar o caminho do arquivo dinamicamente
function viewPDF(year, month, day, filename) {
    const filePath = path.join(__dirname, `../../uploadsReg/${year}/${month}/${day}/${filename}.pdf`);
    
    // Verifica se o arquivo existe
    if (fs.existsSync(filePath)) {
      return filePath;
    } else {
      return null; // Retorna null se o arquivo não for encontrado
    }
  }

module.exports = {
  uploadPDF,
  uploadMiddleware,
  viewPDF,
};
