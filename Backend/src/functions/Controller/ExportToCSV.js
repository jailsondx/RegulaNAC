import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { createObjectCsvWriter as createCsvWriter } from 'csv-writer';
import { formatDateTimeToPtBr, formatDateToPtBr } from '../Manipulation/FormatDate.js';

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
                { id: 'nome_responsavel_nac', title: 'Usuario NAC' },
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
        console.log(`✅ Relatório CSV gerado com sucesso`);
        return filePath;
    } catch (error) {
        console.error('❌ Erro ao gerar o relatório CSV:', error);
        throw new Error('Erro ao gerar o relatório CSV.');
    }
}

async function exportarRelatorioCSVGeral(dados) {
    try {
        if (dados.length === 0) {
            throw new Error('Nenhum dado disponível para exportação.');
        }

        const fileName = `Relatorio-${Date.now()}.csv`;
        const filePath = path.join(BASE_CSV_PATH, fileName);

        const csvWriter = createCsvWriter({
            path: filePath,
            header: [
                //Regulação
                { id: 'nome_responsavel_nac', title: 'Usuário NAC' },
                { id: 'nome_paciente', title: 'Nome do Paciente' },
                { id: 'num_prontuario', title: 'Número Prontuário' },
                { id: 'num_regulacao', title: 'Número Regulação' },
                { id: 'un_origem', title: 'Unidade de Origem' },
                { id: 'un_destino', title: 'Unidade de Destino' },
                { id: 'qtd_solicitacoes', title: 'Qtd Solicitações' },
                { id: 'prioridade', title: 'Prioridade' },
                { id: 'data_nascimento', title: 'Data de Nascimento' },
                { id: 'num_idade', title: 'Idade' },
                { id: 'data_hora_solicitacao_01', title: 'Solicitação Inicial' },
                { id: 'data_hora_solicitacao_02', title: 'Solicitação Final' },
                { id: 'nome_regulador_medico', title: 'Regulador Médico' },
                { id: 'data_hora_acionamento_medico', title: 'Acionamento Médico' },

                // regulacao_medico
                { id: 'regulacaoMedico_data_hora_regulacao_medico', title: 'Regulação Médico - Data/Hora' },
                { id: 'regulacaoMedico_num_leito', title: 'Regulação Médico - Nº Leito' },
                { id: 'regulacaoMedico_justificativa_tempo30', title: 'Justificativa Tempo >30min' },
                { id: 'regulacaoMedico_justificativa_neg', title: 'Justificativa Negativa' },

                // setor origem
                { id: 'setorOrigem_nome_colaborador', title: 'Setor Origem - Responsável' },
                { id: 'setorOrigem_data_hora_comunicacao', title: 'Setor Origem - Comunicação' },
                { id: 'setorOrigem_preparo_leito', title: 'Setor Origem - Preparo Leito' },

                // setor destino
                { id: 'setorDestino_nome_colaborador', title: 'Setor Destino - Responsável' },

                // transporte
                { id: 'transporte_nome_colaborador', title: 'Transporte - Responsável' },
                { id: 'transporte_data_hora_acionamento', title: 'Transporte - Acionamento' },
                { id: 'transporte_data_hora_chegada_origem', title: 'Transporte - Chegada Origem' },
                { id: 'transporte_data_hora_saida_origem', title: 'Transporte - Saída Origem' },
                { id: 'transporte_data_hora_chegada_destino', title: 'Transporte - Chegada Destino' },
                { id: 'transporte_data_hora_liberacao_leito', title: 'Transporte - Liberação Leito' },
                { id: 'transporte_criticidade', title: 'Transporte - Criticidade' },
                { id: 'transporte_justificativa_atraso_leito', title: 'Transporte - Justificativa Atraso' },
                { id: 'transporte_observacao', title: 'Transporte - Observação' },

                // desfecho
                { id: 'desfecho', title: 'Desfecho' },
                { id: 'forcado', title: 'Forçado' },
            ]
        });

        const recordsFormatados = dados.map((item) => ({
            ...item,
            data_nascimento: formatDateToPtBr(item.data_nascimento),
            data_hora_acionamento_medico: formatDateTimeToPtBr(item.data_hora_acionamento_medico),
            data_hora_solicitacao_01: formatDateTimeToPtBr(item.data_hora_solicitacao_01),
            data_hora_solicitacao_02: formatDateTimeToPtBr(item.data_hora_solicitacao_02),
            regulacaoMedico_data_hora_regulacao_medico: formatDateTimeToPtBr(item.regulacaoMedico_data_hora_regulacao_medico),
            setorOrigem_data_hora_comunicacao: formatDateTimeToPtBr(item.setorOrigem_data_hora_comunicacao),
            transporte_data_hora_acionamento: formatDateTimeToPtBr(item.transporte_data_hora_acionamento),
            transporte_data_hora_chegada_origem: formatDateTimeToPtBr(item.transporte_data_hora_chegada_origem),
            transporte_data_hora_saida_origem: formatDateTimeToPtBr(item.transporte_data_hora_saida_origem),
            transporte_data_hora_chegada_destino: formatDateTimeToPtBr(item.transporte_data_hora_chegada_destino),
            transporte_data_hora_liberacao_leito: formatDateTimeToPtBr(item.transporte_data_hora_liberacao_leito),
            // outras datas que tiver...
        }));
        


        await csvWriter.writeRecords(recordsFormatados);
        console.log(`✅ Relatório CSV gerado com sucesso`);
        return filePath;
    } catch (error) {
        console.error('❌ Erro ao gerar o relatório CSV:', error);
        throw new Error('Erro ao gerar o relatório CSV.');
    }
}

async function exportarRelatorioCSVEfetivacao(dados) {
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
        console.log(`✅ Relatório CSV gerado com sucesso`);
        return filePath;
    } catch (error) {
        console.error('❌ Erro ao gerar o relatório CSV:', error);
        throw new Error('Erro ao gerar o relatório CSV.');
    }
}

export {
    exportarRelatorioCSVPaciente,
    exportarRelatorioCSVGeral,
    exportarRelatorioCSVEfetivacao
};
