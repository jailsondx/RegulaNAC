import React from "react";
import { DadosPacienteData } from "../../interfaces/DadosPaciente";

const DadosPaciente: React.FC<{ dadosPaciente: DadosPacienteData }> = ({ dadosPaciente }) => {
  const {
    nome_paciente,
    num_prontuario,
    num_regulacao,
    un_origem,
    un_destino,
    num_leito,
    nome_regulador_medico,
  } = dadosPaciente;

  return (
    <div className="DadosPaciente-Border">
      <label className="TitleDadosPaciente">Dados Paciente</label>
      <div className="Div-DadosPaciente RegulacaoPaciente">
        <label>Paciente: {nome_paciente}</label>
        <span>
          <label>Prontuário: {num_prontuario}</label>
          <label>Regulação: {num_regulacao}</label>
        </span>

        <label>Un. Origem: {un_origem}</label>
        <span>
          <label>Un. Destino: {un_destino}</label>
          <label>Leito: {num_leito}</label>
        </span>
      </div>
      <div className="Div-DadosMedico RegulacaoPaciente">
        <label>Médico Regulador: {nome_regulador_medico}</label>
      </div>
    </div>
  );
};

export default DadosPaciente;
