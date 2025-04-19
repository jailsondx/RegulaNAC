import React from 'react';
import { BrowserRouter, Route, Routes, Outlet } from 'react-router-dom';

// Importação das páginas
import PrivateRoute from './privateRoutes';
import Sidebar from '../components/SideBar/Sidebar';
import Home from '../components/home/home';
import ListaRegulacoes from '../components/Regulacoes/ListaRegulacoes/ListaRegulacoes';
import RegulacaoMedicaInterna from '../components/Regulacoes/Regulacao Medica/RegulacaoMedicaInterna';
import RegulacaoMedicaExterna from '../components/Regulacoes/Regulacao Medica/RegulacaoMedicaExterna';
import AtualizaRegulacao from '../components/Regulacoes/Atualiza Regulacao/AtualizaRegulacao';
import Login from '../components/Usuarios/Login/Login';
import PageNotFound from './page404';
import RegulacoesAprovadas from '../components/Regulacoes/ListaRegulacoes/ListaRegulacoesAprovadas';
import ListaRegulacoes24hrs from '../components/Regulacoes/ListaRegulacoes/ListaRegulacoes+24';
import ListarDesfecho from '../components/Desfecho/ListarDesfechos';
import ListaRegulacoesFinalizadas from '../components/Regulacoes/ListaRegulacoes/ListaRegulacoesFinalizadas';
import RelatoriosRegulacao from '../components/Relatorios/RelatoriosRegulacao';
import RelatorioEfetivacao from '../components/Relatorios/RelatorioEfetivacao';
import RelatorioTempoEfetivacao from '../components/Relatorios/RelatorioTempoEfetivacao';
import EditaRegulacao from '../components/Regulacoes/Edita Regulacao/EditaRegulacao';
import ListaRegulacoesNegadas from '../components/Regulacoes/ListaRegulacoes/ListaRegulacoesNegadas';
import UpdateSenha from '../components/Usuarios/Update Senha/UpdateSenha';
import Page_Obstetrica from '../Pages/Nova Regulação/Regulação Externa/Page_Obstetrica';
import Page_NovaRegulacao from '../Pages/Nova Regulação/Regulaçao Interna/Page_NovaRegulacao';

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

        {/* 🔓 Rota pública - Login */}
        <Route path="/login" element={<Login />} />
        <Route path="/updatepassword" element={<UpdateSenha />} />

        {/* 🔐 Rota protegida sem Sidebar (caso precise) */}
        <Route
          element={<PrivateRoute element={<Outlet />} />}
        >
          {/* ...rotas protegidas sem Sidebar (opcional) */}
        </Route>

        {/* 🔐 Rota protegida com Sidebar (layout completo) */}
        <Route
          path="/"
          element={<PrivateRoute element={<ProtectedLayout />} />}
        >
          {/* Essas são todas as páginas protegidas */}
          <Route path="home" element={<Home title="Bem Vindo ao RegulaNAC" />} />
          <Route path="NovaRegulacao" element={<Page_NovaRegulacao />} />
          <Route path="AtualizaRegulacao" element={<AtualizaRegulacao />} />
          <Route path="EditaRegulacao" element={<EditaRegulacao />} />

          <Route path="RegulacaoExObstetrica" element={<Page_Obstetrica />} />

          <Route path="ListaRegulacoes" element={<ListaRegulacoes />} />
          <Route path="ListaRegulacoes24" element={<ListaRegulacoes24hrs />} />

          <Route path="RegulacaoMedicaInterna" element={<RegulacaoMedicaInterna />} />
          <Route path="RegulacaoMedicaExterna" element={<RegulacaoMedicaExterna />} />
          <Route path="RegulacoesAprovadas" element={<RegulacoesAprovadas />} />
          <Route path="RegulacoesNegadas" element={<ListaRegulacoesNegadas />} />

          <Route path="Desfechos" element={<ListarDesfecho />} />
          <Route path="Finalizadas" element={<ListaRegulacoesFinalizadas />} />
          <Route path="ListaRegulacoes/:id" element={<ListaRegulacoes />} />

          {/* Relatórios */}
          <Route path="RelatoriosRegulacao" element={<RelatoriosRegulacao />} />
          <Route path="RelatorioEfetivacao" element={<RelatorioEfetivacao />} />
          <Route path="RelatorioTempoEfetivacao" element={<RelatorioTempoEfetivacao />} />
        </Route>

        {/* 🧨 Página 404 */}
        <Route path="*" element={<PageNotFound />} />

      </Routes>
    </BrowserRouter>

  );
};

export default Rotas;
