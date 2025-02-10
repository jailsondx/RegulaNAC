// Importações usando ESM
import express, { Request, Response } from 'express';
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

/*IMPORT INTERFACES*/
import { NovaRegulacaoData, RegulacaoMedicoData } from '../../Interfaces/Regulacao.js';
import { UserData } from '../../Interfaces/User.js';
import { DestinoData, OrigemData, TransporteDatesData } from '../../Interfaces/Transporte.js';
import { DesfechoData } from '../../Interfaces/Desfecho.js';
import { ApiResponse } from '../../Interfaces/API.js';


const routerPost = express.Router();

// Middleware para parsing de JSON
routerPost.use(express.json());

routerPost.post('/Login', async (req: Request, res: Response) => {
  try {
    const { username, password } = convertObjectToUpperCase(req.body) as { username: string; password: string };

    const result = await LoginUser(username, password);
    handleResponse(res, result);

  } catch (error) {
    handleError(res, error);
  }
});

routerPost.post('/Cadastro', async (req: Request, res: Response) => {
  try {
    const formData = convertObjectToUpperCase(req.body) as UserData;
    const result = await CadastroUser(formData);
    handleResponse(res, result);

  } catch (error) {
    handleError(res, error);
  }
});

routerPost.post('/NovaRegulacao', async (req: Request, res: Response) => {
  try {
    const formData = convertObjectToUpperCase(req.body) as NovaRegulacaoData;
    const result = await NovaRegulacao(formData);
    handleResponse(res, result);

  } catch (error) {
    handleError(res, error);
  }
});

routerPost.post('/RegulacaoMedico', async (req: Request, res: Response) => {
  try {
    const formData = convertObjectToUpperCase(req.body) as RegulacaoMedicoData;
    formData.data_hora_regulacao_medico = getCurrentTimestamp();

    const result = await RegulacaoMedica(formData);
    handleResponse(res, result);

  } catch (error) {
    handleError(res, error);
  }
});

routerPost.post('/RegulacaoOrigem', async (req: Request, res: Response) => {
  try {
    const formData = convertObjectToUpperCase(req.body) as OrigemData;
    const result = await RegulacaoOrigem(formData) as any;
    handleResponse(res, result);

  } catch (error) {
    handleError(res, error);
  }
});

routerPost.post('/RegulacaoDestino', async (req: Request, res: Response) => {
  try {
    const formData = convertObjectToUpperCase(req.body) as DestinoData;
    const result = await RegulacaoDestino(formData) as any;
    handleResponse(res, result);

  } catch (error) {
    handleError(res, error);
  }
});

routerPost.post('/Transporte', async (req: Request, res: Response) => {
  try {
    const formData = convertObjectToUpperCase(req.body) as TransporteDatesData;
    const result = await Transporte(formData) as any;
    handleResponse(res, result);

  } catch (error) {
    handleError(res, error);
  }
});

routerPost.post('/Desfecho', async (req: Request, res: Response) => {
  try {
    const formData = convertObjectToUpperCase(req.body) as DesfechoData;
    const result = await Desfecho(formData) as any;
    handleResponse(res, result);

  } catch (error) {
    handleError(res, error);
  }
});



// Métodos auxiliares
const handleResponse = (res: Response, result: ApiResponse) => {
  if (result.success) {
    res.status(200).json({ message: result.message, data: result.data });
  } else {
    res.status(500).json({ 
      message: result.message, 
      error: result.error instanceof Error ? result.error.message : result.error 
    });
  }
};

const handleError = (res: Response, error: unknown) => {
  console.error('Erro no processamento:', error);
  res.status(500).json({
    message: 'Erro interno do servidor',
    error: error instanceof Error ? error.message : 'Erro desconhecido'
  });
};

export default routerPost;