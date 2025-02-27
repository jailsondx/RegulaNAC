import React, { useState } from 'react';
import axios from 'axios';
import { Snackbar, Alert } from '@mui/material';

/*IMPORT INTERFACE*/
import { FormCadastro } from '../../../interfaces/Cadastro';

/*IMPORT FUNCTIONS*/
import { validarCPF } from '../../../functions/ValidaCPF';

/*IMPORT CSS*/
import '../Usuarios.css';

const NODE_URL = import.meta.env.VITE_NODE_SERVER_URL;

const initialFormData: FormCadastro = {
  login: '',
  nome: '',
  cpf: '',
  senha: '',
  primeiroAcesso: false,
  tipo: 'REGULADOR'
}

const Cadastro: React.FC = () => {
  const [formData, setFormData] = useState<FormCadastro>(initialFormData);

  /*SNACKBAR*/
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>("success");

// Atualiza os campos do formulário
const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { name, value } = e.target;

  if (name === "cpf") {
    const cpfRegex = /^\d{0,11}$/; // Apenas números e máximo de 11 dígitos
    if (!cpfRegex.test(value)) return;

    // Se o CPF tem 11 dígitos, valida
    if (value.length === 11 && !validarCPF(value)) {
      showSnackbar('CPF inválido', 'warning');
      return;
    }
  }

  setFormData((prevFormData) => ({
    ...prevFormData,
    [name]: value
  }));
};



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação de CPF
    if (!validarCPF(formData.cpf)) {
      showSnackbar("CPF inválido", "error");
      return;
    }

    // Validação de Login para Médico
    if (formData.tipo === "MEDICO" && !/^\d+$/.test(formData.login)) {
      showSnackbar("O login do tipo MÉDICO deve conter apenas números.", "error");
      return;
    }

    try {
      const response = await axios.post(`${NODE_URL}/api/internal/post/Cadastro`, formData);

      if (response.status === 200) {
        setFormData(initialFormData);
        showSnackbar(response.data.message || 'Usuário Cadastrado com Sucesso', 'success');
      } else {
        showSnackbar('Erro ao realizar cadastro', 'error');
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        showSnackbar(err.response.data.message || 'Erro ao realizar cadastro', 'error');
      } else {
        showSnackbar('Erro inesperado. Tente novamente mais tarde.', 'error');
      }
    }
  };

  /*SNACKBARS*/
  const handleSnackbarClose = (): void => {
    setSnackbarOpen(false);
  };

  const showSnackbar = (
    message: string,
    severity: 'success' | 'error' | 'info' | 'warning'
  ): void => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  return (
    <>
      <div className='Screen-Login'>
        <div className='Component-Login'>

          <div className='div-direita'>
            <div className="login-container">
              <h1>Cadastro</h1>
              <form onSubmit={handleSubmit}>
                <div>
                  <input
                    type="text"
                    name="login"
                    value={formData.login}
                    onChange={handleChange}
                    placeholder="Login"
                    required
                    autoComplete="off"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    placeholder="Nome Completo"
                    required
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="cpf"
                    value={formData.cpf}
                    onChange={handleChange}
                    placeholder="CPF"
                    maxLength={11}  // Limita a 11 caracteres
                    minLength={11}  // Limita a 11 caracteres
                    required
                  />
                </div>
                <div>
                  <input
                    type="password"
                    name="senha"
                    value={formData.senha}
                    onChange={handleChange}
                    placeholder="Senha"
                    required
                  />
                </div>
                <div>
                  <select
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleChange}
                    required
                  >
                    <option value="REGULADOR">REGULADOR</option>
                    <option value="MEDICO">MÉDICO</option>
                    <option value="GERENCIA">GERÊNCIA</option>
                  </select>
                </div>
                <div>
                    <label>Definir Senha de Primeiro Acesso?</label>
                    <input
                      type="checkbox"
                      name="primeiroAcesso"
                      checked={formData.primeiroAcesso}
                      onChange={(e) => setFormData((prevFormData) => ({
                      ...prevFormData,
                      primeiroAcesso: e.target.checked
                      }))}
                    />
                </div>
                <div className='Div-Buttons Central'>
                  <button type="submit">Cadastrar</button>
                </div>
              </form>
            </div>
          </div>
          
          <div className='div-esquerda BG'>
            <div className='Circulo'>
              <img className='Logo' src='/Logo/RegulaNAC.png' alt="Logo" />
            </div>
          </div>

        </div>
      </div>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Cadastro;
