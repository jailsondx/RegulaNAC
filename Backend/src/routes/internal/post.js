import express from 'express';
import { getCurrentTimestamp } from '../../functions/Time/Timestamp.js';
import { convertObjectToUpperCase } from '../../functions/Manipulation/ObjectUpperCase.js';
import NovaRegulacao from '../../functions/InsertSQL/NovaRegulacao.js';
import RegulacaoMedica from '../../functions/InsertSQL/RegulacaoMedica.js';
import RegulacaoOrigem from '../../functions/InsertSQL/RegulacaoOrigem.js';
import RegulacaoDestino from '../../functions/InsertSQL/RegulacaoDestino.js';
import Desfecho from '../../functions/InsertSQL/Desfecho.js';
import LoginUser from '../../functions/SelectSQL/LoginUser.js';
import CadastroUser from '../../functions/InsertSQL/CadastroUser.js';
import Transporte from '../../functions/InsertSQL/Transporte.js';
import { Externa_NovaRegulacao_Obstetrica } from '../../functions/InsertSQL/Externas/Externa_NovaRegulacao.js';

const routerPost = express.Router();

// Middleware para parsing de JSON
routerPost.use(express.json());

routerPost.post('/Login', async (req, res) => {
  try {
    const { username, password } = convertObjectToUpperCase(req.body);
    const result = await LoginUser(username, password);
    //res.status(200).json({ message: result.message, statusCode: result.statusCode, data: result.data });
    handleResponse(res, result);
  } catch (error) {
    console.error('Erro no processamento:', error);
  res.status(500).json({
    message: 'Erro interno do servidor',
    error: 'Erro desconhecido',
  });
  }
});

routerPost.post('/Cadastro', async (req, res) => {
  try {
    const formData = convertObjectToUpperCase(req.body);
    const result = await CadastroUser(formData);
    handleResponse(res, result);
  } catch (error) {
    console.error('Erro no processamento:', error);
  res.status(500).json({
    message: 'Erro interno do servidor',
    error: 'Erro desconhecido',
  });
  }
});

routerPost.post('/NovaRegulacao', async (req, res) => {
  try {
    const formData = convertObjectToUpperCase(req.body);
    const result = await NovaRegulacao(formData);
    handleResponse(res, result);
  } catch (error) {
    console.error('Erro no processamento:', error);
  res.status(500).json({
    message: 'Erro interno do servidor',
    error: 'Erro desconhecido',
  });
  }
});

routerPost.post('/NovaRegulacao/Externa/Obstetrica', async (req, res) => {
  try {
    const formData = convertObjectToUpperCase(req.body);
    const result = await Externa_NovaRegulacao_Obstetrica(formData);
    console.log('Dados recebidos:', formData);
    handleResponse(res, result);
  } catch (error) {
    console.error('Erro no processamento:', error);
  res.status(500).json({
    message: 'Erro interno do servidor',
    error: 'Erro desconhecido',
  });
  }
});

routerPost.post('/RegulacaoMedico', async (req, res) => {
  try {
    const formData = convertObjectToUpperCase(req.body);
    formData.data_hora_regulacao_medico = getCurrentTimestamp();
    const result = await RegulacaoMedica(formData);
    handleResponse(res, result);
  } catch (error) {
    console.error('Erro no processamento:', error);
  res.status(500).json({
    message: 'Erro interno do servidor',
    error: 'Erro desconhecido',
  });
  }
});

routerPost.post('/RegulacaoOrigem', async (req, res) => {
  try {
    const formData = convertObjectToUpperCase(req.body);
    const result = await RegulacaoOrigem(formData);
    handleResponse(res, result);
  } catch (error) {
    console.error('Erro no processamento:', error);
  res.status(500).json({
    message: 'Erro interno do servidor',
    error: 'Erro desconhecido',
  });
  }
});

routerPost.post('/RegulacaoDestino', async (req, res) => {
  try {
    const formData = convertObjectToUpperCase(req.body);
    const result = await RegulacaoDestino(formData);
    handleResponse(res, result);
  } catch (error) {
    console.error('Erro no processamento:', error);
  res.status(500).json({
    message: 'Erro interno do servidor',
    error: 'Erro desconhecido',
  });
  }
});

routerPost.post('/Transporte', async (req, res) => {
  try {
    const formData = convertObjectToUpperCase(req.body);
    const result = await Transporte(formData);
    handleResponse(res, result);
  } catch (error) {
    console.error('Erro no processamento:', error);
  res.status(500).json({
    message: 'Erro interno do servidor',
    error: 'Erro desconhecido',
  });
  }
});

routerPost.post('/Desfecho', async (req, res) => {
  try {
    const formData = convertObjectToUpperCase(req.body);
    const result = await Desfecho(formData);
    handleResponse(res, result);
  } catch (error) {
    console.error('Erro no processamento:', error);
  res.status(500).json({
    message: 'Erro interno do servidor',
    error: 'Erro desconhecido',
  });
  }
});

// Métodos auxiliares
const handleResponse = (res, result) => {
  if (result.success) {
    res.status(200).json({ message: result.message, data: result.data });
  } else {
    res.status(500).json({ 
      message: result.message, 
      error: result.error instanceof Error ? result.error.message : result.error 
    });
  }
};



export default routerPost;
