/// <reference types="node" />
const express = require('express');
const { getCurrentTimestamp } = require('../../functions/Time/Timestamp.ts')
const NovaRegulacao = require("../../functions/InsertSQL/NovaRegulacao.ts");
const RegulacaoMedicaApproved = require("../../functions/InsertSQL/RegulacaoMedica.ts");

const router = express.Router();

router.post('/NovaRegulacao', async (req, res) => {
  try {
    const formData = req.body;
    //console.log('Dados recebidos:', formData);
    const { success, message, error } = await NovaRegulacao(formData);

    if(success){
      res.status(200).json({ message });
    } else {
      res.status(500).json({ message: 'Erro ao inserir Nova Regulação, verifique os campos.', error });
    }


  } catch (error) {
    console.error('Erro no processamento:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

router.post('/RegulacaoMedico', async (req, res) => {
  try {
    // Obtém os dados enviados no corpo da requisição
    const formData = req.body;

    // Atualiza o campo data_hora_regulacao_medico
    formData.data_hora_regulacao_medico = getCurrentTimestamp();

    const CadastroRegulacaoMedica = await RegulacaoMedicaApproved(formData);

    res.status(200).json({ message: 'Regulação criada com sucesso!' });
  } catch (error) {
    console.error('Erro no processamento:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

module.exports = router;
