import React from 'react';
import { BrowserRouter, Route, Routes, Outlet } from 'react-router-dom';

// Importação das páginas
import PrivateRoute from './privateRoutes';
import Sidebar from '../components/SideBar/Sidebar';
import Home from '../components/home/home';
import NovaRegulacao from '../components/Nova Regulacao/NovaRegulacao';
import ListaRegulacoes from '../components/ListaRegulacoes/ListaRegulacoes';
import RegulacaMedica from '../components/Regulacao Medica/RegulacaoMedica';
import AtualizaRegulacao from '../components/Atualiza Regulacao/AtualizaRegulacao';
import Cadastro from '../components/Cadastro/Cadastro';
import Login from '../components/Login/Login';
import PageNotFound from './page404';
import RegulacoesAprovadas from '../components/Regulacoes Aprovadas/RegulacoesAprovadas';
import ListaRegulacoes24 from '../components/ListaRegulacoes/ListaRegulacoes+24';
import ListarDesfecho from '../components/Desfecho/ListarDesfechos';
import ListaRegulacoesFinalizadas from '../components/ListaRegulacoes/ListaRegulaçoesFinalizadas';

// Layout para rotas protegidas com o Sidebar
const ProtectedLayout: React.FC = () => {
  return (
    <>
      <Sidebar />
      <div className="content">
        <Outlet /> {/* Renderiza as rotas internas aqui */}
      </div>
    </>
  );
};

const Rotas: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Página de Login - Sem Sidebar */}
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />

        {/* Rotas protegidas com Sidebar */}
        <Route
          path="/"
          element={
            <div className="app-container">
              <PrivateRoute element={<ProtectedLayout />} />
            </div>
          }
        >
          <Route path="home" element={<Home title="RegulaNAC Pagina Inicial" />} />
          <Route path="ListaRegulacoes" element={<ListaRegulacoes />} />
          <Route path="ListaRegulacoes24" element={<ListaRegulacoes24 />} />
          <Route path="NovaRegulacao" element={<NovaRegulacao />} />
          <Route path="AtualizaRegulacao" element={<AtualizaRegulacao />} />
          <Route path="RegulacaoMedica" element={<RegulacaMedica />} />
          <Route path="RegulacoesAprovadas" element={<RegulacoesAprovadas />} />
          <Route path="Desfechos" element={<ListarDesfecho />} />
          <Route path="Finalizadas" element={<ListaRegulacoesFinalizadas />} />
        </Route>

        {/* Página 404 - Página não encontrada */}
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Rotas;
