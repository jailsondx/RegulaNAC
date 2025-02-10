// Importações usando ESM
import express, { Request, Response } from 'express';
import { convertObjectToUpperCase } from '../../functions/Manipulation/ObjectUpperCase.js';
import AtualizaRegulacao from '../../functions/UpdateSQL/AtualizaRegulacao.js';
import updateTransporte from '../../functions/UpdateSQL/Transporte.js';

/*IMPORT INTERFACES*/
import { ApiResponse } from '../../Interfaces/API.js';
import { RegulacaoData } from '../../Interfaces/Regulacao.js';
import { TransporteDatesData } from '../../Interfaces/Transporte.js';


const routerPut = express.Router();

// Middleware para parsing de JSON
routerPut.use(express.json());


// Rotas
routerPut.put('/AtualizaRegulacao', async (req: Request, res: Response) => {
  try {
    const formData = req.body as RegulacaoData; // Tipagem do corpo da requisição
    const result = await AtualizaRegulacao(formData) as any;
    handleResponse(res, result);
  } catch (error) {
    handleError(res, error);
  }
});

routerPut.put('/Transporte', async (req: Request, res: Response) => {
  try {
    const formData = convertObjectToUpperCase(req.body) as TransporteDatesData;
    console.log(formData); // Log para depuração

    const result = await updateTransporte(formData) as any;
    handleResponse(res, result);
  } catch (error) {
    handleError(res, error);
  }
});


// Métodos auxiliares para padronizar respostas e erros
const handleResponse = (res: Response, result: ApiResponse) => {
  if (result.success) {
    res.status(200).json({ message: result.message });
  } else {
    res.status(500).json({ message: result.message, error: result.error });
  }
};

const handleError = (res: Response, error: unknown) => {
  console.error('Erro no processamento:', error);
  res.status(500).json({
    message: 'Erro interno do servidor',
    error: error instanceof Error ? error.message : 'Erro desconhecido',
  });
};

export default routerPut;