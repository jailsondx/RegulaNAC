/// <reference types="node" />
const path = require('path');
const fs = require('fs');
const multer = require('multer');

async function uploadPDF(NODE_URL, num_regulacao) {
  try {

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
}

module.exports = uploadPDF;