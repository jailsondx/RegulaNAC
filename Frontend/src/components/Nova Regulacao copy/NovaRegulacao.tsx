import React, { useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';

import './NovaRegulacao.css';

// Definição da interface que descreve os tipos das propriedades do formulário
interface FormDataNovaRegulacao {
  prontuario_paciente: number | null;
  nome_paciente: string;
  idade: number | null;
  un_solicitante: string | null;
  prioridade: number | null;
  data_hora_01: string;
  num_regulacao: number | null;
  nome_medico_regulador: string;
}

// Componente funcional para o formulário de nova regulação
const NovaRegulacao: React.FC = () => {
  // Estado inicial para o formulário com valores padrão
  const [formData, setFormData] = useState<FormDataNovaRegulacao>({
    prontuario_paciente: null,
    nome_paciente: '',
    idade: null,
    un_solicitante: null,
    prioridade: null,
    data_hora_01: '',
    num_regulacao: null,
    nome_medico_regulador: '',
  });

  // Estados para exibir mensagens de sucesso ou erro
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Atualiza os valores do estado `formData` com base na entrada do usuário
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;

    setFormData((prevState) => ({
      ...prevState,
      [name]: name === 'idade' || name === 'prioridade' || name === 'num_regulacao'
        ? value === '' ? null : parseInt(value, 10) // Converte para número ou null
        : value === '' ? null : value, // Campos de texto ou select aceitam valores nulos ou strings
    }));
  };

  // Lida com o envio do formulário
  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault(); // Evita o comportamento padrão de recarregar a página

    try {
      // Envia os dados do formulário para a API
      //await axios.post('/api/post/NovaRegulacao', formData);
      console.log(formData);

      // Define mensagem de sucesso e limpa os campos do formulário
      setMessage('Regulação cadastrada com sucesso!');
      setError('');
      setFormData({
        prontuario_paciente: null,
        nome_paciente: '',
        idade: null,
        un_solicitante: null,
        prioridade: null,
        data_hora_01: '',
        num_regulacao: null,
        nome_medico_regulador: '',
      });
    } catch (err) {
      // Exibe mensagem de erro caso a requisição falhe
      setError('Erro ao cadastrar regulação. Por favor, tente novamente.');
      setMessage('');
    }
  };

  return (
    <div className='NovaRegulacao'>
      <h2>Nova Regulação</h2>

      {/* Exibe mensagens de sucesso ou erro */}
      {message && <div style={{ color: 'green' }}>{message}</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}

      {/* Formulário para entrada de dados */}
      <form className='Form-NovaRegulacao' onSubmit={handleSubmit}>

        {/* Formulário LINHA 1 */}
        <div className='Form-Div-NovaRegulacao'>
          <div>
            <label>
              Prontuário:<br />
              <input
                type="number"
                name="prontuario_paciente"
                value={formData.prontuario_paciente ?? ''} // Exibe uma string vazia em vez de null
                onChange={handleChange}
                required
              />
            </label>
          </div>

          <div>
            <label>
              Nome do Paciente:<br />
              <input
                type="text"
                name="nome_paciente"
                value={formData.nome_paciente}
                onChange={handleChange}
                required
              />
            </label>
          </div>

          <div>
            <label>
              Idade:<br />
              <input
                type="number"
                name="idade"
                value={formData.idade ?? ''} // Exibe uma string vazia em vez de null
                onChange={handleChange}
                required
              />
            </label>
          </div>
        </div>

        {/* Formulário LINHA 2 */}
        <div className='Form-Div-NovaRegulacao'>
          <div>
            <label>
              Unidade Solicitante:<br />
              <select
                name="un_solicitante"
                value={formData.un_solicitante ?? ''} // Exibe uma string vazia em vez de null
                onChange={handleChange}
                required
              >
                <option value="">Selecione uma unidade</option>
                <option value="unidade1">Unidade 1</option>
                <option value="unidade2">Unidade 2</option>
                <option value="unidade3">Unidade 3</option>
              </select>
            </label>
          </div>

          <div>
            <label>
              Prioridade:<br />
              <input
                type="number"
                name="prioridade"
                value={formData.prioridade ?? ''} // Exibe uma string vazia em vez de null
                onChange={handleChange}
                required
                min="1"
                max="5"
              />
            </label>
          </div>

          <div>
            <label>
              Número da Regulação:<br />
              <input
                type="number"
                name="num_regulacao"
                value={formData.num_regulacao ?? ''} // Exibe uma string vazia em vez de null
                onChange={handleChange}
                required
              />
            </label>
          </div>
        </div>

        {/* Formulário LINHA 3 */}
        <div className='Form-Div-NovaRegulacao'>
          <div>
            <label>
              Nome do Médico Regulador:<br />
              <input
                type="text"
                name="nome_medico_regulador"
                value={formData.nome_medico_regulador}
                onChange={handleChange}
                required
              />
            </label>
          </div>

          <div>
            <label>
              Data e Hora da 1ª Solicitação:<br />
              <input
                type="datetime-local"
                name="data_hora_01"
                value={formData.data_hora_01}
                onChange={handleChange}
                required
              />
            </label>
          </div>
        </div>

        {/* Botão para submeter o formulário */}
        <button type="submit">Cadastrar Regulação</button>
      </form>
    </div>
  );
};

export default NovaRegulacao;
