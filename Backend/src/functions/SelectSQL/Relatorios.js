import { exportarRelatorioCSVPaciente as handleCSVPaciente, exportarRelatorioCSVEfetivacao as handleCSVEfetivacao } from '../Controller/ExportToCSV.js';
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

async function relatorioEfetivacao(FormData) {
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

        if (dadosParaCSV.length > 0) {
            console.log('✅ Dados formatados para CSV');

            // 📂 Exportar os dados para CSV
            const filePath = await handleCSVEfetivacao(dadosParaCSV);
            return { success: true, filePath };
        } else {
            console.log('❌ Erro ao formatar dados para CSV: Dados Vazios');
            return { success: false, message: "Dados vazios para a data informada." };
        }



    } catch (error) {
        console.error('❌ Erro ao carregar regulações:', error);
        return { success: false, message: "Erro ao carregar regulações.", error };
    }
}

async function relatorioTempoEfetivacao(FormData) {
    const DBtableRegulacao = 'regulacao';
    const DBtableRegulacaoMedico = 'regulacao_medico';
    const DBtableTransporte = 'transporte';
    const statusRegulacao = 'FECHADO';
    const startDate = FormData.data_Solicitacao_Inicio;
    const endDate = FormData.data_Solicitacao_Fim;

    try {
        const connection = await DBconnection.getConnection();

        // 🚀 1️⃣ Calcular a diferença de tempo entre 'data_hora_acionamento_medico' e 'data_hora_regulacao_medico'
        const [rows_tempoAcMedicoxAuMedico] = await connection.query(`
            SELECT 
            r.un_destino, 
            TIMESTAMPDIFF(MINUTE, MIN(r.data_hora_acionamento_medico), MIN(rm.data_hora_regulacao_medico)) AS tempo_AcMedicoxAuMedico
            FROM ${DBtableRegulacao} r
            JOIN ${DBtableRegulacaoMedico} rm ON r.id_regulacao = rm.id_regulacao
            WHERE DATE(r.data_hora_acionamento_medico) BETWEEN ? AND ? AND r.status_regulacao = ?
            GROUP BY r.un_destino
        `, [startDate, endDate, statusRegulacao]);

        // 🚀 2️⃣ Calcular a diferença de tempo entre 'data_hora_regulacao_medico' e 'data_hora_chegada_destino'
        const [rows_tempoTrxAuMedico] = await connection.query(`
            SELECT 
            r.un_destino, 
            TIMESTAMPDIFF(MINUTE, MIN(rm.data_hora_regulacao_medico), MIN(t.data_hora_chegada_destino)) AS tempo_tempoTrxAuMedico
            FROM ${DBtableRegulacao} r
            JOIN ${DBtableRegulacaoMedico} rm ON r.id_regulacao = rm.id_regulacao
            JOIN ${DBtableTransporte} t ON r.id_regulacao = t.id_regulacao
            WHERE DATE(rm.data_hora_regulacao_medico) BETWEEN ? AND ? AND r.status_regulacao = ?
            GROUP BY r.un_destino
        `, [startDate, endDate, statusRegulacao]);

        // 🚀 3️⃣ Calcular a diferença de tempo entre 'data_hora_solicitacao_01' e 'data_hora_chegada_destino'
        const [rows_tempoTrxSol01] = await connection.query(`
            SELECT 
            r.un_destino, 
            TIMESTAMPDIFF(MINUTE, MIN(r.data_hora_solicitacao_01), MIN(t.data_hora_chegada_destino)) AS tempo_tempoTrxSol01
            FROM ${DBtableRegulacao} r
            JOIN ${DBtableTransporte} t ON r.id_regulacao = t.id_regulacao
            WHERE DATE(r.data_hora_solicitacao_01) BETWEEN ? AND ? AND r.status_regulacao = ?
            GROUP BY r.un_destino
        `, [startDate, endDate, statusRegulacao]);

        // 🚀 4️⃣ Calcular a diferença de tempo entre 'data_hora_liberacao_leito' e 'data_hora_chegada_destino'
        const [rows_tempoTrxLibLeito] = await connection.query(`
            SELECT 
            r.un_destino, 
            TIMESTAMPDIFF(MINUTE, MIN(t.data_hora_liberacao_leito), MIN(t.data_hora_chegada_destino)) AS tempo_tempoTrxLibLeito
            FROM ${DBtableRegulacao} r
            JOIN ${DBtableTransporte} t ON r.id_regulacao = t.id_regulacao
            WHERE DATE(r.data_hora_solicitacao_01) BETWEEN ? AND ? AND r.status_regulacao = ?
            GROUP BY r.un_destino
        `, [startDate, endDate, statusRegulacao]);

        connection.release();

        // 🚀 5️⃣ Inicializar categorias de tempo por un_destino
        const categoriasPorUnDestino = {};

        const inicializarCategorias = (unDestino) => {
            if (!categoriasPorUnDestino[unDestino]) {
                categoriasPorUnDestino[unDestino] = {
                    tempoAcMedicoxAuMedico: { ate30min: 0, entre30min1hora: 0, entre1hora2horas: 0, entre2horas6horas: 0, maior6horas: 0 },
                    tempoTrxAuMedico: { ate2horas: 0, entre2horas6horas: 0, entre6horas12horas: 0, maior12horas: 0 },
                    tempoTrxSol01: { ate24h: 0, entre24h72h: 0, maior72h: 0 },
                    tempoTrxLibLeito: { ate2h: 0, maior2h: 0 }
                };
            }
        };

        // 🚀 6️⃣ Classificar tempos por un_destino
        const classificarTempo = (rows, categoria, classificacoes) => {
            rows.forEach(row => {
                const unDestino = row.un_destino;
                inicializarCategorias(unDestino);

                const tempo = row[`tempo_${categoria}`];
                if (tempo <= classificacoes[0].limite) {
                    categoriasPorUnDestino[unDestino][categoria][classificacoes[0].nome]++;
                } else if (tempo <= classificacoes[1].limite) {
                    categoriasPorUnDestino[unDestino][categoria][classificacoes[1].nome]++;
                } else if (tempo <= classificacoes[2].limite) {
                    categoriasPorUnDestino[unDestino][categoria][classificacoes[2].nome]++;
                } else if (classificacoes[3] && tempo <= classificacoes[3].limite) {
                    categoriasPorUnDestino[unDestino][categoria][classificacoes[3].nome]++;
                } else {
                    categoriasPorUnDestino[unDestino][categoria][classificacoes[classificacoes.length - 1].nome]++;
                }
            });
        };

        // Classificar cada tipo de tempo
        classificarTempo(rows_tempoAcMedicoxAuMedico, 'tempoAcMedicoxAuMedico', [
            { nome: 'ate30min', limite: 30 },
            { nome: 'entre30min1hora', limite: 60 },
            { nome: 'entre1hora2horas', limite: 120 },
            { nome: 'entre2horas6horas', limite: 360 },
            { nome: 'maior6horas', limite: Infinity }
        ]);

        classificarTempo(rows_tempoTrxAuMedico, 'tempoTrxAuMedico', [
            { nome: 'ate2horas', limite: 120 },
            { nome: 'entre2horas6horas', limite: 360 },
            { nome: 'entre6horas12horas', limite: 720 },
            { nome: 'maior12horas', limite: Infinity }
        ]);

        classificarTempo(rows_tempoTrxSol01, 'tempoTrxSol01', [
            { nome: 'ate24h', limite: 1440 },
            { nome: 'entre24h72h', limite: 4320 },
            { nome: 'maior72h', limite: Infinity }
        ]);

        classificarTempo(rows_tempoTrxLibLeito, 'tempoTrxLibLeito', [
            { nome: 'ate2h', limite: 120 },
            { nome: 'maior2h', limite: Infinity }
        ]);

        // 🚀 7️⃣ Gerar dados para CSV
        const dadosParaCSV = [];

        Object.keys(categoriasPorUnDestino).forEach(unDestino => {
            const categorias = categoriasPorUnDestino[unDestino];

            dadosParaCSV.push({ un_destino: unDestino, especificacao: 'ACIONAMENTO MÉDICO X AUTORIZAÇÃO DA VAGA ATÉ 0h30', valor_absoluto: categorias.tempoAcMedicoxAuMedico.ate30min });
            dadosParaCSV.push({ un_destino: unDestino, especificacao: 'ACIONAMENTO MÉDICO X AUTORIZAÇÃO DA VAGA 0h30 a 1h', valor_absoluto: categorias.tempoAcMedicoxAuMedico.entre30min1hora });
            dadosParaCSV.push({ un_destino: unDestino, especificacao: 'ACIONAMENTO MÉDICO X AUTORIZAÇÃO DA VAGA 1h a 2h', valor_absoluto: categorias.tempoAcMedicoxAuMedico.entre1hora2horas });
            dadosParaCSV.push({ un_destino: unDestino, especificacao: 'ACIONAMENTO MÉDICO X AUTORIZAÇÃO DA VAGA 2h a 6h', valor_absoluto: categorias.tempoAcMedicoxAuMedico.entre2horas6horas });
            dadosParaCSV.push({ un_destino: unDestino, especificacao: 'ACIONAMENTO MÉDICO X AUTORIZAÇÃO DA VAGA 6h', valor_absoluto: categorias.tempoAcMedicoxAuMedico.maior6horas });

            dadosParaCSV.push({ un_destino: unDestino, especificacao: 'TRANSFERENCIA CONCLUÍDA X AUTORIZAÇÃO DA VAGA ATÉ 2h', valor_absoluto: categorias.tempoTrxAuMedico.ate2horas });
            dadosParaCSV.push({ un_destino: unDestino, especificacao: 'TRANSFERENCIA CONCLUÍDA X AUTORIZAÇÃO DA VAGA 2h a 6h', valor_absoluto: categorias.tempoTrxAuMedico.entre2horas6horas });
            dadosParaCSV.push({ un_destino: unDestino, especificacao: 'TRANSFERENCIA CONCLUÍDA X AUTORIZAÇÃO DA VAGA 6h a 12h', valor_absoluto: categorias.tempoTrxAuMedico.entre6horas12horas });
            dadosParaCSV.push({ un_destino: unDestino, especificacao: 'TRANSFERENCIA CONCLUÍDA X AUTORIZAÇÃO DA VAGA ATÉ 12h', valor_absoluto: categorias.tempoTrxAuMedico.maior12horas });

            dadosParaCSV.push({ un_destino: unDestino, especificacao: 'PACIENTES TRANSFERIDOS ATÉ 24h DA 1ª SOLICITAÇÃO', valor_absoluto: categorias.tempoTrxSol01.ate24h });
            dadosParaCSV.push({ un_destino: unDestino, especificacao: 'PACIENTES TRANSFERIDOS ENTRE 24h E 72h DA 1ª SOLICITAÇÃO', valor_absoluto: categorias.tempoTrxSol01.entre24h72h });
            dadosParaCSV.push({ un_destino: unDestino, especificacao: 'PACIENTES TRANSFERIDOS APÓS 72h DA 1ª SOLICITAÇÃO', valor_absoluto: categorias.tempoTrxSol01.maior72h });

            dadosParaCSV.push({ un_destino: unDestino, especificacao: 'PACIENTES TRANSFERIDOS ATÉ 2h DA LIBERAÇÃO DO LEITO', valor_absoluto: categorias.tempoTrxLibLeito.ate2h });
            dadosParaCSV.push({ un_destino: unDestino, especificacao: 'PACIENTES TRANSFERIDOS ACIMA DE 2h DA LIBERAÇÃO DO LEITO', valor_absoluto: categorias.tempoTrxLibLeito.maior2h });
        });

        // 🚀 8️⃣ Exportar para CSV
        if (dadosParaCSV.length > 0) {
            console.log('✅ Dados formatados para CSV');
            const filePath = await handleCSVEfetivacao(dadosParaCSV);
            return { success: true, filePath };
        } else {
            console.log('❌ Erro ao formatar dados para CSV: Dados Vazios');
            return { success: false, message: "Dados vazios para a data informada." };
        }
    } catch (error) {
        console.error('❌ Erro ao carregar regulações:', error);
        return { success: false, message: "Erro ao carregar regulações.", error };
    }
}

export { relatorioRegulacao, relatorioEfetivacao, relatorioTempoEfetivacao };