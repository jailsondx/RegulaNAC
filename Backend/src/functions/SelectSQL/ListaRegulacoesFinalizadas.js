import { DBconnection } from "../Controller/connection.js";

async function ListaRegulacoesFinalizadas() {
    const DBtable = "regulacao";
    const DBtableRegulacaoMedico = "regulacao_medico";
    const DBtableDesfecho = "desfecho";
    const DBtableUsuarios = "usuarios";

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
                r.link, 
                rm.nome_regulador_medico,
                d.desfecho,
                u.nome AS regulador_final
            FROM ${DBtable} r
            JOIN ${DBtableRegulacaoMedico} rm ON r.id_regulacao = rm.id_regulacao
            LEFT JOIN ${DBtableDesfecho} d ON r.id_regulacao = d.id_regulacao
            LEFT JOIN ${DBtableUsuarios} u ON d.id_user = u.id_user
            WHERE r.status_regulacao LIKE ?
        `, ["FECHADO"]);

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

export default ListaRegulacoesFinalizadas;
