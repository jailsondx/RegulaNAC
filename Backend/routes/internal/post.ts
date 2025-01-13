/// <reference types="node" />
const express = require('express');
const { getCurrentTimestamp } = require('../../functions/Time/Timestamp.ts')
const NovaRegulacao = require("../../functions/InsertSQL/NovaRegulacao.ts");
const RegulacaoMedica = require("../../functions/InsertSQL/RegulacaoMedica.ts");
const LoginUser = require("../../functions/SelectSQL/LoginUser.ts");
const CadastroUser = require("../../functions/InsertSQL/CadastroUser.ts");

const router = express.Router();

router.post('/Login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Chama a função para autenticar o usuário
    const { success, data, error } = await LoginUser(username, password);

    if (success) {
      res.status(200).json({ message: 'Login realizado com sucesso.', data });
    } else {
      res.status(401).json({ message: 'Credenciais inválidas.', error });
    }
  } catch (error) {
    console.error('Erro no processamento:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

router.post('/Cadastro', async (req, res) => {
  try {
    const formData = req.body;

    // Chama a função para autenticar o usuário
    const { success, message, error } = await CadastroUser(formData);
    if(success){
      res.status(200).json({ message });
    } else {
      res.status(500).json({ message: 'Erro ao cadastrar usuario.', error });
    }
  } catch (error) {
    console.error('Erro no processamento:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

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

    const CadastroRegulacaoMedica = await RegulacaoMedica(formData);

    res.status(200).json({ message: 'Regulação criada com sucesso!' });
  } catch (error) {
    console.error('Erro no processamento:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

module.exports = router;
