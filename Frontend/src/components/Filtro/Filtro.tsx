import React from 'react';
import './Filtro.css';

interface FiltroProps {
  filtros: {
    label: string;
    value: string;
    options: string[];
    onChange: (value: string) => void;
  }[];
  onClear?: () => void;
}

const Filtro: React.FC<FiltroProps> = ({ filtros, onClear }) => {
  return (
    <div className="FiltroContainer">
      {filtros.map((filtro, index) => (
        <div className="FiltroItemSelect" key={index}>
          <label>{filtro.label}</label>
          <select
            value={filtro.value}
            onChange={(e) => filtro.onChange(e.target.value)}
          >
            <option value="">Todos</option>
            {filtro.options.map((option, idx) => (
              <option key={idx} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      ))}
        {onClear && (
          <button type='button' className='btn button-clear' onClick={onClear}>
            Limpar
          </button>
        )}
      
      
    </div>
  );
};

export default Filtro;
