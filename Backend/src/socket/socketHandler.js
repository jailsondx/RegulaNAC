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
            try {
              const { roomId, mensagem } = data;
              if (!roomId || !mensagem) return;
              io.to(roomId).emit('nova-mensagem', mensagem);
            } catch (err) {
              console.error('Erro ao processar nova mensagem:', err);
            }
          });
          

        // Quando o usuário desconecta
        socket.on('disconnect', () => {
            const user = usuarios[socket.id];
            if (user) {
              socket.leave(user.sala);  // Remove da sala
              delete usuarios[socket.id];
              console.log(`Usuário ${user.username} desconectado da sala ${user.sala}`);
            }
          });
          
          
    });

    return io;  // Retorna o objeto io caso queira configurar mais algo fora
};
