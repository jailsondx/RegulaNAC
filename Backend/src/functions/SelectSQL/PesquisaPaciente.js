import { DBconnection } from "../Controller/connection.js"; // Importa apenas o objeto DBconnection

async function PesquisaPaciente(nomePaciente, numProntuario, numRegulacao, statusRegulacao) {
    const DBtable = "regulacao";
    const DBtableRM = "regulacao_medico";
    const DBtableSO = "setor_origem";
    const DBtableSD = "setor_destino";

    try {
        const connection = await DBconnection.getConnection();

        // Iniciar a query básica
        let query = `  SELECT 
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
                        WHERE 1=1`; // "WHERE 1=1" permite adicionar filtros dinamicamente
        let queryParams = []; // Array para os parâmetros da query

        // Adicionar filtros condicionais se os parâmetros não forem vazios
        if (nomePaciente) {
            query += ' AND nome_paciente LIKE ?'; // Filtrar pelo nome do paciente
            queryParams.push(`%${nomePaciente}%`);
        }

        if (numProntuario) {
            query += ' AND num_prontuario = ?'; // Filtrar pelo número do prontuário
            queryParams.push(numProntuario);
        }

        if (numRegulacao) {
            query += ' AND num_regulacao = ?'; // Filtrar pelo número da regulação
            queryParams.push(numRegulacao);
        }

        if (statusRegulacao) {
            query += ' AND status_regulacao = ?'; // Filtrar pelo status da regulação
            queryParams.push(statusRegulacao);
        }

        // Excluir registros com status 'FECHADO'
        query += ' AND status_regulacao != "FECHADO"';

        // Executar a consulta com os parâmetros dinâmicos
        const [rows] = await connection.query(query, queryParams);

        connection.release();

        // Retornar os resultados
        return { success: true, data: rows };
    } catch (error) {
        console.error('Erro ao carregar regulações:', error);
        return { success: false, message: "Erro ao carregar regulações.", error };
    }
}

export default PesquisaPaciente;
