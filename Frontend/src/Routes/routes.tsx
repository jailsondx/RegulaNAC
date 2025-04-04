import React from 'react';
import { BrowserRouter, Route, Routes, Outlet } from 'react-router-dom';

// Importação das páginas
import PrivateRoute from './privateRoutes';
import Sidebar from '../components/SideBar/Sidebar';
import Home from '../components/home/home';
import NovaRegulacao from '../components/Regulacoes/Nova Regulacao/NovaRegulacao';
import ListaRegulacoes from '../components/Regulacoes/ListaRegulacoes/ListaRegulacoes';
import RegulacaMedica from '../components/Regulacoes/Regulacao Medica/RegulacaoMedica';
import AtualizaRegulacao from '../components/Regulacoes/Atualiza Regulacao/AtualizaRegulacao';
import Cadastro from '../components/Usuarios/Cadastro/Cadastro';
import Login from '../components/Usuarios/Login/Login';
import PageNotFound from './page404';
import RegulacoesAprovadas from '../components/Regulacoes/ListaRegulacoes/ListaRegulacoesAprovadas';
import ListaRegulacoes24 from '../components/Regulacoes/ListaRegulacoes/ListaRegulacoes+24';
import ListarDesfecho from '../components/Desfecho/ListarDesfechos';
import ListaRegulacoesFinalizadas from '../components/Regulacoes/ListaRegulacoes/ListaRegulacoesFinalizadas';
import RelatoriosRegulacao from '../components/Relatorios/RelatoriosRegulacao';
import RelatorioEfetivacao from '../components/Relatorios/RelatorioEfetivacao';
import RelatorioTempoEfetivacao from '../components/Relatorios/RelatorioTempoEfetivacao';
import EditaRegulacao from '../components/Regulacoes/Edita Regulacao/EditaRegulacao';
import UpdateSenha from '../components/Usuarios/Update Senha/UpdateSenha';
import ListaRegulacoesNegadas from '../components/Regulacoes/ListaRegulacoes/ListaRegulacoesNegadas';

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
        <Route path="/register" element={<Cadastro />} />
        <Route path="/updatepassword" element={<UpdateSenha />} />

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
          <Route path="EditaRegulacao" element={<EditaRegulacao />} />
          <Route path="RegulacaoMedica" element={<RegulacaMedica />} />
          <Route path="RegulacoesAprovadas" element={<RegulacoesAprovadas />} />
          <Route path="RegulacoesNegadas" element={<ListaRegulacoesNegadas />} />
          <Route path="Desfechos" element={<ListarDesfecho />} />
          <Route path="Finalizadas" element={<ListaRegulacoesFinalizadas />} />
          <Route path="RelatoriosRegulacao" element={<RelatoriosRegulacao />} />
          <Route path="RelatorioEfetivacao" element={<RelatorioEfetivacao />} />
          <Route path="RelatorioTempoEfetivacao" element={<RelatorioTempoEfetivacao />} />
        </Route>

        {/* Página 404 - Página não encontrada */}
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Rotas;
