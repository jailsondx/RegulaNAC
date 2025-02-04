/// <reference types="node" />
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const UpdateLinkDOC = require("../../functions/UpdateSQL/UpdateLink.ts");

const NODE_URL = process.env.NODE_SERVER_IP + ":" + process.env.NODE_SERVER_PORT;

// Configuração do Multer para armazenar arquivos utilizando a data enviada no corpo da requisição
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Extrai os valores de data do corpo da requisição
    const { year, month, day } = req.body;
    if (!year || !month || !day) {
      // Se algum dos dados não for fornecido, retorna um erro
      return cb(new Error("Dados de data não fornecidos."), null);
    }
    // Monta o diretório de upload com base nos dados recebidos
    const uploadDir = path.join(__dirname, `../../uploadsReg/${year}/${month}/${day}`);
    
    // Cria o diretório caso não exista
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Gera um nome único para o arquivo com base no timestamp
    const uniqueName = Date.now().toString();
    cb(null, `${uniqueName}.pdf`);
  },
});

// Middleware do Multer para upload de arquivo (campo "file")
const upload = multer({ storage });

// Função para realizar o upload do PDF
async function uploadPDF(req, res) {
  try {
    // Verifica se o arquivo foi enviado
    if (!req.file) {
      return res.status(400).json({ message: "Nenhum arquivo enviado" });
    }
    
    // Extrai os dados necessários do corpo da requisição
    const { num_regulacao, year, month, day } = req.body;
    if (!num_regulacao || !year || !month || !day) {
      return res.status(400).json({ message: "Dados insuficientes na requisição." });
    }
    
    // Monta a URL do arquivo utilizando os dados enviados
    const fileUrl = `http://${NODE_URL}/uploadsReg/${year}/${month}/${day}/${req.file.filename}`;
    
    // Atualiza o link do documento no banco, passando o filename gerado
    const responseLink = await UpdateLinkDOC(num_regulacao, req.file.filename);
    console.log(responseLink.message);
    console.log(`Arquivo vinculado com o nome único ${req.file.filename}: ${fileUrl}`);
    
    return res.json({ message: "Upload realizado com sucesso", fileUrl });
  } catch (error) {
    console.error("Erro durante o upload:", error);
    return res.status(500).json({ message: "Erro interno no servidor. Tente novamente mais tarde." });
  }
};

// Middleware de upload para ser utilizado na rota
const uploadMiddleware = upload.single("file");

// Função para gerar o caminho do arquivo dinamicamente (para visualização do PDF)
function viewPDF(year, month, day, filename) {
  const filePath = path.join(__dirname, `../../uploadsReg/${year}/${month}/${day}/${filename}`);
  
  // Verifica se o arquivo existe
  if (fs.existsSync(filePath)) {
    return filePath;
  } else {
    return null;
  }
}

module.exports = {
  uploadPDF,
  uploadMiddleware,
  viewPDF,
};
