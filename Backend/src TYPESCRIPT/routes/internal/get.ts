// Importações usando ESM
import express, { Request, Response } from 'express';
import { ListaRegulacoesPendentes, ListaRegulacoesPendentes24 } from '../../functions/SelectSQL/ListaRegulacoesPendentes.js';
import ListaRegulacoesAprovadas from '../../functions/SelectSQL/ListaRegulacoesAprovadas.js';
import VerificaProntuario from '../../functions/SelectSQL/VerificaProntuario.js';
import { VerificaRegulacao } from '../../functions/SelectSQL/VerificaRegulacao.js';
import ListaMedicos from '../../functions/SelectSQL/ListaMedicos.js';
import PesquisaPaciente from '../../functions/SelectSQL/PesquisaPaciente.js';
import ListaRegulacoesFinalizadas from '../../functions/SelectSQL/ListaRegulacoesFinalizadas.js';

/*IMPORT INTERFACES*/
import { ApiResponse } from '../../Interfaces/API.js';

const routerGet = express.Router();

// Middleware para parsing de JSON
routerGet.use(express.json());


// Rotas
routerGet.get('/ListaRegulacoesPendentes', async (req: Request, res: Response) => {
  try {
    const result = await ListaRegulacoesPendentes() as any;
    const serverTime = new Date().toISOString();
    handleResponse(res, result , serverTime);
  } catch (error:any) {
    console.error('Erro no processamento:', error);
  res.status(500).json({
    message: 'Erro interno do servidor',
    error: 'Erro desconhecido',
  });
  }
});

routerGet.get('/ListaRegulacoesFinalizadas', async (req: Request, res: Response) => {
  try {
    const result = await ListaRegulacoesFinalizadas() as any;
    const serverTime = new Date().toISOString();
    handleResponse(res, result, serverTime);
  } catch (error:any) {
    console.error('Erro no processamento:', error);
  res.status(500).json({
    message: 'Erro interno do servidor',
    error: 'Erro desconhecido',
  });
  }
});

routerGet.get('/ListaRegulacoesPendentes24', async (req: Request, res: Response) => {
  try {
    const result = await ListaRegulacoesPendentes24() as any;
    const serverTime = new Date().toISOString();
    handleResponse(res, result, serverTime);
  } catch (error:any) {
    console.error('Erro no processamento:', error);
  res.status(500).json({
    message: 'Erro interno do servidor',
    error: 'Erro desconhecido',
  });
  }
});

routerGet.get('/ListaRegulacoesAprovadas', async (req: Request, res: Response) => {
  try {
    const result = await ListaRegulacoesAprovadas() as any;
    handleResponse(res, result);
  } catch (error:any) {
    console.error('Erro no processamento:', error);
  res.status(500).json({
    message: 'Erro interno do servidor',
    error: 'Erro desconhecido',
  });
  }
});

routerGet.get('/VerificaProntuario', async (req: Request, res: Response) => {
  try {
    const { num_prontuario } = req.query as { num_prontuario: string };
    const result = await VerificaProntuario(num_prontuario);
    handleResponse(res, result);
  } catch (error:any) {
    console.error('Erro no processamento:', error);
  res.status(500).json({
    message: 'Erro interno do servidor',
    error: 'Erro desconhecido',
  });
  }
});

routerGet.get('/VerificaRegulacao', async (req: Request, res: Response) => {
  try {
    const { num_regulacao } = req.query as { num_regulacao: string };
    const result = await VerificaRegulacao(num_regulacao);
    handleResponse(res, result);
  } catch (error:any) {
    console.error('Erro no processamento:', error);
  res.status(500).json({
    message: 'Erro interno do servidor',
    error: 'Erro desconhecido',
  });
  }
});

routerGet.get('/ListaMedicos', async (req: Request, res: Response) => {
  try {
    const result = await ListaMedicos() as any;
    handleResponse(res, result);
  } catch (error:any) {
    console.error('Erro no processamento:', error);
  res.status(500).json({
    message: 'Erro interno do servidor',
    error: 'Erro desconhecido',
  });
  }
});

routerGet.get('/PesquisaPaciente', async (req: Request, res: Response) => {
  try {
    const { nomePaciente, numProntuario, numRegulacao, statusRegulacao } = req.query as {
      nomePaciente: string;
      numProntuario: string;
      numRegulacao: string;
      statusRegulacao: string;
    };
    const serverTime = new Date().toISOString();
    const result = await PesquisaPaciente(nomePaciente, numProntuario, numRegulacao, statusRegulacao) as any;
    handleResponse(res, result, serverTime);
  } catch (error:any) {
    console.error('Erro no processamento:', error);
  res.status(500).json({
    message: 'Erro interno do servidor',
    error: 'Erro desconhecido',
  });
  }
});

// Métodos auxiliares para padronizar respostas e erros
const handleResponse = (res: Response, result: ApiResponse, serverTime?: string) => {
  if (result.success) {
    res.status(200).json({ message: result.message, data: result.data, serverTime });
  } else {
    res.status(500).json({ message: result.message, error: result.error });
  }
};

const handleError = (res: Response, error: unknown) => {
  console.error('Erro no processamento:', error);
  res.status(500).json({
    message: 'Erro interno do servidor',
    error: 'Erro desconhecido',
  });
};

export default routerGet;