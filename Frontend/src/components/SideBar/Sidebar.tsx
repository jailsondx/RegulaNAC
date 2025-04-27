import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  TiExportOutline, TiBusinessCard, TiClipboard, TiThumbsUp, TiThumbsDown,
  TiHeartHalfOutline, TiHomeOutline, TiUpload, TiArrowBack, TiContacts
} from "react-icons/ti";
import { getUserData } from '../../functions/storageUtils';
import { UserData } from '../../interfaces/UserData';
import './Sidebar.css';

// Componente principal Sidebar
const Sidebar: React.FC = () => {
  // Estado para o tema (claro/escuro)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => localStorage.getItem('theme') === 'dark' ? 'dark' : 'light');
  // Estado para dados do usuário logado
  const [userData, setUserData] = useState<UserData | null>(null);
  // Estado para o ícone do usuário
  const [iconUser, setIconUser] = useState<string>('/IconsUser/default-icon.png');
  // Estado para alternar o menu de relatórios
  const [showReportMenu, setShowReportMenu] = useState(false);
  // Estado para alternar o menu de solicitações externas
  const [showExternalMenu, setShowExternalMenu] = useState(false);

  // Efeito: Aplica o tema no body da página
  useEffect(() => {
    document.body.className = theme === 'dark' ? 'dark-theme' : 'light-theme';
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Efeito: Pega dados do usuário ao montar o componente
  useEffect(() => {
    setUserData(getUserData());
  }, []);

  // Efeito: Define ícone do usuário baseado no tipo (MEDICO, AUX. ADMINISTRATIVO, etc.)
  useEffect(() => {
    if (!userData) return;

    const iconMap: Record<string, string> = {
      'MEDICO': '/IconsUser/icon-medico.jpg',
      'AUX. ADMINISTRATIVO': '/IconsUser/icon-regulador-2.jpg',
      'GERENCIA': '/IconsUser/icon-regulador.jpg',
    };

    setIconUser(iconMap[userData.tipo] || '/IconsUser/icon-anonimous.png');
  }, [userData]);

  // Função para alternar o tema
  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  // Componente para gerar um Link do Menu (reutilizável)
  const MenuLink = ({ to, Icon, label }: { to: string; Icon: React.ElementType; label: string }) => (
    <li>
      <Link to={to}>
        <Icon className="Icon-Menu-Item" />
        <label className="textMenu-Item">{label}</label>
      </Link>
    </li>
  );

  // Componente para gerar um Botão do Menu (reutilizável)
  const MenuButton = ({ onClick, Icon, label }: { onClick: () => void; Icon: React.ElementType; label: string }) => (
    <li>
      <button className="menu-button" onClick={onClick}>
        <Icon className="Icon-Menu-Item" />
        <label className="textMenu-Item">{label}</label>
      </button>
    </li>
  );

  // Função que renderiza os itens principais do Menu
  const renderMenuItems = () => {
    if (!userData) return null;

    const { tipo, permissao } = userData;

    // Se for médico
    if (tipo === 'MEDICO') {
      if (!permissao) {
        // Médico comum
        return (
          <>
            <MenuLink to="/RegulacaoMedica" Icon={TiHeartHalfOutline} label="Regulação Médica Interna" />
            <MenuLink to="/RegulacaoMedicaExternas" Icon={TiHeartHalfOutline} label="Regulação Médica Externa" />
            <MenuLink to="/RegulacoesAprovadas" Icon={TiThumbsUp} label="Regulações Aprovadas Internas" />
            <MenuLink to="/RegulacoesAprovadasExternas" Icon={TiThumbsUp} label="Regulações Aprovadas Externas" />
            <hr />
            <MenuLink to="/Login" Icon={TiExportOutline} label="Sair" />
          </>
        );
      }
      if (permissao === 'NEONATOLOGIA') {
        // Médico com permissão especial
        return (
          <>
            <MenuLink to="/RegulacaoMedica" Icon={TiHeartHalfOutline} label="TESTE" />
          </>
        );
      }
    }

    // Se for administrativo ou gerência
    if (tipo === 'AUX. ADMINISTRATIVO' || tipo === 'GERENCIA') {
      return (
        <>
          <MenuLink to="/NovaRegulacao" Icon={TiBusinessCard} label="Nova Regulação" />
          <MenuLink to="/ListaRegulacoes" Icon={TiClipboard} label="Lista de Regulações" />
          <MenuLink to="/RegulacoesAprovadas" Icon={TiThumbsUp} label="Regulações Aprovadas" />
          <MenuLink to="/RegulacoesNegadas" Icon={TiThumbsDown} label="Regulações Negadas" />
          <MenuLink to="/Desfechos" Icon={TiHomeOutline} label="Gerar Desfecho" />
          {/* Botão para abrir o menu de relatórios (apenas para gerência) */}
          {tipo === 'GERENCIA' && (
            <MenuButton onClick={() => { setShowReportMenu(true); setShowExternalMenu(false); }} Icon={TiUpload} label="Relatórios" />
          )}
          <hr />
          {/* Botão para abrir o menu de solicitações externas */}
          <MenuButton onClick={() => { setShowExternalMenu(true); setShowReportMenu(false); }} Icon={TiContacts} label="Solicitações de Origem Externa" />
          <hr />
          <MenuLink to="/ListaRegulacoes24" Icon={TiClipboard} label="Regulações +24hrs" />
          <MenuLink to="/Finalizadas" Icon={TiClipboard} label="Regulações Finalizadas" />
          {/* Acesso a regulações médicas internas só para gerência */}
          {tipo === 'GERENCIA' && (
            <>
              <MenuLink to="/RegulacaoMedica" Icon={TiHeartHalfOutline} label="Regulação Médica Interna" />
              <MenuLink to="/RegulacaoMedicaExternas" Icon={TiHeartHalfOutline} label="Regulação Médica Externa" />
            </>
          )}
          <hr />
          <MenuLink to="/Login" Icon={TiExportOutline} label="Sair" />
        </>
      );
    }

    return null;
  };

  // Função para renderizar os itens do menu de relatórios
  const renderReportMenuItems = () => (
    <>
      <MenuButton onClick={() => setShowReportMenu(false)} Icon={TiArrowBack} label="Voltar" />
      <MenuLink to="/RelatoriosRegulacao" Icon={TiUpload} label="EM DESENVOLVIMENTO" />
      <MenuLink to="/RelatorioEfetivacao" Icon={TiUpload} label="Relatório de Efetivação" />
      <MenuLink to="/RelatorioTempoEfetivacao" Icon={TiUpload} label="Relatório de Tempo de Efetivação" />
    </>
  );

  // Função para renderizar os itens do menu de solicitações externas
  const renderExternalMenuItems = () => (
    <>
      <MenuButton onClick={() => setShowExternalMenu(false)} Icon={TiArrowBack} label="Voltar" />
      <MenuLink to="/RegulacaoExObstetrica" Icon={TiBusinessCard} label="Regulação Obstétrica" />
      <MenuLink to="/RegulacaoExAVC" Icon={TiBusinessCard} label="Regulação AVC" />
      <MenuLink to="/RegulacaoExNeurocirurgia" Icon={TiBusinessCard} label="Regulação Neurocirurgia" />
      <MenuLink to="/ListaRegulacoesExternas" Icon={TiClipboard} label="Lista de Regulações" />
      <MenuLink to="/RegulacoesAprovadasExternas" Icon={TiThumbsUp} label="Regulações Aprovadas Externas" />
    </>
  );

  // Renderização final
  return (
    <div className="sidebar">
      {/* Parte de cima da sidebar */}
      <div className="sidebar-sup">
        <label className="sidebar-Title">RegulaNAC</label>
        <div className="inf-user">
          <img className="IconUser" src={iconUser} alt="User Icon" />
          <p>
            <label className="sidebar-Username">{userData?.login}</label>
            <label className="sidebar-Username">{userData?.nome}</label>
          </p>
        </div>

        <ul>
          {/* Mostra o menu correto dependendo do estado atual */}
          {showReportMenu ? renderReportMenuItems() : showExternalMenu ? renderExternalMenuItems() : renderMenuItems()}
        </ul>
      </div>

      {/* Parte de baixo da sidebar */}
      <div className="sidebar-inf">
        <label>Tema {theme}</label>
        <div className={`slider ${theme}`} onClick={toggleTheme}>
          <div className="slider__ball"></div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
