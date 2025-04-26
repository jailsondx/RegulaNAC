// components/HeaderFiltro.js
import React from 'react';
import Filtro from '../Filtro/Filtro'; // ajuste o caminho conforme necessário

interface HeaderFiltroProps {
  title: string;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  vinculo: string;
  setVinculo: (value: string) => void;
  unidadeOrigem: string;
  setUnidadeOrigem: (value: string) => void;
  regulacoes: { vinculo: string; un_origem: string }[];
}

const HeaderFiltroExterno: React.FC<HeaderFiltroProps> = ({
  title,
  searchTerm,
  setSearchTerm,
  vinculo,
  setVinculo,
  unidadeOrigem,
  setUnidadeOrigem,
  regulacoes = []
}) => {
    
  const limparFiltros = () => {
    setUnidadeOrigem('');
    setVinculo('');
    setSearchTerm('');
  };

  const filtros = [
    {
      label: 'Vinculo',
      value: vinculo,
      options: [...new Set(regulacoes.map((r) => r.vinculo).filter(Boolean))],
      onChange: setVinculo,
    },
    {
      label: 'Origem',
      value: unidadeOrigem,
      options: [...new Set(regulacoes.map((r) => r.un_origem).filter(Boolean))],
      onChange: setUnidadeOrigem,
    },
  ];

  return (
    <div className="Header-ListaRegulaçoes">
      <label className="Title-Tabela">{title}</label>
      <div className="Filtro-Container">
        <div className="Filtro-Pesquisa">
          <label>Pesquisa</label>
          <input
            type="text"
            placeholder="Buscar por Nome, Prontuário ou Regulação"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="Search-Input"
          />
        </div>

        <Filtro filtros={filtros} onClear={limparFiltros} />
      </div>
    </div>
  );
};

export default HeaderFiltroExterno;
