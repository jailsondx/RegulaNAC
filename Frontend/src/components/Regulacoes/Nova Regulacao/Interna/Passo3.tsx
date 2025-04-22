import React from 'react';
import { FcOk, FcLeave } from 'react-icons/fc';

/*IMPORT INTERFACES*/
import { NovaRegulacaoData } from '../../../../interfaces/Regulacao';

interface Props {
    formData: NovaRegulacaoData;
    handleChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    handleSelectChange_medico: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    medicos: string[];
    isValueDestino: boolean;
    iconStatusRegOk: boolean;
    iconStatusRegDeny: boolean;
}

export const Passo3: React.FC<Props> = ({
    formData,
    handleChange,
    handleSelectChange_medico,
    medicos,
    isValueDestino,
    iconStatusRegOk,
    iconStatusRegDeny
}) => {
    return (
        <div className="StepContent">
            <div className="line-StepContent">
                <label>Nome do Médico Regulador:</label>
                <select
                    name="nome_regulador_medico"
                    value={formData.nome_regulador_medico}
                    onChange={handleSelectChange_medico}
                    required
                >
                    <option value="" disabled>Selecione um médico</option>
                    {medicos.map((medico, index) => (
                        <option key={index} value={medico}>{medico}</option>
                    ))}
                </select>
            </div>

            <div className="line-StepContent-2">
                <div className="line-StepContent-sub">
                    <label>Nº Regulação:</label>
                    <span className='spanInput-line-StepContent'>
                        <input
                            type="number"
                            name="num_regulacao"
                            value={formData.num_regulacao ?? ''}
                            onChange={handleChange}
                            required
                        />
                        {iconStatusRegOk && <FcOk className='Icon-Status-NovaRegulacao' />}
                        {iconStatusRegDeny && <FcLeave className='Icon-Status-NovaRegulacao' />}
                    </span>
                </div>

                <div className="line-StepContent-sub">
                    <label>Prioridade:</label>
                    <input
                        type="text"
                        name="prioridade"
                        value={formData.prioridade ?? ''}
                        onChange={handleChange}
                        className={isValueDestino ? 'requireBorder' : ''}
                        required={isValueDestino}
                    />
                </div>
            </div>

            <div className="line-StepContent">
                <label>Data e Hora do Acionamento do Médico:</label>
                <input
                    type="datetime-local"
                    name="data_hora_acionamento_medico"
                    value={formData.data_hora_acionamento_medico}
                    min={formData.data_hora_solicitacao_01}
                    onChange={handleChange}
                    required
                />
            </div>
        </div>
    );
};
