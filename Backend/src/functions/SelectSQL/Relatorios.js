import { exportarRelatorioCSVPaciente as handleCSVPaciente, exportarRelatorioCSVGerencial as handleCSVGerencial } from '../Controller/ExportToCSV.js';
import { DBconnection } from "../Controller/connection.js"; // Importa apenas o objeto DBconnection

async function relatorioRegulacao(FormData) {
    const DBtableRegulacao = 'regulacao';
    const DBtableRegulacaoMedico = 'regulacao_medico';
    const DBtableTransporte = 'transporte';
    const DBtableDesfecho = 'desfecho';

    try {
        const connection = await DBconnection.getConnection();

        // Iniciar a query básica com LEFT JOIN para incluir dados de desfecho
        let query = `
            SELECT 
                r.*,
                d.desfecho, 
                d.criticidade, 
                d.forcado, 
                d.fastmedic,
                rm.data_hora_regulacao_medico,
                t.nome_colaborador AS transporte_nome_colaborador
            FROM ${DBtableRegulacao} r
            LEFT JOIN ${DBtableDesfecho} d ON r.id_regulacao = d.id_regulacao
            LEFT JOIN ${DBtableRegulacaoMedico} rm ON r.id_regulacao = rm.id_regulacao
            LEFT JOIN ${DBtableTransporte} t ON r.id_regulacao = t.id_regulacao
            WHERE 1=1`;
        let queryParams = [];

        // Se ambos os campos de data forem fornecidos, filtra entre data_Solicitacao e data_Finalizacao
        if (FormData.data_Solicitacao_Inicio && FormData.data_Solicitacao_Fim) {
            query += " AND DATE(r.data_hora_solicitacao_02) BETWEEN ? AND ?";
            queryParams.push(FormData.data_Solicitacao_Inicio, FormData.data_Solicitacao_Fim);
        }

        // Filtra pelo desfecho (usando LIKE para permitir buscas parciais)
        if (FormData.desfecho) {
            query += " AND d.desfecho LIKE ?";
            queryParams.push(`%${FormData.desfecho}%`);
        }

        // Filtra pela unidade de origem
        if (FormData.un_origem) {
            query += " AND r.un_origem = ?";
            queryParams.push(FormData.un_origem);
        }

        // Filtra pela unidade de destino
        if (FormData.un_destino) {
            query += " AND r.un_destino = ?";
            queryParams.push(FormData.un_destino);
        }

        // Filtra pelo nome do regulador NAC (usando LIKE para busca parcial)
        if (FormData.nome_regulador_nac) {
            query += " AND r.nome_regulador_nac LIKE ?";
            queryParams.push(`%${FormData.nome_regulador_nac}%`);
        }

        // Filtra pelo nome do regulador médico (usando LIKE para busca parcial)
        if (FormData.nome_regulador_medico) {
            query += " AND r.nome_regulador_medico LIKE ?";
            queryParams.push(`%${FormData.nome_regulador_medico}%`);
        }

        // Executa a consulta com os parâmetros dinâmicos
        const [rows] = await connection.query(query, queryParams);

        connection.release();

        const filePath = await handleCSVPaciente(rows);
        return { success: true, data: rows, filePath };
    } catch (error) {
        console.error('Erro ao carregar regulações:', error);
        return { success: false, message: "Erro ao carregar regulações.", error };
    }
}

async function relatorioGerencial(FormData) {
    const DBtableRegulacao = 'regulacao';
    const startDate = FormData.data_Solicitacao_Inicio;
    const endDate = FormData.data_Solicitacao_Fim;

    try {
        const connection = await DBconnection.getConnection();

        // 🚀 1️⃣ Buscar Quantidade de Solicitações
        const [rows_qtdSolicitacoes] = await connection.query(`
            SELECT un_destino, SUM(qtd_solicitacoes) AS total_solicitacoes
            FROM ${DBtableRegulacao}
            WHERE DATE(data_hora_solicitacao_01) BETWEEN ? AND ?
            GROUP BY un_destino
        `, [startDate, endDate]);

        // 🚀 2️⃣ Buscar Quantidade de Pacientes
        const [rows_qtdPacientes] = await connection.query(`
            SELECT un_destino, COUNT(DISTINCT num_prontuario) AS total_pacientes
            FROM ${DBtableRegulacao}
            WHERE DATE(data_hora_solicitacao_01) BETWEEN ? AND ?
            GROUP BY un_destino
        `, [startDate, endDate]);

        // 🚀 3️⃣ Buscar Quantidade de Transferências Efetivadas
        const [rows_qtdFinalizados] = await connection.query(`
            SELECT un_destino, COUNT(*) AS total_finalizados
            FROM ${DBtableRegulacao}
            WHERE DATE(data_hora_solicitacao_01) BETWEEN ? AND ?
              AND status_regulacao = ?
            GROUP BY un_destino
        `, [startDate, endDate, 'FECHADO']);

        connection.release();

        // 🚀 🔄 **Garantir que todas as unidades de destino estejam presentes**
        const unidadesDestino = new Set([
            ...rows_qtdSolicitacoes.map(row => row.un_destino),
            ...rows_qtdPacientes.map(row => row.un_destino),
            ...rows_qtdFinalizados.map(row => row.un_destino)
        ]);

        // 🚀 🔄 **Transformar os dados para o formato correto**
        const dadosParaCSV = [];

        // Criando linhas individuais para cada unidade de destino e tipo de dado
        unidadesDestino.forEach(unidade => {
            const solicitacoes = rows_qtdSolicitacoes.find(row => row.un_destino === unidade);
            const pacientes = rows_qtdPacientes.find(row => row.un_destino === unidade);
            const finalizados = rows_qtdFinalizados.find(row => row.un_destino === unidade);

            dadosParaCSV.push({
                un_destino: unidade,
                especificacao: 'Nº DE SOLICITAÇÕES',
                valor_absoluto: solicitacoes ? solicitacoes.total_solicitacoes : 0
            });

            dadosParaCSV.push({
                un_destino: unidade,
                especificacao: 'Nº DE PACIENTES',
                valor_absoluto: pacientes ? pacientes.total_pacientes : 0
            });

            dadosParaCSV.push({
                un_destino: unidade,
                especificacao: 'Nº DE TRANSFERÊNCIAS EFETIVADAS',
                valor_absoluto: finalizados ? finalizados.total_finalizados : 0
            });
        });

        // Ordenar os dados antes de exportar o CSV
        dadosParaCSV.sort((a, b) => a.un_destino.localeCompare(b.un_destino));

        console.log('✅ Dados formatados para CSV:');

        // 📂 Exportar os dados para CSV
        const filePath = await handleCSVGerencial(dadosParaCSV);
        return { success: true, filePath };
    } catch (error) {
        console.error('❌ Erro ao carregar regulações:', error);
        return { success: false, message: "Erro ao carregar regulações.", error };
    }
}

export { relatorioRegulacao, relatorioGerencial };
