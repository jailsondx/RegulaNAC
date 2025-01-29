/// <reference types="node" />
const express = require('express');
const { getCurrentTimestamp } = require('../../functions/Time/Timestamp.ts');
const { convertObjectToUpperCase } = require('../../functions/Manipulation/ObjectUpperCase.ts');
const AtualizaRegulacao = require('../../functions/UpdateSQL/AtualizaRegulacao.ts');
const updateTransporte = require('../../functions/UpdateSQL/Transporte.ts');


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

routerPut.put('/Transporte', async (req, res) => {
  try {
    const formData = convertObjectToUpperCase(req.body);console.log(formData);
    //formData.data_hora_regulacao_medico = getCurrentTimestamp();

    // Envia a resposta logo após a chamada da função
    const { success, message, error } = await updateTransporte(formData);

    if(success){
      res.status(200).json({ message});
    } else {
      res.status(500).json({ message, error });
    }

  } catch (error) {
    console.error('Erro no processamento:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

module.exports = routerPut;
