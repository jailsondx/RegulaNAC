import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TiExportOutline, TiBusinessCard, TiClipboard, TiThumbsUp, TiThumbsDown,
  TiHeartHalfOutline, TiHomeOutline, TiUpload, TiArrowBack, TiContacts 
} from "react-icons/ti";

import { getUserData } from '../../functions/storageUtils';
import { UserData } from '../../interfaces/UserData';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return localStorage.getItem('theme') === 'dark' ? 'dark' : 'light';
  });
  const [userData, setUserData] = useState<UserData | null>(null);
  const [iconUser, setIconUser] = useState<string | null>(null);
  const [showReportMenu, setShowReportMenu] = useState(false);
  const [showExternalMenu, setShowExternalMenu] = useState(false);

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
    } else if (userData?.tipo === 'AUX. ADMINISTRATIVO') {
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
        <>
          <li><Link to="/RegulacaoMedicaInterna"><TiHeartHalfOutline className='Icon-Menu-Item' /><label className='textMenu-Item'>Regulação Médica Interna</label></Link></li>
          <li><Link to="/RegulacaoMedicaExterna"><TiHeartHalfOutline className='Icon-Menu-Item' /><label className='textMenu-Item'>Regulação Médica Externa</label></Link></li>
          <li><Link to="/RegulacoesAprovadas"><TiThumbsUp className='Icon-Menu-Item' /><label className='textMenu-Item'>Regulações Aprovadas</label></Link></li>
          <hr />
          <li><Link to="/Login"><TiExportOutline className='Icon-Menu-Item' /><label className='textMenu-Item'>Sair</label></Link></li>
        </>
      );
    }

    if (tipo === 'AUX. ADMINISTRATIVO') {
      return (
        <>
          <li><Link to="/NovaRegulacao"><TiBusinessCard className='Icon-Menu-Item' /><label className='textMenu-Item'>Nova Regulação</label></Link></li>
          <li><Link to="/ListaRegulacoes"><TiClipboard className='Icon-Menu-Item' /><label className='textMenu-Item'>Lista de Regulações</label></Link></li>
          <li><Link to="/RegulacoesAprovadas"><TiThumbsUp className='Icon-Menu-Item' /><label className='textMenu-Item'>Regulações Aprovadas</label></Link></li>
          <li><Link to="/RegulacoesNegadas"><TiThumbsDown className='Icon-Menu-Item' /><label className='textMenu-Item'>Regulações Negadas</label></Link></li>
          <li><Link to="/Desfechos"><TiHomeOutline className='Icon-Menu-Item' /><label className='textMenu-Item'>Gerar Desfecho</label></Link></li>
          <hr />
          <li>
            <a onClick={() => {
              setShowExternalMenu(true);
              setShowReportMenu(false);
            }}>
              <TiContacts className='Icon-Menu-Item' /><label className='textMenu-Item'>Solicitações de Origem Externa</label>
            </a>
          </li>
          <hr />
          <li><Link to="/ListaRegulacoes24"><TiClipboard className='Icon-Menu-Item' /><label className='textMenu-Item'>Regulações +24hrs</label></Link></li>
          <li><Link to="/Finalizadas"><TiClipboard className='Icon-Menu-Item' /><label className='textMenu-Item'>Regulações Finalizadas</label></Link></li>
          <hr />
          <li><Link to="/Login"><TiExportOutline className='Icon-Menu-Item' /><label className='textMenu-Item'>Sair</label></Link></li>
        </>
      );
    }

    if (tipo === 'GERENCIA') {
      return (
        <>
          <li><Link to="/NovaRegulacao"><TiBusinessCard className='Icon-Menu-Item' /><label className='textMenu-Item'>Nova Regulação</label></Link></li>
          <li><Link to="/ListaRegulacoes"><TiClipboard className='Icon-Menu-Item' /><label className='textMenu-Item'>Lista de Regulações</label></Link></li>
          <li><Link to="/RegulacoesAprovadas"><TiThumbsUp className='Icon-Menu-Item' /><label className='textMenu-Item'>Regulações Aprovadas</label></Link></li>
          <li><Link to="/RegulacoesNegadas"><TiThumbsDown className='Icon-Menu-Item' /><label className='textMenu-Item'>Regulações Negadas</label></Link></li>
          <li><Link to="/Desfechos"><TiHomeOutline className='Icon-Menu-Item' /><label className='textMenu-Item'>Gerar Desfecho</label></Link></li>
          <li>
            <a onClick={() => {
              setShowReportMenu(true);
              setShowExternalMenu(false);
            }}>
              <TiUpload className='Icon-Menu-Item' /><label className='textMenu-Item'>Relatórios</label>
            </a>
          </li>
          <hr />
          <li>
            <a onClick={() => {
              setShowExternalMenu(true);
              setShowReportMenu(false);
            }}>
              <TiContacts className='Icon-Menu-Item' /><label className='textMenu-Item'>Solicitações de Origem Externa</label>
            </a>
          </li>
          <hr />
          <li><Link to="/ListaRegulacoes24"><TiClipboard className='Icon-Menu-Item' /><label className='textMenu-Item'>Regulações +24hrs</label></Link></li>
          <li><Link to="/Finalizadas"><TiClipboard className='Icon-Menu-Item' /><label className='textMenu-Item'>Regulações Finalizadas</label></Link></li>
          <li><Link to="/RegulacaoMedicaInterna"><TiHeartHalfOutline className='Icon-Menu-Item' /><label className='textMenu-Item'>Regulação Médica Interna</label></Link></li>
          <li><Link to="/RegulacaoMedicaExterna"><TiHeartHalfOutline className='Icon-Menu-Item' /><label className='textMenu-Item'>Regulação Médica Externa</label></Link></li>
          <hr />
          <li><Link to="/Login"><TiExportOutline className='Icon-Menu-Item' /><label className='textMenu-Item'>Sair</label></Link></li>
        </>
      );
    }

    return null;
  };

  const renderReportMenuItems = () => {
    return (
      <>
        <li><a onClick={() => setShowReportMenu(false)}><TiArrowBack className='Icon-Menu-Item' /><label className='textMenu-Item'>Voltar</label></a></li>
        <li><Link to="/RelatoriosRegulacao"><TiUpload className='Icon-Menu-Item' /><label className='textMenu-Item'>EM DESENVOLVIMENTO</label></Link></li>
        <li><Link to="/RelatorioEfetivacao"><TiUpload className='Icon-Menu-Item' /><label className='textMenu-Item'>Relatório de Efetivação</label></Link></li>
        <li><Link to="/RelatorioTempoEfetivacao"><TiUpload className='Icon-Menu-Item' /><label className='textMenu-Item'>Relatório de Tempo de Efetivação</label></Link></li>
      </>
    );
  };

  const renderExternalMenuItems = () => {
    return (
      <>
        <li><a onClick={() => setShowExternalMenu(false)}><TiArrowBack className='Icon-Menu-Item' /><label className='textMenu-Item'>Voltar</label></a></li>
        <li><Link to="/RegulacaoExObstetrica"><TiUpload className='Icon-Menu-Item' /><label className='textMenu-Item'>Regulação Obstétrica</label></Link></li>
        <li><Link to="/RegulacaoExAVC"><TiUpload className='Icon-Menu-Item' /><label className='textMenu-Item'>Regulação AVC</label></Link></li>
        <li><Link to="/RegulacaoExNeurocirurgia"><TiUpload className='Icon-Menu-Item' /><label className='textMenu-Item'>Regulação Neurocirurgia</label></Link></li>
      </>
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
          {
            showReportMenu
              ? renderReportMenuItems()
              : showExternalMenu
                ? renderExternalMenuItems()
                : renderMenuItems()
          }
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
