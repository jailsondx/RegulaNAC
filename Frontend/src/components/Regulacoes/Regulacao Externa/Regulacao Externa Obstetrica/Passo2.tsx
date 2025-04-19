import React, { useEffect } from 'react';
import { FcOk, FcLeave } from 'react-icons/fc';

/*IMPORT INTERFACES*/
import { NovaRegulacaoExterna } from '../../../../interfaces/RegulacaoExtena';

interface Props {
  formData: NovaRegulacaoExterna;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSelectChange_medico: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  medicos: string[];
  iconStatusRegOk: boolean;
  iconStatusRegDeny: boolean;
}

export const Passo2: React.FC<Props> = ({
  formData,
  handleChange,
  handleSelectChange_medico,
  medicos,
  iconStatusRegOk,
  iconStatusRegDeny
}) => {

  useEffect(() => {
    // Limpa o valor do médico regulador se unidade de origem não for "CRESUS"
    if (formData.un_origem !== 'CRESUS' && formData.nome_regulador_medico !== '') {
      handleChange({
        target: {
          name: 'nome_regulador_medico',
          value: '',
        }
      } as React.ChangeEvent<HTMLInputElement | HTMLSelectElement>);

      handleChange({
        target: {
          name: 'data_hora_acionamento_medico',
          value: '',
        }
      } as React.ChangeEvent<HTMLInputElement | HTMLSelectElement>);
    }
  }, [formData.un_origem]);

  return (
    <div className="StepContent">

      <div className="line-StepContent">
        <label>Unidade de Origem:</label>
        <select
          name="un_origem"
          value={formData.un_origem}
          onChange={handleChange}
          required
        >
          <option value="">Selecione uma unidade</option>
          <option value="CRESUS">CRESUS</option>
          <option value="VINCULADAS">VINCULADAS</option>
        </select>
      </div>

      {formData.un_origem === 'CRESUS' && (
        <div className="line-StepContent-2">
          <div className="line-StepContent-sub">
            <label>Nome do Médico Regulador:</label>
            <select
              name="nome_regulador_medico"
              value={formData.nome_regulador_medico}
              onChange={handleSelectChange_medico}
            >
              <option value="" disabled>Selecione um médico</option>
              {medicos.map((medico, index) => (
                <option key={index} value={medico}>{medico}</option>
              ))}
            </select>
          </div>

          <div className="line-StepContent-sub">
            <label>Data e Hora Ac. Médico:</label>
            <input
              type="datetime-local"
              name="data_hora_acionamento_medico"
              value={formData.data_hora_acionamento_medico}
              onChange={handleChange}
              required
            />
          </div>
          
        </div>
      )}

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

    </div>
  );
};
