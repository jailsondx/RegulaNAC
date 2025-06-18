// utils/buildRegulacaoQuery.js
export function buildRegulacaoQuery(origem, customParams = {}) {
    let query = "";
    let queryParams = [];

    // Valores padrão (pode ser sobrescrito via customParams)
    const status = customParams.status;
    const vagaAutorizada = customParams.vagaAutorizada ?? 1;
    const autorizacao = customParams.autorizacao;

    switch (origem) {
        case "Interna":
            query = `
                SELECT 
                    r.*,
                    rm.nome_regulador_medico, 
                    rm.data_hora_regulacao_medico, 
                    rm.num_leito, 
                    rm.autorizacao,
                    so.preparo_leito,
                    so.nome_colaborador AS nome_colaborador_origem,
                    sd.nome_colaborador AS nome_colaborador_destino,
                    obs.observacaoTexto
                FROM regulacao r
                LEFT JOIN regulacao_medico rm ON r.id_regulacao = rm.id_regulacao
                LEFT JOIN setor_origem so ON r.id_regulacao = so.id_regulacao
                LEFT JOIN setor_destino sd ON r.id_regulacao = sd.id_regulacao
                LEFT JOIN observacao obs ON r.id_regulacao = obs.id_regulacao
                WHERE r.status_regulacao LIKE ? 
                AND rm.vaga_autorizada LIKE ?
            `;
            
            queryParams = [status, vagaAutorizada];

            // Só adiciona filtro por autorizacao se o valor for válido
            if (autorizacao !== undefined && autorizacao !== null && autorizacao !== '') {
                query += ` AND rm.autorizacao LIKE ?`;
                queryParams.push(autorizacao);
            }

            break;

        case "Externa":
            query = `
                SELECT 
                    r.*,
                    rm.nome_regulador_medico_01, 
                    rm.data_hora_regulacao_medico_01, 
                    rm.num_leito
                FROM externa_regulacao r
                LEFT JOIN externa_regulacao_medico rm ON r.id_regulacao = rm.id_regulacao
                WHERE r.status_regulacao LIKE ? 
                AND vaga_autorizada = ?
            `;
            queryParams = [status, vagaAutorizada];
            break;

        default:
            throw new Error("Origem inválida. Use 'Interna' ou 'Externa'.");
    }

    return { query, queryParams };
}
