import React from "react";
import { DadosPacienteData } from "../../interfaces/DadosPaciente";

import './DadosPaciente.css';

const DadosPaciente: React.FC<{ dadosPaciente: DadosPacienteData }> = ({ dadosPaciente }) => {
  const {
    nome_paciente,
    num_prontuario,
    num_regulacao,
    un_origem,
    nome_colaborador_origem,
    un_destino,
    nome_colaborador_destino,
    num_leito,
    preparo_leito,
    nome_regulador_medico,
  } = dadosPaciente;

  return (
    <>
      <div className="DadosPaciente-Border">

        <div className="Div-IconePaciente">
          <img src="/DadosPaciente/paciente.png" className="IconePaciente" />
          <div>
            <label><p>{nome_paciente}</p></label>
            <label><b>Prontuário:</b> {num_prontuario}</label>
            <label><b>Regulação:</b> {num_regulacao}</label>
          </div>
        </div>

        <div className="Div-DadosPaciente">
          <div className="InformacoesPaciente">
            <span>
              <label><b>Un. Origem:</b> {un_origem}</label>
              {nome_colaborador_origem && (
                <label><b>Colaborador:</b> {nome_colaborador_origem}</label>
              )}
            </span>


            <span>
              <label><b>Un. Destino:</b> {un_destino}</label>
              {nome_colaborador_destino && (
                <label><b>Colaborador:</b> {nome_colaborador_destino}</label>
              )}
            </span>


            <div>
              {num_leito && (
                <label><b>Leito:</b> {num_leito}</label>
              )}
              {preparo_leito && (
                <label><b>Preparo Leito:</b> {preparo_leito}</label>
              )}

            </div>

            <label><b>Médico Regulador:</b> {nome_regulador_medico}</label>

          </div>

        </div>
      </div>
    </>

  );
};

export default DadosPaciente;
