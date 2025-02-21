import React from "react";
import { DadosPacienteData } from "../../interfaces/DadosPaciente";
import { LuSquareUserRound } from "react-icons/lu";

import './DadosPaciente.css';

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
    <>
      <div className="DadosPaciente-Border">

        <div className="Div-IconePaciente">
          <LuSquareUserRound className="IconePaciente"/>
        </div>

        <div className="Div-DadosPaciente">
          <label className="NomePaciente">{nome_paciente}</label>
          <div className="InformacoesPaciente">
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
          <div>
            <label>Médico Regulador: {nome_regulador_medico}</label>
          </div>
        </div>

      </div>
    </>

  );
};

export default DadosPaciente;
