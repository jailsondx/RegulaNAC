// Em Finalizadas.ts (backend)
import { DBconnection } from "../Controller/connection.js";

async function ListaRegulacoesFinalizadas(FormData) {
    const DBtable = "regulacao";
    const DBtableRegulacaoMedico = "regulacao_medico";
    const DBtableOrigem = "setor_origem";
    const DBtableDestino = "setor_destino";
    const DBtableDesfecho = "desfecho";
    const DBtableObservacao = "observacao";
    const DBtableUsuarios = "usuarios";

    const {
        nomePaciente,
        numProntuario,
        numRegulacao,
        statusFastmedic
    } = FormData;

    try {
        const connection = await DBconnection.getConnection();

        let query = `
            SELECT
                r.*,
                rm.nome_regulador_medico,
                rm.num_leito,
                so.preparo_leito,
                so.nome_colaborador AS nome_colaborador_origem,
                sd.nome_colaborador AS nome_colaborador_destino,
                d.desfecho,
                d.forcado,
                d.fastmedic,
                obs.observacaoTexto
            FROM ${DBtable} r
            LEFT JOIN ${DBtableRegulacaoMedico} rm ON r.id_regulacao = rm.id_regulacao
            LEFT JOIN ${DBtableOrigem} so ON r.id_regulacao = so.id_regulacao
            LEFT JOIN ${DBtableDestino} sd ON r.id_regulacao = sd.id_regulacao
            LEFT JOIN ${DBtableDesfecho} d ON r.id_regulacao = d.id_regulacao
            LEFT JOIN ${DBtableObservacao} obs ON r.id_regulacao = obs.id_regulacao
            LEFT JOIN ${DBtableUsuarios} u ON d.id_user = u.id_user
            WHERE r.status_regulacao LIKE ?
        `;

        const params = ["FECHADO"];

        if (nomePaciente) {
            query += ` AND r.nome_paciente LIKE ?`;
            params.push(`%${nomePaciente}%`);
        }

        if (numProntuario) {
            query += ` AND r.num_prontuario = ?`;
            params.push(numProntuario);
        }

        if (numRegulacao) {
            query += ` AND r.num_regulacao = ?`;
            params.push(numRegulacao);
        }

        if (statusFastmedic === "SIM") {
            query += ` AND d.fastmedic = ?`;
            params.push("SIM");
        } else if (statusFastmedic === "NAO") {
            query += ` AND d.fastmedic = ?`;
            params.push("NAO");
        }        

        query += ` ORDER BY r.id_regulacao DESC`;

        const [rows] = await connection.execute(query, params);
        return {
            success: true,
            data: Array.isArray(rows) ? rows : []
        };
    } catch (err) {
        console.error("Erro ao buscar regulações finalizadas:", err);
        return { error: true, message: "Erro ao buscar dados." };
    }
}

export default ListaRegulacoesFinalizadas;
