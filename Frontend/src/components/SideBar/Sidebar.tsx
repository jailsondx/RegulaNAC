import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TiBusinessCard, TiClipboard, TiThumbsUp, TiHeartHalfOutline, TiHomeOutline, TiUpload  } from "react-icons/ti";
import { getUserData, UserData } from '../../functions/storageUtils';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return localStorage.getItem('theme') === 'dark' ? 'dark' : 'light';
  });
  const [userData, setUserData] = useState<UserData | null>(null);
  const [iconUser, setIconUser] = useState<string | null>(null);

  useEffect(() => {
    document.body.className = theme === 'dark' ? 'dark-theme' : 'light-theme';
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const dataUser = getUserData();
    setUserData(dataUser);
  }, []);

  // Usando useEffect para setar a imagem do usuário baseado no tipo
  useEffect(() => {
    if (userData?.tipo === 'MEDICO') {
      setIconUser('/IconsUser/icon-medico.jpg');
    } else if (userData?.tipo === 'REGULADOR') {
      setIconUser('/IconsUser/icon-regulador-2.jpg');
    } else if (userData?.tipo === 'GERENCIA') {
      setIconUser('/IconsUser/icon-regulador.jpg');
    } else {
      setIconUser('/IconsUser/icon-anonimous.png'); // Default ou outra imagem
    }
  }, [userData]); // Atualiza sempre que userData mudar

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };


  // Renderiza os itens do menu de acordo com o tipo de usuário
  const renderMenuItems = () => {
    if (!userData) return null;

    const { tipo } = userData;

    if (tipo === 'MEDICO') {
      return (
        <ul>
          <li> <Link to="/RegulacaoMedica"><TiHeartHalfOutline className='Icon-Menu-Item' /><label className='textMenu-Item'>Regulação Médica</label></Link> </li>
          <li> <Link to="/RegulacoesAprovadas"><TiThumbsUp className='Icon-Menu-Item' /><label className='textMenu-Item'>Regulações Aprovadas</label></Link> </li>
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
            <li><Link to="/Desfechos"><TiHomeOutline  className='Icon-Menu-Item' /><label className='textMenu-Item'>Desfechos</label></Link></li>
            <li><Link to="/RelatoriosRegulacao"><TiUpload  className='Icon-Menu-Item' /><label className='textMenu-Item'>Relatorios R</label></Link></li>
            <li><Link to="/RelatoriosGerencial"><TiUpload  className='Icon-Menu-Item' /><label className='textMenu-Item'>Relatorios G</label></Link></li>
            <hr/>
          </ul>
          <li><Link to="/ListaRegulacoes24"><TiClipboard className='Icon-Menu-Item' /><label className='textMenu-Item'>Regulações +24hrs</label></Link></li>
          <li><Link to="/Finalizadas"><TiClipboard className='Icon-Menu-Item' /><label className='textMenu-Item'>Regulações Finalizadas</label></Link></li>
        </>
      );
    }

    // Adicione uma nova condição para GERENCIA visualizar tudo
    if (tipo === 'GERENCIA') {
      return (
        <>
          <ul>
            <li><Link to="/NovaRegulacao"><TiBusinessCard className='Icon-Menu-Item' /><label className='textMenu-Item'>Nova Regulação</label></Link></li>
            <li><Link to="/ListaRegulacoes"><TiClipboard className='Icon-Menu-Item' /><label className='textMenu-Item'>Lista de Regulações</label></Link></li>
            <li><Link to="/RegulacoesAprovadas"><TiThumbsUp className='Icon-Menu-Item' /><label className='textMenu-Item'>Regulações Aprovadas</label></Link></li>
            <li><Link to="/Desfechos"><TiHomeOutline  className='Icon-Menu-Item' /><label className='textMenu-Item'>Desfechos</label></Link></li>
            <li><Link to="/RelatoriosRegulacao"><TiUpload  className='Icon-Menu-Item' /><label className='textMenu-Item'>Relatorios R</label></Link></li>
            <li><Link to="/RelatoriosGerencial"><TiUpload  className='Icon-Menu-Item' /><label className='textMenu-Item'>Relatorios G</label></Link></li>
            <hr/>
          </ul>
          <li><Link to="/ListaRegulacoes24"><TiClipboard className='Icon-Menu-Item' /><label className='textMenu-Item'>Regulações +24hrs</label></Link></li>
          <li> <Link to="/RegulacaoMedica"><TiHeartHalfOutline className='Icon-Menu-Item' /><label className='textMenu-Item'>Regulação Médica</label></Link> </li>
        </>
      );
    }

    return null; // Caso o tipo de usuário não seja reconhecido
  };

  return (
    <div className="sidebar">
      <div className="sidebar-sup">
        <label className='sidebar-Title'>RegulaNAC</label>
        <div className='inf-user'>
          <img className="IconUser" src={iconUser || '/IconsUser/default-icon.png'} alt="User Icon" />
          <p>
            <label className="sidebar-Username">{userData?.login}</label>
            <label className="sidebar-Username">{userData?.nome}</label>
          </p>
        </div>

        <ul>
          {renderMenuItems()}
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
