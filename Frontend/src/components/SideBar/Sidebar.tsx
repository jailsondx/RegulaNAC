import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSun, FaRegMoon } from "react-icons/fa";
import { getUserData, UserData } from '../../functions/storageUtils';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return localStorage.getItem('theme') === 'dark' ? 'dark' : 'light';
  });
  const [userData, setUserData] = useState<UserData | null>(null);

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

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Alternar submenu
  const toggleSubmenu = () => {
    setSubmenuOpen((prevState) => !prevState);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-sup">
        <h2>RegulaNAC</h2>
        <img className="IconUser" src="/IconsUser/icon-anonimous.png" alt="User Icon" />
        <label className="sidebar-Username">{userData?.login.toUpperCase()}</label>
        <ul>
          <li>
            <span className="submenu-toggle" onClick={toggleSubmenu}>
              Regulações {submenuOpen ? '▲' : '▼'}
            </span>
            {submenuOpen && (
              <ul className="submenu">
                <li><Link to="/NovaRegulacao">Nova Regulação</Link></li>
                <li><Link to="/Regulacoes">Lista Regulações</Link></li>
                <li><Link to="/RegulacoesAprovadas">Regulações Aprovadas</Link></li>
                <li><Link to="/RegulacoesAprovadas">Desfecho</Link></li>
              </ul>
            )}
          </li>
          <li><Link to="/RegulacaoMedica">Regulação Médica</Link></li>
        </ul>
      </div>

      <div className="sidebar-inf">
        <div className={`slider ${theme}`} onClick={toggleTheme}>
          <div className="slider__ball"></div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
