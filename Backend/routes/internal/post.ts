/// <reference types="node" />
const express = require('express');
const { getCurrentTimestamp } = require('../../functions/Time/Timestamp.ts');
const { convertObjectToUpperCase } = require('../../functions/Manipulation/ObjectUpperCase.ts');
const NovaRegulacao = require("../../functions/InsertSQL/NovaRegulacao.ts");
const RegulacaoMedica = require("../../functions/InsertSQL/RegulacaoMedica.ts");
const RegulacaoOrigem = require("../../functions/InsertSQL/RegulacaoOrigem.ts");
const RegulacaoDestino = require("../../functions/InsertSQL/RegulacaoDestino.ts");
const Transporte = require("../../functions/InsertSQL/Transporte.ts");
const Desfecho = require("../../functions/InsertSQL/Desfecho.ts");
const LoginUser = require("../../functions/SelectSQL/LoginUser.ts");
const CadastroUser = require("../../functions/InsertSQL/CadastroUser.ts");

const routerPost = express.Router();

routerPost.post('/Login', async (req, res) => {
  try {
    const { username, password } = convertObjectToUpperCase(req.body);;

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

routerPost.post('/Cadastro', async (req, res) => {
  try {
    const formData = convertObjectToUpperCase(req.body);;

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

routerPost.post('/NovaRegulacao', async (req, res) => {
  try {

    const formData = convertObjectToUpperCase(req.body);
    
    const { success, message, error } = await NovaRegulacao(formData);

    if(success){
      res.status(200).json({ message });
    } else {
      res.status(500).json({ message, error });
    }


  } catch (error) {
    console.error('Erro no processamento:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

routerPost.post('/RegulacaoMedico', async (req, res) => {
  try {
    const formData = convertObjectToUpperCase(req.body);;
    formData.data_hora_regulacao_medico = getCurrentTimestamp();

    // Envia a resposta logo após a chamada da função
    const { success, message, error } = await RegulacaoMedica(formData);

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

routerPost.post('/RegulacaoOrigem', async (req, res) => {
  try {
    const formData = convertObjectToUpperCase(req.body);;
    //formData.data_hora_regulacao_medico = getCurrentTimestamp();

    // Envia a resposta logo após a chamada da função
    const { success, message, error } = await RegulacaoOrigem(formData);

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

routerPost.post('/RegulacaoDestino', async (req, res) => {
  try {
    const formData = convertObjectToUpperCase(req.body);;
    //formData.data_hora_regulacao_medico = getCurrentTimestamp();

    // Envia a resposta logo após a chamada da função
    const { success, message, error } = await RegulacaoDestino(formData);

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

routerPost.post('/TransporteEDesfecho', async (req, res) => {
  try {
    // Receber os dados do frontend e normalizar para maiúsculas ou qualquer outro processamento
    const formData = convertObjectToUpperCase(req.body);

    // Dados para a tabela "transporte" (passos 1, 2 e 3)
    const transporteData = {
      id_user: formData.id_user,
      id_regulacao: formData.id_regulacao,
      nome_colaborador: formData.nome_colaborador,
      data_hora_acionamento: formData.data_hora_acionamento,
      data_hora_chegada_origem: formData.data_hora_chegada_origem,
      data_hora_saida_origem: formData.data_hora_saida_origem,
      data_hora_chegada_destino: formData.data_hora_chegada_destino,
    };

    // Dados para a tabela "desfecho_criticidade" (passo 4)
    const desfechoData = {
      id_user: formData.id_user,
      id_regulacao: formData.id_regulacao,
      desfecho: formData.desfecho,
      criticidade: formData.criticidade,
    };

    // Salvar os dados na tabela "transporte"
    const transporteResult = await Transporte(transporteData);

    // Verificar se a inserção do transporte foi bem-sucedida
    if (!transporteResult.success) {
      return res.status(500).json(transporteResult);
    }


    // Salvar os dados na tabela "desfecho_criticidade"
    const desfechoResult = await Desfecho(desfechoData);

    // Verificar se a inserção do desfecho/criticidade foi bem-sucedida
    if (!desfechoResult.success) {
      return res.status(500).json(desfechoResult);
    }

    // Se ambos os processos foram bem-sucedidos, retornar sucesso
    return res.status(200).json({ message: 'Dados salvos com sucesso!' });
    

  } catch (error) {
    console.error('Erro no processamento:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});


module.exports = routerPost;
