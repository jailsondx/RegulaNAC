/*IMPORT INTERFACES*/
import { UserData } from "../interfaces/UserData";

export function getUserData(): UserData | null {
  try {
    const id_user = sessionStorage.getItem('id_user');
    const login = sessionStorage.getItem('login');
    const nome = sessionStorage.getItem('nome');
    const tipo = sessionStorage.getItem('tipo');

    if (id_user && nome &&login && tipo) {
      return { id_user, login, nome, tipo };
    }

    return null;
  } catch (error) {
    console.error('Erro ao acessar o sessionStorage:', error);
    return null;
  }
}
