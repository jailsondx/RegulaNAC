import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  return (
    <div className="sidebar">
      <h2>Menu</h2>
      <ul>
        <li><Link to="/NovaRegulacao">Nova regulação</Link></li>
        <li><Link to="/Regulacoes">Lista Regulações</Link></li>
        <li><Link to="/RegulacaoMedica">Regulação Médica</Link></li>
        <li><Link to="/help">Ajuda</Link></li>
      </ul>
    </div>
  );
};

export default Sidebar;
