/// <reference types="node" />

const express = require('express');
const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');
const routePost = require('./routes/internal/post.ts');
const routeGet = require('./routes/internal/get.ts');

require('dotenv').config();

const app = express();
const IP = process.env.NODE_SERVER_IP || '0.0.0.0';
const PORT = process.env.NODE_SERVER_PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

// Aumenta o limite de listeners de eventos
require('events').EventEmitter.defaultMaxListeners = 20;

// Configura o pool de conexões HTTP
http.globalAgent.maxSockets = Infinity;

// Use as rotas no seu aplicativo
app.use('/api/internal/post', routePost);
app.use('/api/internal/get', routeGet);

app.get('/', (req, res) => {
    res.send('Backend API funcionando!');
});

app.listen(PORT, () => {
    console.log(`Servidor rodando no ip ${IP} na porta ${PORT}`);
});
