import React from 'react';
import { FcOk, FcLeave } from 'react-icons/fc';

/*IMPORT INTERFACES*/
import { Vinculada } from '../../../../../interfaces/RegulacaoExtena';

interface Props {
  formData: Vinculada;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  iconStatusRegOk: boolean;
  iconStatusRegDeny: boolean;
}

export const Passo2: React.FC<Props> = ({
  formData,
  handleChange,
  iconStatusRegOk,
  iconStatusRegDeny
}) => {

  return (
    <div className="StepContent">
      <div className="line-StepContent">
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

      <div className="line-StepContent">
        <label>Data e Hora de Chegada:</label>
        <input
          type="datetime-local"
          name="data_hora_chegada"
          value={formData.data_hora_chegada}
          onChange={handleChange}
          required
        />
      </div>
    </div>
  );
};
