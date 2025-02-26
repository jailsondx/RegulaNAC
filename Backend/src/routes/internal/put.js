import express from 'express';
import { convertObjectToUpperCase } from '../../functions/Manipulation/ObjectUpperCase.js';
import AtualizaRegulacao from '../../functions/UpdateSQL/AtualizaRegulacao.js';
import updateTransporte from '../../functions/UpdateSQL/Transporte.js';
import EditaRegulacao from '../../functions/UpdateSQL/EditaRegulacao.js';

const routerPut = express.Router();

// Middleware para parsing de JSON
routerPut.use(express.json());

// Rotas
routerPut.put('/AtualizaRegulacao', async (req, res) => {
  try {
    const formData = req.body; // Corpo da requisição
    const result = await AtualizaRegulacao(formData);
    handleResponse(res, result);
  } catch (error) {
    console.error('Erro no processamento:', error);
  res.status(500).json({
    message: 'Erro interno do servidor',
    error: 'Erro desconhecido',
  });
  }
});

routerPut.put('/EditaRegulacao', async (req, res) => {
  try {
    const formData = convertObjectToUpperCase(req.body);
    const result = await EditaRegulacao(formData);
    handleResponse(res, result);
  } catch (error) {
    console.error('Erro no processamento:', error);
  res.status(500).json({
    message: 'Erro interno do servidor',
    error: 'Erro desconhecido',
  });
  }
});


routerPut.put('/Transporte', async (req, res) => {
  try {
    const formData = convertObjectToUpperCase(req.body); // Converte os dados para maiúsculas

    const result = await updateTransporte(formData);
    handleResponse(res, result);
  } catch (error) {
    console.error('Erro no processamento:', error);
  res.status(500).json({
    message: 'Erro interno do servidor',
    error: 'Erro desconhecido',
  });
  }
});

// Métodos auxiliares para padronizar respostas e erros
const handleResponse = (res, result) => {
  if (result.success) {
    res.status(200).json({ message: result.message });
  } else {
    res.status(500).json({ message: result.message, error: result.error });
  }
};

const handleError = (res, error) => {
  console.error('Erro no processamento:', error);
  res.status(500).json({
    message: 'Erro interno do servidor',
    error: error instanceof Error ? error.message : 'Erro desconhecido',
  });
};

export default routerPut;
