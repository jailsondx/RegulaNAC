import { DBconnection } from "../Controller/connection.js";

async function ListaRegulacoesPreAprovadas(Origem) {
    let DBtable, DBtable2, DBtableOrigem, DBtableObservacao, query, queryParams;

    switch (Origem) {
        case "Interna":
            DBtable = "regulacao";
            DBtable2 = "regulacao_medico";
            DBtableOrigem = "setor_origem";
            DBtableObservacao = "observacao";
            query = `
                SELECT 
                    r.*,
                    rm.nome_regulador_medico, 
                    data_hora_regulacao_medico, 
                    num_leito, 
                    autorizacao,
                    so.preparo_leito,
                    obs.observacaoTexto
                FROM ${DBtable} r
                LEFT JOIN ${DBtable2} rm ON r.id_regulacao = rm.id_regulacao
                LEFT JOIN ${DBtableOrigem} so ON r.id_regulacao = so.id_regulacao
                LEFT JOIN ${DBtableObservacao} obs ON r.id_regulacao = obs.id_regulacao
                WHERE r.status_regulacao LIKE ? AND vaga_autorizada = ? AND autorizacao LIKE ?
            `;
            queryParams = ["ABERTO - APROVADO%", 1, "PRE-%"];
            break;
        case "Externa":
            DBtable = "externa_regulacao";
            DBtable2 = "externa_regulacao_medico";
            query = `
                SELECT 
                    r.*,
                    rm.nome_regulador_medico_01, data_hora_regulacao_medico_01, num_leito
                FROM ${DBtable} r
                LEFT JOIN ${DBtable2} rm ON r.id_regulacao = rm.id_regulacao
                WHERE r.status_regulacao LIKE ? AND vaga_autorizada = ?
            `;
            queryParams = ["ABERTO - APROVADO%", 1];
            break;
        default:
            throw new Error("Origem inválida. Use 'Interna' ou 'Externa'.");
    }

    try {
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

export default ListaRegulacoesPreAprovadas;
