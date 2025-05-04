import { Server } from 'socket.io';

export default (server) => {
    const io = new Server(server, {
        cors: {
            origin: '*', // ✅ Em produção, substitua por: 'https://seu-frontend.com'
            methods: ['GET', 'POST', 'PUT'],
            credentials: true,
        },
        pingInterval: 10000, // Ping a cada 10s
        pingTimeout: 5000,   // Desconecta se não responder em 5s
    });

    // Mapeamento de usuários por socket
    const usuarios = {};

    // Mapeamento de timestamps para anti-flood
    const ultimaMensagemPorSocket = {};

    io.on('connection', (socket) => {
        //console.log(`🟢 Socket conectado: ${socket.id}`);

        // Envia confirmação de conexão
        socket.emit('conexao-estabelecida', 'Conexão WebSocket bem-sucedida!');

        // Entrada na sala
        socket.on('usuario-login', ({ username, sala }) => {
            if (!username || !sala) return;

            socket.join(sala);
            usuarios[socket.id] = { username, sala };

            //console.log(`👤 Usuário "${username}" entrou na sala "${sala}"`);
        });

        // Recebimento de mensagem
        socket.on('nova-mensagem', (data) => {
            try {
                const { roomId, mensagem } = data;
                if (!roomId || !mensagem) return;

                const agora = Date.now();
                const ultima = ultimaMensagemPorSocket[socket.id] || 0;

                // Anti-flood: 300ms mínimo entre mensagens
                if (agora - ultima < 300) return;
                ultimaMensagemPorSocket[socket.id] = agora;

                // Envia a mensagem para todos na sala
                io.to(roomId).emit('nova-mensagem', mensagem);
            } catch (err) {
                console.error('❌ Erro ao processar nova mensagem:', err);
            }
        });

        // Desconexão do usuário
        socket.on('disconnect', () => {
            const user = usuarios[socket.id];

            if (user) {
                socket.leave(user.sala);
                //console.log(`🔴 Usuário "${user.username}" saiu da sala "${user.sala}"`);
                delete usuarios[socket.id];
                delete ultimaMensagemPorSocket[socket.id];
            } else {
                //console.log(`🔴 Socket desconectado: ${socket.id}`);
            }
        });

        // Captura de erro do socket
        socket.on('error', (err) => {
            console.error(`❌ Erro no socket ${socket.id}:`, err.message);
        });
    });

    // Monitoramento de conexões
    setInterval(() => {
        console.log(`🔄 Conexões ativas: ${io.engine.clientsCount}`);
    }, 15000);

    return io;
};
