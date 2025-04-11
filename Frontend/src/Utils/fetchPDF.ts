import axios, { AxiosError } from 'axios';
import { getYear, getMonth, getDay } from '../functions/DateTimes.ts';

const NODE_URL = import.meta.env.VITE_NODE_SERVER_URL;

export const fetchPDF = async (
  datetime: string,
  filename: string,
  showSnackbar: (message: string, severity: 'success' | 'error' | 'info' | 'warning') => void
): Promise<void> => {
  const year = getYear(datetime);
  const month = getMonth(datetime);
  const day = getDay(datetime);

  try {
    const response = await axios.get(`${NODE_URL}/api/internal/upload/ViewPDF`, {
      params: { year, month, day, filename },
      responseType: 'blob',
    });

    const url = URL.createObjectURL(response.data);
    window.open(url, '_blank');
  } catch (error: unknown) {
    if (error instanceof AxiosError && error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 400:
          showSnackbar(data?.message || 'Parâmetros inválidos. Verifique os dados.', 'error');
          break;
        case 404:
          showSnackbar(data?.message || 'Arquivo PDF não encontrado.', 'error');
          break;
        case 500:
          showSnackbar(data?.message || 'Erro no servidor ao buscar o arquivo.', 'error');
          break;
        default:
          showSnackbar(data?.message || 'Erro desconhecido. Tente novamente.', 'error');
          break;
      }
    } else {
      showSnackbar('Erro na requisição. Tente novamente.', 'error');
    }
  }
};
