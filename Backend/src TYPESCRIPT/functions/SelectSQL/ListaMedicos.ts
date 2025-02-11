import { DBconnection } from "../Controller/connection.js";
import { RowDataPacket } from "mysql2/promise"; // 🔹 Importa RowDataPacket

// Define a interface para os médicos
interface Medico extends RowDataPacket {
    nome: string;
}

async function ListaMedicos() {
    const DBtable = "usuarios";

    try {
        const connection = await DBconnection.getConnection();

        // 🔹 Especifica que o retorno da query será um array de RowDataPacket
        const [rows] = await connection.query<Medico[]>(
            `SELECT nome FROM ${DBtable} WHERE tipo = ? AND ativo = ?`, 
            ["MEDICO", true]
        );

        connection.release(); // Libera a conexão com o banco

        // Extrai apenas os nomes dos médicos
        const nomes = rows.map((row) => row.nome);

        return { success: true, data: nomes };
    } catch (error: any) {
        console.error("Erro ao carregar médicos:", error);
        return { success: false, message: "Erro ao carregar médicos.", error };
    }
}

export default ListaMedicos;
