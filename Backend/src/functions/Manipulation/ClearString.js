// limparEspacos.js

/**
 * Remove espaços no início e no fim de um texto,
 * mas mantém os espaços entre as palavras.
 *
 * @param {string} texto - A string do texto a ser limpa
 * @returns {string} - A string sem espaços indesejados
 */
export function limparEspacos(texto) {
    if (typeof texto !== 'string') return texto;
    return texto.trim(); // remove só do início e fim
  }
  