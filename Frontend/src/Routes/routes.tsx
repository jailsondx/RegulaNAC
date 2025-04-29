import React from 'react';
import { BrowserRouter, Route, Routes, Outlet } from 'react-router-dom';

// Importação dos componentes necessários
import PrivateRoute from './privateRoutes';
import Sidebar from '../components/SideBar/Sidebar';
import Home from '../components/home/home';
import PageNotFound from './page404';
import EditaRegulacao from '../components/Regulacoes/Edita Regulacao/EditaRegulacao';
import UpdateSenha from '../components/Usuarios/Update Senha/UpdateSenha';
import AtualizaRegulacao from '../components/Regulacoes/Atualiza Regulacao/AtualizaRegulacao';
import Login from '../components/Usuarios/Login/Login';

import ListarDesfecho from '../components/Desfecho/ListarDesfechos';
import RelatoriosRegulacao from '../components/Relatorios/Internas/RelatoriosRegulacao';
import RelatorioEfetivacao from '../components/Relatorios/Internas/RelatorioEfetivacao';
import RelatorioTempoEfetivacao from '../components/Relatorios/Internas/RelatorioTempoEfetivacao';


//PAGES INTERNAS
import Page_NovaRegulacao from '../Pages/Nova Regulação/Regulaçao Interna/Page_NovaRegulacao';
import Page_ListaRegulacoesInternas from '../Pages/Listas/Internas/Page_ListaRegulacoesInternas';
import Page_ListaRegulacoesInternas24hrs from '../Pages/Listas/Internas/Page_ListaRegulacoesInternas24hrs';
import Page_ListaRegulacoesMedicasInternas from '../Pages/Listas/Internas/Page_ListaRegulacoesMedicasInternas';
import Page_ListaRegulacoesInternasAprovadas from '../Pages/Listas/Internas/Page_ListaRegulacoesAprovadas';
import Page_ListaRegulacoesInternasNegadas from '../Pages/Listas/Internas/Page_ListaRegulacoesNegadas';
//PAGES RELATORIOS
import Page_RelatorioGeral from '../Pages/Relatorios/Page_RelatorioGeral';

//PAGES EXTERNAS
import Page_Obstetrica from '../Pages/Nova Regulação/Regulação Externa/Page_Obstetrica';
import Page_AVC from '../Pages/Nova Regulação/Regulação Externa/Page_AVC';
import Page_ListaRegulacoesExternas from '../Pages/Listas/Externas/Page_ListaRegulacoesExternas';
import Page_ListaRegulacoesMedicasExternas from '../Pages/Listas/Externas/Page_ListaRegulacoesMedicasExternas';
import Page_ListaRegulacoesExternasAprovadas from '../Pages/Listas/Externas/Page_ListaRegulacoesExternasAprovadas';




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

          {/* Essas são todas as páginas de regulaçao interna */}
          <Route path="NovaRegulacao" element={<Page_NovaRegulacao />} />
          <Route path="AtualizaRegulacao" element={<AtualizaRegulacao />} />
          <Route path="EditaRegulacao" element={<EditaRegulacao />} />
          <Route path="ListaRegulacoes" element={<Page_ListaRegulacoesInternas />} />
          <Route path="RegulacaoMedica" element={<Page_ListaRegulacoesMedicasInternas />} />
          <Route path="ListaRegulacoes24" element={<Page_ListaRegulacoesInternas24hrs />} />
          <Route path="RegulacoesAprovadas" element={<Page_ListaRegulacoesInternasAprovadas />} />
          <Route path="RegulacoesNegadas" element={<Page_ListaRegulacoesInternasNegadas />} />

          {/* Essas são todas as páginas de relatórios internos */}
          <Route path="RelatorioGeral" element={<Page_RelatorioGeral />} />

          {/* Essas são todas as páginas de regulaçao externa */}
          <Route path="RegulacaoExObstetrica" element={<Page_Obstetrica />} />
          <Route path="RegulacaoExAVC" element={<Page_AVC />} />
          <Route path="ListaRegulacoesExternas" element={<Page_ListaRegulacoesExternas />} />
          <Route path="RegulacaoMedicaExternas" element={<Page_ListaRegulacoesMedicasExternas />} />
          <Route path="RegulacoesAprovadasExternas" element={<Page_ListaRegulacoesExternasAprovadas />} />

          

          
          <Route path="Desfechos" element={<ListarDesfecho />} />

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
