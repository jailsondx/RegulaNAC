import { DBconnection } from "../Controller/connection.js";

async function ListaRegulacoesNegadas() {
    const DBtable = "regulacao";
    const DBtableRegulacaoMedico = "regulacao_medico";
    const DBtableObservacao = "observacao";

    try {
        const connection = await DBconnection.getConnection();

        const [rows] = await connection.query(`
            SELECT 
                r.id_regulacao, 
                r.nome_responsavel_nac, 
                r.num_prontuario, 
                r.nome_paciente, 
                r.num_regulacao, 
                r.un_origem, 
                r.un_destino,
                r.data_hora_solicitacao_02,
                r.link,
                rm.nome_regulador_medico,
                rm.justificativa_neg,
                obs.observacaoTexto
            FROM ${DBtable} r
            JOIN ${DBtableRegulacaoMedico} rm ON r.id_regulacao = rm.id_regulacao
            LEFT JOIN ${DBtableObservacao} obs ON r.id_regulacao = obs.id_regulacao
            WHERE r.status_regulacao LIKE ?
        `, ["NEGADO"]);

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

export default ListaRegulacoesNegadas;
