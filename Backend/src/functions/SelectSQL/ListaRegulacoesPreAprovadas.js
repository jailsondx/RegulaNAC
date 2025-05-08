import { DBconnection } from "../Controller/connection.js";
import { buildRegulacaoQuery } from "../Utils/buildRegulacaoQuery.js";

async function ListaRegulacoesPreAprovadas(Origem) {
    
    try {
        const { query, queryParams } = buildRegulacaoQuery(Origem, {
            status: "ABERTO - APROVADO%",
            vagaAutorizada: 1,
            autorizacao: "PRE-%"
        });

        const connection = await DBconnection.getConnection();
        const [rows] = await connection.query(query, queryParams);
        connection.release();

        return {
            success: true,
            data: Array.isArray(rows) ? rows : []
        };
    } catch (error) {
        console.error("Erro ao carregar regulações:", error);
        return {
            success: false,
            message: "Erro ao carregar regulações.",
            error
        };
    }
}

export default ListaRegulacoesPreAprovadas