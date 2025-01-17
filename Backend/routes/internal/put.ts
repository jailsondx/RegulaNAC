/// <reference types="node" />
const express = require('express');
const { getCurrentTimestamp } = require('../../functions/Time/Timestamp.ts');
const AtualizaRegulacao = require('../../functions/UpdateSQL/AtualizaRegulacao.ts')


const routerPut = express.Router();

routerPut.put('/AtualizaRegulacao', async (req, res) => {
  try {
    const formData = req.body;

    console.log(formData);

    
    // Envia a resposta logo após a chamada da função
    const { success, message, error } = await AtualizaRegulacao(formData);

    if(success){
      res.status(200).json({ message });
    } else {
      res.status(500).json({ message, error });
    }



    // Não é mais necessário, pois a resposta já foi enviada antes
    // console.log(formData);

  } catch (error) {
    console.error('Erro no processamento:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

module.exports = routerPut;
