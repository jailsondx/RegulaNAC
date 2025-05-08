import express from 'express';
import ApagarRegulacao from '../../functions/DeleteSQL/DeleteRegulacao.js';

const routerDelete = express.Router();

// Middleware para parsing de JSON
routerDelete.use(express.json());

routerDelete.delete('/Regulacao', async (req, res) => {
  try {
    const { id_user, id_regulacao } = req.body;
    const result = await ApagarRegulacao(id_user, id_regulacao);
    console.log(result);
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



export default routerDelete;
