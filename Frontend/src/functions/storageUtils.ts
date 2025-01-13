export interface UserData {
  id_user: string;
  nome: string;
  login: string;
  tipo: string;
}

/**
 * Função para obter os dados do usuário do sessionStorage
 * @returns {UserData | null} Dados do usuário ou null se não encontrados
 */
export function getUserData(): UserData | null {
  try {
    const id_user = sessionStorage.getItem('id_user');
    const login = sessionStorage.getItem('login');
    const nome = sessionStorage.getItem('nome');
    const tipo = sessionStorage.getItem('tipo');

    if (id_user && login && tipo) {
      return { id_user, login, nome, tipo };
    }

    return null;
  } catch (error) {
    console.error('Erro ao acessar o sessionStorage:', error);
    return null;
  }
}
