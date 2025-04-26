// components/HeaderFiltro.js
import React from 'react';
import Filtro from '../Filtro/Filtro'; // ajuste o caminho conforme necessário

interface HeaderFiltroProps {
  title: string;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  unidadeDestino: string;
  setUnidadeDestino: (value: string) => void;
  unidadeOrigem: string;
  setUnidadeOrigem: (value: string) => void;
  regulacoes: { un_origem: string, un_destino: string; }[];
}

const HeaderFiltroInterno: React.FC<HeaderFiltroProps> = ({
  title,
  searchTerm,
  setSearchTerm,
  unidadeDestino,
  setUnidadeDestino,
  unidadeOrigem,
  setUnidadeOrigem,
  regulacoes = []
}) => {
    
  const limparFiltros = () => {
    setUnidadeOrigem('');
    setUnidadeDestino('');
    setSearchTerm('');
  };

  const filtros = [
    {
      label: 'Origem',
      value: unidadeOrigem,
      options: [...new Set(regulacoes.map((r) => r.un_origem).filter(Boolean))],
      onChange: setUnidadeOrigem,
    },
    {

      label: 'Destino',
      value: unidadeDestino,
      options: [...new Set(regulacoes.map((r) => r.un_destino).filter(Boolean))],
      onChange: setUnidadeDestino,
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

export default HeaderFiltroInterno;
