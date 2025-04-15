import { Server } from 'socket.io';

export default (server) => {
    const io = new Server(server, {
        cors: {
            origin: '*', //PERMITE QUALQUER ORIGEM, MAS É RECOMENDADO DEFINIR O ENDEREÇO DO FRONT-END
            methods: ['GET', 'POST', 'PUT'],
            credentials: true,
        },
    });

    // Mapeamento de usuários para suas salas (opcional)
    let usuarios = {};

    io.on('connection', (socket) => {
        //console.log(`Usuário conectado: ${socket.id}`);

        // Teste para verificar a conexão do WebSocket
        socket.emit('conexao-estabelecida', 'Conexão WebSocket bem-sucedida!');

        // Exemplo: O usuário se conecta e entra automaticamente na "sala" (pode ser por user ID ou qualquer coisa)
        socket.on('usuario-login', ({ username, sala }) => {
            socket.join(sala); // Vários usuários podem entrar nessa mesma sala
            usuarios[socket.id] = { username, sala };
            console.log(`Usuário ${username} entrou na sala ${sala}`);
          });
          

        // Suponha que alguém envie uma mensagem
        socket.on('nova-mensagem', (data) => {
            const { roomId, mensagem } = data;

            console.log(`Mensagem recebida na sala ${roomId}: ${mensagem}`);

            // Envia a mensagem para todos na sala (roomId)
            io.to(roomId).emit('nova-mensagem', mensagem);
        });

        // Quando o usuário desconecta
        socket.on('disconnect', () => {
            const user = usuarios[socket.id];
            if (user) {
              console.log(`Usuário ${user.username} saiu da sala ${user.sala}`);
              delete usuarios[socket.id];
            }
          });
          
    });

    return io;  // Retorna o objeto io caso queira configurar mais algo fora
};
