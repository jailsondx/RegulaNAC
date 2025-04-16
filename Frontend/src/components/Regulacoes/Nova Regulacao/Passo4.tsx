import React from 'react';
import { formatDateTimeToPtBr } from '../../../functions/DateTimes';

/*IMPORT INTERFACES*/
import { NovaRegulacaoData } from '../../../interfaces/Regulacao';

interface Props {
    formData: NovaRegulacaoData;
    handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    isValueOrigemOBS: boolean;
}

export const Passo4: React.FC<Props> = ({
    formData,
    handleFileChange
}) => {
    return (
        <div className="StepContent">
            <label>Confira as informações antes de finalizar:</label>
            <ul>
                <li><strong>Nome do Paciente:</strong> {formData.nome_paciente}</li>
                <li><strong>Prontuário:</strong> {formData.num_prontuario}</li>
                <li><strong>Idade:</strong> {formData.num_idade} Anos</li>
                <li><strong>Unidade Origem:</strong> {formData.un_origem}</li>
                <li><strong>Unidade Destino:</strong> {formData.un_destino}</li>
                <li><strong>Data Hora 1ª Solicitação:</strong> {formatDateTimeToPtBr(formData.data_hora_solicitacao_01)}</li>
                <li><strong>Prioridade:</strong> {formData.prioridade}</li>
                <li><strong>Nº Regulação:</strong> {formData.num_regulacao}</li>
                <li><strong>Nome do Médico Regulador:</strong> {formData.nome_regulador_medico}</li>
                <li><strong>Data Hora Acionamento Médico:</strong> {formatDateTimeToPtBr(formData.data_hora_acionamento_medico)}</li>
            </ul>

            <div className="line-StepContent upload">
                <label>Enviar PDF da Regulação:</label>
                <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                />
            </div>
        </div>
    );
};
