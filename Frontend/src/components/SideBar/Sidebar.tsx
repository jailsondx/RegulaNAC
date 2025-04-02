import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TiExportOutline, TiBusinessCard, TiClipboard, TiThumbsUp, TiThumbsDown, TiHeartHalfOutline, TiHomeOutline, TiUpload, TiArrowBack } from "react-icons/ti";
import { getUserData } from '../../functions/storageUtils';

/*IMPORT INTERFACE*/
import { UserData } from '../../interfaces/UserData';

/*IMPORT CSS*/
import './Sidebar.css';

const Sidebar: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return localStorage.getItem('theme') === 'dark' ? 'dark' : 'light';
  });
  const [userData, setUserData] = useState<UserData | null>(null);
  const [iconUser, setIconUser] = useState<string | null>(null);
  const [showReportMenu, setShowReportMenu] = useState(false);

  useEffect(() => {
    document.body.className = theme === 'dark' ? 'dark-theme' : 'light-theme';
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const dataUser = getUserData();
    setUserData(dataUser);
  }, []);

  useEffect(() => {
    if (userData?.tipo === 'MEDICO') {
      setIconUser('/IconsUser/icon-medico.jpg');
    } else if (userData?.tipo === 'REGULADOR') {
      setIconUser('/IconsUser/icon-regulador-2.jpg');
    } else if (userData?.tipo === 'GERENCIA') {
      setIconUser('/IconsUser/icon-regulador.jpg');
    } else {
      setIconUser('/IconsUser/icon-anonimous.png');
    }
  }, [userData]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const renderMenuItems = () => {
    if (!userData) return null;

    const { tipo } = userData;

    if (tipo === 'MEDICO') {
      return (
        <ul>
          <li> <Link to="/RegulacaoMedica"><TiHeartHalfOutline className='Icon-Menu-Item' /><label className='textMenu-Item'>Regulação Médica</label></Link> </li>
          <li> <Link to="/RegulacoesAprovadas"><TiThumbsUp className='Icon-Menu-Item' /><label className='textMenu-Item'>Regulações Aprovadas</label></Link> </li>
          <hr />
          <li> <Link to="/Login"><TiExportOutline className='Icon-Menu-Item' /><label className='textMenu-Item'>Sair</label></Link></li>
        </ul>

      );
    }

    if (tipo === 'REGULADOR') {
      return (
        <>
          <ul>
            <li><Link to="/NovaRegulacao"><TiBusinessCard className='Icon-Menu-Item' /><label className='textMenu-Item'>Nova Regulação</label></Link></li>
            <li><Link to="/ListaRegulacoes"><TiClipboard className='Icon-Menu-Item' /><label className='textMenu-Item'>Lista de Regulações</label></Link></li>
            <li><Link to="/RegulacoesAprovadas"><TiThumbsUp className='Icon-Menu-Item' /><label className='textMenu-Item'>Regulações Aprovadas</label></Link></li>
            <li><Link to="/RegulacoesNegadas"><TiThumbsDown className='Icon-Menu-Item' /><label className='textMenu-Item'>Regulações Negadas</label></Link></li>
            <li><Link to="/Desfechos"><TiHomeOutline className='Icon-Menu-Item' /><label className='textMenu-Item'>Gerar Desfecho</label></Link></li>
            <hr />
          </ul>
          <li><Link to="/ListaRegulacoes24"><TiClipboard className='Icon-Menu-Item' /><label className='textMenu-Item'>Regulações +24hrs</label></Link></li>
          <li><Link to="/Finalizadas"><TiClipboard className='Icon-Menu-Item' /><label className='textMenu-Item'>Regulações Finalizadas</label></Link></li>
          <hr />
          <li> <Link to="/Login"><TiExportOutline className='Icon-Menu-Item' /><label className='textMenu-Item'>Sair</label></Link></li>
        </>
      );
    }

    if (tipo === 'GERENCIA') {
      return (
        <>
          <ul>
            <li><Link to="/NovaRegulacao"><TiBusinessCard className='Icon-Menu-Item' /><label className='textMenu-Item'>Nova Regulação</label></Link></li>
            <li><Link to="/ListaRegulacoes"><TiClipboard className='Icon-Menu-Item' /><label className='textMenu-Item'>Lista de Regulações</label></Link></li>
            <li><Link to="/RegulacoesAprovadas"><TiThumbsUp className='Icon-Menu-Item' /><label className='textMenu-Item'>Regulações Aprovadas</label></Link></li>
            <li><Link to="/RegulacoesNegadas"><TiThumbsDown className='Icon-Menu-Item' /><label className='textMenu-Item'>Regulações Negadas</label></Link></li>
            <li><Link to="/Desfechos"><TiHomeOutline className='Icon-Menu-Item' /><label className='textMenu-Item'>Gerar Desfecho</label></Link></li>
            <li> <a onClick={() => setShowReportMenu(true)}><TiUpload className='Icon-Menu-Item' /><label className='textMenu-Item'>Relatórios</label></a></li>
            <hr />
          </ul>
          <li><Link to="/ListaRegulacoes24"><TiClipboard className='Icon-Menu-Item' /><label className='textMenu-Item'>Regulações +24hrs</label></Link></li>
          <li><Link to="/Finalizadas"><TiClipboard className='Icon-Menu-Item' /><label className='textMenu-Item'>Regulações Finalizadas</label></Link></li>
          <li> <Link to="/RegulacaoMedica"><TiHeartHalfOutline className='Icon-Menu-Item' /><label className='textMenu-Item'>Regulação Médica</label></Link></li>
          <li> <Link to="/Register"><TiHeartHalfOutline className='Icon-Menu-Item' /><label className='textMenu-Item'>Cadastro</label></Link></li>
          <hr />
          <li> <Link to="/Login"><TiExportOutline className='Icon-Menu-Item' /><label className='textMenu-Item'>Sair</label></Link></li>
        </>
      );
    }

    return null;
  };

  const renderReportMenuItems = () => {
    return (
      <ul>
        <li><a onClick={() => setShowReportMenu(false)}><TiArrowBack className='Icon-Menu-Item' /><label className='textMenu-Item'>Voltar</label></a></li>
        <li><Link to="/RelatoriosRegulacao"><TiUpload className='Icon-Menu-Item' /><label className='textMenu-Item'>Relatórios R</label></Link></li>
        <li><Link to="/RelatorioEfetivacao"><TiUpload className='Icon-Menu-Item' /><label className='textMenu-Item'>Relatório de Efetivação</label></Link></li>
        <li><Link to="/RelatorioTempoEfetivacao"><TiUpload className='Icon-Menu-Item' /><label className='textMenu-Item'>Relatório de Tempo de Efetivação</label></Link></li>
      </ul>
    );
  };

  return (
    <div className="sidebar">
      <div className="sidebar-sup">
        <label className='sidebar-Title'> RegulaNAC </label>
        <div className='inf-user'>
          <img className="IconUser" src={iconUser || '/IconsUser/default-icon.png'} alt="User Icon" />
          <p>
            <label className="sidebar-Username">{userData?.login}</label>
            <label className="sidebar-Username">{userData?.nome}</label>
          </p>
        </div>

        <ul>
          {showReportMenu ? renderReportMenuItems() : renderMenuItems()}
        </ul>
      </div>

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