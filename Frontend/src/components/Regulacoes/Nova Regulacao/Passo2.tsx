import React from 'react';

interface UnidadeOption {
  value: string;
  label: string;
}
/*IMPORT INTERFACES*/
import { NovaRegulacaoData } from '../../../interfaces/Regulacao';

interface Props {
  formData: NovaRegulacaoData;
  handleChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  unidadesOrigem: UnidadeOption[];
  unidadesDestino: UnidadeOption[];
}

export const Passo2: React.FC<Props> = ({
  formData,
  handleChange,
  unidadesOrigem,
  unidadesDestino
}) => {
  return (
    <div className="StepContent">
      <div className="line-StepContent">
        <label>Unidade Origem:</label>
        <select
          name="un_origem"
          value={formData.un_origem}
          onChange={handleChange}
          required
        >
          <option value="">Selecione uma unidade</option>
          {unidadesOrigem.map((unidade) => (
            <option key={unidade.value} value={unidade.value}>
              {unidade.label}
            </option>
          ))}
        </select>
      </div>

      <div className="line-StepContent">
        <label>Unidade Destino:</label>
        <select
          name="un_destino"
          value={formData.un_destino}
          onChange={handleChange}
          required
        >
          <option value="">Selecione uma unidade</option>
          {unidadesDestino.map((unidade) => (
            <option key={unidade.value} value={unidade.value}>
              {unidade.label}
            </option>
          ))}
        </select>
      </div>

      <div className="line-StepContent">
        <label>Data e Hora da 1ª Solicitação:</label>
        <input
          type="datetime-local"
          name="data_hora_solicitacao_01"
          value={formData.data_hora_solicitacao_01}
          onChange={handleChange}
          required
        />
      </div>
    </div>
  );
};
