import { DBconnection } from "../Controller/connection.js";

async function ListaMedicos() {
    const DBtable = "usuarios";

    try {
        const connection = await DBconnection.getConnection();

        // Realiza a consulta para buscar os médicos
        const [rows] = await connection.query(
            `SELECT nome FROM ${DBtable} WHERE tipo = ? AND ativo = ?`, 
            ["MEDICO", true]
        );

        connection.release(); // Libera a conexão com o banco

        // Extrai apenas os nomes dos médicos
        const nomes = rows.map((row) => row.nome);

        return { success: true, data: nomes };
    } catch (error) {
        console.error("Erro ao carregar médicos:", error);
        return { success: false, message: "Erro ao carregar médicos.", error };
    }
}

export default ListaMedicos;
