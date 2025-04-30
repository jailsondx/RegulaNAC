import express from 'express';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import socketHandler from './src/socket/socketHandler.js';
import routePost from './src/routes/internal/post.js';
import routeGet from './src/routes/internal/get.js';
import routePut from './src/routes/internal/put.js';
import routerDelete from './src/routes/internal/delete.js';
import routeUpload from './src/routes/internal/upload.js';
import routerReport from './src/routes/internal/reports.js';

import dotenv from 'dotenv';



process.on('uncaughtException', (err) => {
    console.error('Erro não tratado (uncaughtException):', err);
    // Você pode optar por não encerrar o processo aqui, dependendo da gravidade
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Rejeição não tratada (unhandledRejection):', reason);
  });
  

dotenv.config();

const app = express();
const server = http.createServer(app);
const IP = process.env.NODE_SERVER_IP || '0.0.0.0';
const PORT = Number(process.env.NODE_SERVER_PORT) || 3003;


// Configura o CORS para permitir conexões do front-end
/*
const corsOptions = {
    origin: 'http://localhost:5110', // Substitua pelo endereço da sua aplicação React
    methods: ['GET', 'POST'],
  };
*/

app.use(cors());
app.use(bodyParser.json({ limit: '20mb' }));  // Ajuste conforme necessário
app.use(bodyParser.urlencoded({ extended: true, limit: '20mb' }));


// Aumenta o limite de listeners de eventos
import('events').then((events) => {
    events.EventEmitter.defaultMaxListeners = 20;
});

// Configura o pool de conexões HTTP
http.globalAgent.maxSockets = Infinity;

// Configura o WebSocket passando o servidor HTTP
socketHandler(server);

// Use as rotas no seu aplicativo
app.use('/api/internal/post', routePost);
app.use('/api/internal/get', routeGet);
app.use('/api/internal/put', routePut);
app.use('/api/internal/delete', routerDelete);
app.use('/api/internal/upload', routeUpload);
app.use('/api/internal/report', routerReport);


app.get('/', (req, res) => {
    res.send(`Backend API funcionando! ${IP} na porta ${PORT}`);
});



server.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando no ip ${IP} na porta ${PORT}`);
});
