import { DBconnection } from "../Controller/connection.js"; // Importa apenas o objeto DBconnection

async function RecebeHoraLeito(idRegulacao) {
    const DBtable = "transporte";

    try {
        const connection = await DBconnection.getConnection();
       
        // Executar a consulta com os parâmetros
        const [rows] = await connection.query(`
            SELECT data_hora_liberacao_leito 
            FROM ${DBtable} 
            WHERE id_regulacao = ? LIMIT 1`,
            [idRegulacao]
       );

        connection.release();

        // Retornar os resultados
        return { success: true, data: rows[0] };
    } catch (error) {
        console.error('Erro ao buscar regulação hora leito:', error);
        return { success: false, message: "Erro ao carregar regulação hora leito.", error };
    }
}

export default RecebeHoraLeito;
