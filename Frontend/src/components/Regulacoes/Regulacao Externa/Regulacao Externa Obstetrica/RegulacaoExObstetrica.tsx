import React, { useState } from 'react';
import RegulacaoExObsVinculada from './Vinculada/RegulacaoExObstetricaVinculada';

const RegulacaoExObstetrica: React.FC = () => {
  const [componenteVisivel, setComponenteVisivel] = useState<'nenhum' | 'vinculada' | 'cresus'>('nenhum');

  const handleCRESUS = () => {
    setComponenteVisivel('cresus');
  };

  const handleVinculada = () => {
    setComponenteVisivel('vinculada');
  };

  return (
    <>
      <div>
        <label className='Title-Form'>Nova Regulação Obstétrica</label>
      </div>

      <div className="ComponentForm">
        {componenteVisivel === 'nenhum' && (
          <div className="Form-NovaRegulacao-home">
            <button type="button" onClick={handleCRESUS}>CRESUS</button>
            <button type="button" onClick={handleVinculada}>VINCULADA</button>
          </div>
        )}
        {/* Renderiza os componentes conforme o botão clicado */}
        {componenteVisivel === 'vinculada' && <RegulacaoExObsVinculada />}
        {componenteVisivel === 'cresus' && (
          <div>
            {/* Substituir futuramente por um componente real */}
            <p>Componente CRESUS aqui...</p>
          </div>
        )}
      </div>
    </>
  );
};

export default RegulacaoExObstetrica;
