import express from 'express';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import routePost from './routes/internal/post.js';
import routeGet from './routes/internal/get.js';
import routePut from './routes/internal/put.js';
import routeUpload from './routes/internal/upload.js';
import routerReport from './routes/internal/reports.js';

import dotenv from 'dotenv';

dotenv.config();

const app = express();
const IP = process.env.NODE_SERVER_IP || '0.0.0.0';
const PORT = Number(process.env.NODE_SERVER_PORT) || 3001;

app.use(cors());
app.use(bodyParser.json());

// Aumenta o limite de listeners de eventos
import('events').then((events) => {
    events.EventEmitter.defaultMaxListeners = 20;
});

// Configura o pool de conexões HTTP
http.globalAgent.maxSockets = Infinity;

// Use as rotas no seu aplicativo
app.use('/api/internal/post', routePost);
app.use('/api/internal/get', routeGet);
app.use('/api/internal/put', routePut);
app.use('/api/internal/upload', routeUpload);
app.use('/api/internal/report', routerReport);

/*
app.get('/', (req: Request, res: Response) => {
    res.send('Backend API funcionando!');
});
*/

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando no ip ${IP} na porta ${PORT}`);
});
