import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

// Configura o dotenv
dotenv.config();

// Cria o pool de conexão
const DBconnection = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10), // Converte para número
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'regulanac_database'
});

// Função para testar a conexão
async function testConnection() {
    try {
        const connectionTest = await DBconnection.getConnection();
        console.log(
            '✅ CONNECTION MYSQL: Conectado ao Banco de Dados MySql:',
            process.env.DB_NAME
        );
        console.log(
            'CONNECTION MYSQL: IP:',
            process.env.DB_HOST + ' PORT ' + process.env.DB_PORT
        );
        connectionTest.release(); // Libera a conexão para o pool
    } catch (error) {
        console.error(`❌ Error connecting to the database (${process.env.DB_HOST}:${process.env.DB_PORT}):`, error.message);
        process.exit(1); // Sai do processo em caso de falha
    }
}

// Testa a conexão (opcional)
testConnection();

// Exporta o pool de conexão e a função de teste (opcional)
export { DBconnection, testConnection };
