import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import UpdateLinkDOC from '../UpdateSQL/UpdateLink.js';

const NODE_URL = process.env.NODE_SERVER_IP + ':' + process.env.NODE_SERVER_PORT;

// Obter o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => { // Adicionando 'file' como segundo parâmetro
    const { year, month, day } = req.body;
    if (!year || !month || !day) {
      return cb(new Error('Dados de data não fornecidos.'), null);
    }
    const uploadDir = path.join(__dirname, `../../Upload/${year}/${month}/${day}`);
    
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

async function uploadPDF(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum arquivo enviado' });
    }
    
    const { num_regulacao, year, month, day } = req.body;
    if (!num_regulacao || !year || !month || !day) {
      return res.status(400).json({ message: 'Dados insuficientes na requisição.' });
    }

    const nomePDF = req.file.filename;
    const fileUrl = `http://${NODE_URL}/Upload/${year}/${month}/${day}/${nomePDF}`;
    
    
    //await UpdateLinkDOC(num_regulacao, req.file.filename);
    
    return res.json({ message: 'Upload realizado com sucesso', fileUrl, filename: nomePDF });
  } catch (error) {
    console.error('Erro durante o upload:', error);
    return res.status(500).json({ message: 'Erro interno no servidor. Tente novamente mais tarde.' });
  }
}

const uploadMiddleware = upload.single('file');

function viewPDF(year, month, day, filename) {
  const filePath = path.join(__dirname, `../../Upload/${year}/${month}/${day}/${filename}`);
  
  if (fs.existsSync(filePath)) {
    return filePath;
  } else {
    return null;
  }
}

export { uploadPDF, uploadMiddleware, viewPDF };
