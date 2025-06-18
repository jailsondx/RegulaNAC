/*IMPORT INTERFACES*/
import { UserData } from "../interfaces/UserData";

export function getUserData(): UserData | null {
  try {
    const id_user = Number(sessionStorage.getItem('id_user'));
    const login = sessionStorage.getItem('login');
    const nome = sessionStorage.getItem('nome');
    const tipo = sessionStorage.getItem('tipo');
    const permissao = sessionStorage.getItem('permissao');

    if (id_user && nome &&login && tipo && permissao) {
      return { id_user, login, nome, tipo, permissao };
    }

    return null;
  } catch (error) {
    console.error('Erro ao acessar o sessionStorage:', error);
    return null;
  }
}

export function clearSessionStorage() {
  sessionStorage.removeItem("id_user");
  sessionStorage.removeItem("login");
  sessionStorage.removeItem("nome");
  sessionStorage.removeItem("tipo");
  sessionStorage.removeItem("permissao");
  sessionStorage.removeItem("pageReloaded");
  sessionStorage.removeItem("userViewer");
}
