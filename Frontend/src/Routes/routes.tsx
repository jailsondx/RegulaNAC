import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

// Importação das páginas
import Sidebar from '../components/SideBar/Sidebar';
import Home from '../components/home/home';
import NovaRegulacao from '../components/Nova Regulacao/NovaRegulacao';
import Regulacao from '../components/Regulacoes/Regulacoes';
import RegulacaMedica from '../components/Regulacao Medica/RegulacaoMedica';

const Rotas: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Página de login sem o Sidebar */}
        {/* <Route path="/login" element={<Login />} /> */}
        

        {/* Rotas com o Sidebar */}
        <Route
          path="*"
          element={
            <div className="app-container">
              <Sidebar />
              <div className="content">
                <Routes>
                  <Route path="/" element={<Home title="Pagina Inicial" />} />
                  <Route path="/Regulacoes" element={<Regulacao />} />
                  <Route path="/NovaRegulacao" element={<NovaRegulacao />} />
                  <Route path="/RegulacaoMedica" element={<RegulacaMedica />} />
                </Routes>
              </div>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default Rotas;
