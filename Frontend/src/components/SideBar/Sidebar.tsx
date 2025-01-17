import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserData, UserData } from '../../functions/storageUtils';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return localStorage.getItem('theme') === 'dark' ? 'dark' : 'light';
  });
  const [userData, setUserData] = useState<UserData | null>(null);
  const [iconUser, setIconUser] = useState<string | null>(null);

  // Estado para gerenciar o submenu
  const [submenuOpen, setSubmenuOpen] = useState(false);

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
    if (userData?.tipo === 'Medico') {
      setIconUser('/IconsUser/icon-medico.jpg');
    } else if (userData?.tipo === 'Regulador') {
      setIconUser('/IconsUser/icon-regulador-2.jpg');
    } else if (userData?.tipo === 'Gerencia') {
      setIconUser('/IconsUser/icon-regulador.jpg');
    } else {
      setIconUser('/IconsUser/icon-anonimous.png'); // Default ou outra imagem
    }
  }, [userData]); // Atualiza sempre que userData mudar

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Alternar submenu
  const toggleSubmenu = () => {
    setSubmenuOpen((prevState) => !prevState);
  };

  // Renderiza os itens do menu de acordo com o tipo de usuário
  const renderMenuItems = () => {
    if (!userData) return null;

    const { tipo } = userData;

    if (tipo === 'Medico') {
      return (
        <ul>
          <li><Link to="/RegulacoesAprovadas">Regulações Aprovadas</Link></li>
          <li><Link to="/RegulacaoMedica">Regulação Médica</Link></li>
        </ul>


      );
    }

    if (tipo === 'Regulador') {
      return (
        <>
          <li>
            <span className="submenu-toggle" onClick={toggleSubmenu}>
              Regulações {submenuOpen ? '▲' : '▼'}
            </span>
            {submenuOpen && (
              <ul className="submenu">
                <li><Link to="/NovaRegulacao">Nova Regulação</Link></li>
                <li><Link to="/Regulacoes">Lista Regulações</Link></li>
                <li><Link to="/RegulacoesAprovadas">Regulações Aprovadas</Link></li>
                <li><Link to="/Desfecho">Desfecho</Link></li>
              </ul>
            )}
          </li>
        </>
      );
    }

    // Adicione uma nova condição para GERENCIA visualizar tudo
    if (tipo === 'Gerencia') {
      return (
        <>
          <li>
            <span className="submenu-toggle" onClick={toggleSubmenu}>
              Regulações {submenuOpen ? '▲' : '▼'}
            </span>
            {submenuOpen && (
              <ul className="submenu">
                <li><Link to="/NovaRegulacao">Nova Regulação</Link></li>
                <li><Link to="/Regulacoes">Lista Regulações</Link></li>
                <li><Link to="/RegulacoesAprovadas">Regulações Aprovadas</Link></li>
                <li><Link to="/Desfecho">Desfecho</Link></li>
              </ul>
            )}
          </li>
          <li>
            <Link to="/RegulacaoMedica">Regulação Médica</Link>
          </li>
        </>
      );
    }

    return null; // Caso o tipo de usuário não seja reconhecido
  };

  return (
    <div className="sidebar">
      <div className="sidebar-sup">
        <h2>RegulaNAC</h2>
        <div className='inf-user'>
          <img className="IconUser" src={iconUser || '/IconsUser/default-icon.png'} alt="User Icon" />
          <p><label className="sidebar-Username">{userData?.login.toUpperCase()}</label></p>
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
