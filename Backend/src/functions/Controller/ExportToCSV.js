import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { createObjectCsvWriter as createCsvWriter } from 'csv-writer';

// Obter o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_CSV_PATH = path.join(__dirname, '../../Relatorios');

if (!fs.existsSync(BASE_CSV_PATH)) {
    fs.mkdirSync(BASE_CSV_PATH, { recursive: true });
}

async function exportarRelatorioCSVPaciente(dados) {
    try {
        if (dados.length === 0) {
            throw new Error('Nenhum dado disponível para exportação.');
        }

        const fileName = `Relatorio-${Date.now()}.csv`;
        const filePath = path.join(BASE_CSV_PATH, fileName);

        const csvWriter = createCsvWriter({
            path: filePath,
            header: [
                { id: 'nome_regulador_nac', title: 'Regulador NAC' },
                { id: 'nome_paciente', title: 'Nome do Paciente' },
                { id: 'num_prontuario', title: 'Número Prontuário' },
                { id: 'num_regulacao', title: 'Número Regulação' },
                { id: 'un_origem', title: 'Unidade de Origem' },
                { id: 'un_destino', title: 'Unidade de Destino' },
                { id: 'prioridade', title: 'Prioridade' },
                { id: 'data_nascimento', title: 'Data de Nascimento' },
                { id: 'num_idade', title: 'Idade' },
                { id: 'data_hora_solicitacao_01', title: 'Solicitação Inicial' },
                { id: 'data_hora_solicitacao_02', title: 'Solicitação Final' },
                { id: 'nome_regulador_medico', title: 'Regulador Médico' },
                { id: 'data_hora_acionamento_medico', title: 'Acionamento Médico' },
                { id: 'data_hora_regulacao_medico', title: 'Regulação Médico' },
                { id: 'status_regulacao', title: 'Status' },
                { id: 'transporte_nome_colaborador', title: 'Responsável Transporte' },
                { id: 'desfecho', title: 'Desfecho' },
                { id: 'criticidade', title: 'Criticidade' },
                { id: 'fastmedic', title: 'FastMedic' }
            ]
        });

        await csvWriter.writeRecords(dados);
        console.log(`✅ Relatório CSV gerado com sucesso em: \n${filePath}`);
        return filePath;
    } catch (error) {
        console.error('❌ Erro ao gerar o relatório CSV:', error);
        throw new Error('Erro ao gerar o relatório CSV.');
    }
}

async function exportarRelatorioCSVGerencial(dados) {
    try {
        if (dados.length === 0) {
            throw new Error('Nenhum dado disponível para exportação.');
        }

        const fileName = `Relatorio-${Date.now()}.csv`;
        const filePath = path.join(BASE_CSV_PATH, fileName);

        const csvWriter = createCsvWriter({
            path: filePath,
            header: [
                { id: 'un_destino', title: 'UNIDADE DE DESTINO' },
                { id: 'especificacao', title: 'ESPECIFICAÇÃO' },
                { id: 'valor_absoluto', title: 'VALOR ABSOLUTO' }
            ]
        });

        await csvWriter.writeRecords(dados);
        console.log(`✅ Relatório CSV gerado com sucesso em:\n${filePath}`);
        return filePath;
    } catch (error) {
        console.error('❌ Erro ao gerar o relatório CSV:', error);
        throw new Error('Erro ao gerar o relatório CSV.');
    }
}

export { exportarRelatorioCSVPaciente, exportarRelatorioCSVGerencial };
