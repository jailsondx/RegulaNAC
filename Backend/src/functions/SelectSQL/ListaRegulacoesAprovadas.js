import { DBconnection } from "../Controller/connection.js";

async function ListaRegulacoesAprovadas() {
    const DBtable = "regulacao";
    const DBtable2 = "regulacao_medico"; // Tabela de reguladores

    try {
        // Inicie a conexão com o banco de dados
        const connection = await DBconnection.getConnection();

        // Query com JOIN para unir dados de ambas as tabelas
        const [rows] = await connection.query(`
            SELECT 
                r.*,
                rm.nome_regulador_medico, data_hora_regulacao_medico, num_leito
            FROM ${DBtable} r
            LEFT JOIN ${DBtable2} rm ON r.id_regulacao = rm.id_regulacao
            WHERE r.status_regulacao LIKE ? AND vaga_autorizada = ?`, 
            ["ABERTO - APROVADO%", 1]
        );

        connection.release(); // Libera a conexão

        // Retorna os dados combinados
        return { success: true, data: rows };

    } catch (error) {
        // Tratamento de erro
        console.error("Erro ao carregar regulações:", error);
        return { success: false, message: "Erro ao carregar regulações.", error };
    }
}

export default ListaRegulacoesAprovadas;
