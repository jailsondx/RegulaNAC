import React from 'react';
import { formatDateTimeToPtBr } from '../../../../functions/DateTimes';

/*IMPORT INTERFACES*/
import { NovaRegulacaoExterna } from '../../../../interfaces/RegulacaoExtena';

interface Props {
    formData: NovaRegulacaoExterna;
}

export const Passo3: React.FC<Props> = ({
    formData,
}) => {
    return (
        <div className="StepContent">
            <label>Confira as informações antes de finalizar:</label>
            <ul>
                <li><strong>Vinculo:</strong> Regulaçao Externa Obstétrica</li>
                <li><strong>Nome do Paciente:</strong> {formData.nome_paciente}</li>
                <li><strong>Prontuário:</strong> {formData.num_prontuario}</li>
                <li><strong>Idade:</strong> {formData.num_idade} Anos</li>
                <li><strong>Unidade de Origem:</strong> {formData.un_origem}</li>
                <li><strong>Médico Regulador:</strong> {formData.nome_regulador_medico}</li>
                <li><strong>Nº Regulação:</strong> {formData.num_regulacao}</li>
                <li><strong>Data Hora da Chegada:</strong> {formatDateTimeToPtBr(formData.data_hora_chegada || '')}</li>
            </ul>
        </div>
    );
};
