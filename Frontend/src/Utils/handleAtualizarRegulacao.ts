import { NavigateFunction } from 'react-router-dom';
import { RegulacaoData } from '../interfaces/Regulacao';

export function atualizarRegulacao(
  regulacao: RegulacaoData, 
  navigate: NavigateFunction, 
  showSnackbar: (message: string, severity: 'success' | 'error' | 'info' | 'warning') => void
): void {
  if (!regulacao.num_prontuario) {
    showSnackbar('Prontuário é obrigatório para atualizar a regulação', 'warning');
    return;
  }
  
  navigate('/AtualizaRegulacao', {
    state: { num_prontuario: regulacao.num_prontuario },
  });
}
