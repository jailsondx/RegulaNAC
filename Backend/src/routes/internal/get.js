import express from 'express';
import { ListaRegulacoesPendentes, ListaRegulacoesPendentes24 } from '../../functions/SelectSQL/ListaRegulacoesPendentes.js';
import ListaRegulacoesAprovadas from '../../functions/SelectSQL/ListaRegulacoesAprovadas.js';
import {VerificaProntuario, VerificaProntuarioAutoComplete} from '../../functions/SelectSQL/VerificaProntuario.js';
import { VerificaRegulacao } from '../../functions/SelectSQL/VerificaRegulacao.js';
import ListaMedicos from '../../functions/SelectSQL/ListaMedicos.js';
import PesquisaPaciente from '../../functions/SelectSQL/PesquisaPaciente.js';
import ListaRegulacoesFinalizadas from '../../functions/SelectSQL/ListaRegulacoesFinalizadas.js';
import ListaRegulacoesNegadas from '../../functions/SelectSQL/ListaRegulacoesNegadas.js';
import VerificaID from '../../functions/SelectSQL/VerificaID.js';
import RecebeHoraLeito from '../../functions/SelectSQL/RecebeHoraLeito.js';
import ListaRegulacoesPreAprovadas from '../../functions/SelectSQL/ListaRegulacoesPreAprovadas.js';
import ListaRegulacoesAprovadas_Todas from '../../functions/SelectSQL/ListaRegulacoesAprovadas_Todas.js';



const routerGet = express.Router();

// Middleware para parsing de JSON
routerGet.use(express.json());

// Rotas
routerGet.get('/ListaRegulacoesPendentes', async (req, res) => {
  try {
    const result = await ListaRegulacoesPendentes('Interna');
    const serverTime = new Date().toISOString();
    handleResponse(res, result , serverTime);
  } catch (error) {
    handleError(res, error);
  }
});

routerGet.get('/Externa/ListaRegulacoesPendentes', async (req, res) => {
  try {
    const result = await ListaRegulacoesPendentes('Externa');
    const serverTime = new Date().toISOString();
    handleResponse(res, result , serverTime);
  } catch (error) {
    handleError(res, error);
  }
});

routerGet.get('/ListaRegulacoesFinalizadas', async (req, res) => {
  try {
    const result = await ListaRegulacoesFinalizadas();
    const serverTime = new Date().toISOString();
    handleResponse(res, result, serverTime);
  } catch (error) {
    handleError(res, error);
  }
});

routerGet.get('/ListaRegulacoesNegadas', async (req, res) => {
  try {
    const result = await ListaRegulacoesNegadas();
    const serverTime = new Date().toISOString();
    handleResponse(res, result, serverTime);
  } catch (error) {
    handleError(res, error);
  }
});

routerGet.get('/ListaRegulacoesPendentes24', async (req, res) => {
  try {
    const result = await ListaRegulacoesPendentes24();
    const serverTime = new Date().toISOString();
    handleResponse(res, result, serverTime);
  } catch (error) {
    handleError(res, error);
  }
});

routerGet.get('/ListaRegulacoesAprovadas', async (req, res) => {
  try {
    const result = await ListaRegulacoesAprovadas('Interna');
    handleResponse(res, result);
  } catch (error) {
    handleError(res, error);
  }
});

routerGet.get('/ListaRegulacoesPreAprovadas', async (req, res) => {
  try {
    const result = await ListaRegulacoesPreAprovadas('Interna');
    handleResponse(res, result);
  } catch (error) {
    handleError(res, error);
  }
});

routerGet.get('/ListaRegulacoesAprovadas_Todas', async (req, res) => {
  try {
    const result = await ListaRegulacoesAprovadas_Todas('Interna');
    handleResponse(res, result);
  } catch (error) {
    handleError(res, error);
  }
});

routerGet.get('/Externa/ListaRegulacoesAprovadas', async (req, res) => {
  try {
    const result = await ListaRegulacoesAprovadas('Externa');
    handleResponse(res, result);
  } catch (error) {
    handleError(res, error);
  }
});

routerGet.get('/VerificaID', async (req, res) => {
  try {
    const { id_regulacao } = req.query;
    const result = await VerificaID(id_regulacao);
    handleResponse(res, result);
  } catch (error) {
    handleError(res, error);
  }
});

routerGet.get('/VerificaProntuario', async (req, res) => {
  try {
    const { num_prontuario } = req.query;
    const result = await VerificaProntuario(num_prontuario, 'Interna');
    handleResponse(res, result);
  } catch (error) {
    handleError(res, error);
  }
});

routerGet.get('/Externa/VerificaProntuario', async (req, res) => {
  try {
    const { num_prontuario } = req.query;
    const result = await VerificaProntuario(num_prontuario, 'Externa');
    handleResponse(res, result);
  } catch (error) {
    handleError(res, error);
  }
});

routerGet.get('/VerificaProntuarioAutoComplete', async (req, res) => {
  try {
    const { num_prontuario } = req.query;
    const result = await VerificaProntuarioAutoComplete(num_prontuario);
    console.log(result);
    handleResponse(res, result);
  } catch (error) {
    handleError(res, error);
  }
});

routerGet.get('/VerificaRegulacao', async (req, res) => {
  try {
    const { num_regulacao } = req.query;
    const result = await VerificaRegulacao(num_regulacao);
    handleResponse(res, result);
  } catch (error) {
    handleError(res, error);
  }
});

routerGet.get('/ListaMedicos', async (req, res) => {
  try {
    const result = await ListaMedicos();
    handleResponse(res, result);
  } catch (error) {
    handleError(res, error);
  }
});

routerGet.get('/PesquisaPaciente', async (req, res) => {
  try {
    const { nomePaciente, numProntuario, numRegulacao, statusRegulacao } = req.query;
    const serverTime = new Date().toISOString();
    const result = await PesquisaPaciente(nomePaciente, numProntuario, numRegulacao, statusRegulacao);
    handleResponse(res, result, serverTime);
  } catch (error) {
    handleError(res, error);
  }
});

routerGet.get('/RecebeHoraLeito', async (req, res) => {
  const { idRegulacao } = req.query;

  try {
    const serverTime = new Date().toISOString();
    const result = await RecebeHoraLeito(idRegulacao);

    handleResponse(res, result, serverTime);
  } catch (error) {
    handleError(res, error);
  }
});



// Métodos auxiliares para padronizar respostas e erros
const handleResponse = (res, result, serverTime) => {
  if (result.success) {
    return res.status(200).json({ message: result.message, data: result.data, serverTime });
  } else {
    return res.status(500).json({ message: result.message, error: result.error });
  }
};

const handleError = (res, error) => {
  console.error('Erro no processamento:', error);
  /*
  return res.status(500).json({
    message: 'Erro interno do servidor',
    error: 'Erro desconhecido',
  });
  */
};

export default routerGet;
