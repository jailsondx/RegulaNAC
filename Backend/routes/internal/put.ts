/// <reference types="node" />
const express = require('express');
const { getCurrentTimestamp } = require('../../functions/Time/Timestamp.ts');
const AtualizaRegulacao = require('../../functions/UpdateSQL/AtualizaRegulacao.ts')


const routerPut = express.Router();

routerPut.put('/AtualizaRegulacao', async (req, res) => {
  try {
    const formData = req.body;
    
    // Envia a resposta logo após a chamada da função
    const { success, message, error } = await AtualizaRegulacao(formData);

    if(success){
      res.status(200).json({ message });
    } else {
      res.status(500).json({ message, error });
    }

  } catch (error) {
    console.error('Erro no processamento:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

module.exports = routerPut;
