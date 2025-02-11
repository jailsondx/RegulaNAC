/// <reference types="node" />
import multer from "multer";
import path from "path";
import { fileURLToPath } from 'url';
import fs from "fs";
import UpdateLinkDOC from "../UpdateSQL/UpdateLink.js";

const NODE_URL = process.env.NODE_SERVER_IP + ":" + process.env.NODE_SERVER_PORT;

// Obter o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req:any, cb:any) => {
    const { year, month, day } = req.body;
    if (!year || !month || !day) {
      return cb(new Error("Dados de data não fornecidos."), null);
    }
    const uploadDir = path.join(__dirname, `../../uploadsReg/${year}/${month}/${day}`);
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (_req, _file, cb) => {
    const uniqueName = Date.now().toString();
    cb(null, `${uniqueName}.pdf`);
  },
});

const upload = multer({ storage });

async function uploadPDF(req:any, res:any) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Nenhum arquivo enviado" });
    }
    
    const { num_regulacao, year, month, day } = req.body;
    if (!num_regulacao || !year || !month || !day) {
      return res.status(400).json({ message: "Dados insuficientes na requisição." });
    }
    
    const fileUrl = `http://${NODE_URL}/uploadsReg/${year}/${month}/${day}/${req.file.filename}`;
    
    const responseLink = await UpdateLinkDOC(num_regulacao, req.file.filename);
    console.log(responseLink.message);
    console.log(`Arquivo vinculado com o nome único ${req.file.filename}: ${fileUrl}`);
    
    return res.json({ message: "Upload realizado com sucesso", fileUrl });
  } catch (error) {
    console.error("Erro durante o upload:", error);
    return res.status(500).json({ message: "Erro interno no servidor. Tente novamente mais tarde." });
  }
};

const uploadMiddleware = upload.single("file");

function viewPDF(year:string, month:string, day:string, filename:string) {
  const filePath = path.join(__dirname, `../../uploadsReg/${year}/${month}/${day}/${filename}`);
  
  if (fs.existsSync(filePath)) {
    return filePath;
  } else {
    return null;
  }
}

export { uploadPDF, uploadMiddleware, viewPDF };