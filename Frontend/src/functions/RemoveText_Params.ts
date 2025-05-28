export function removerText_Params(textRemoved: string, input: string): string {
    //const prefixo = "ABERTO - APROVADO - ";
    const prefixo = textRemoved;
    
    // Verifica se a string começa com o prefixo e o remove
    if (input.startsWith(prefixo)) {
      return input.slice(prefixo.length);
    }
    
    // Se não começar com o prefixo, retorna a string original
    return input;
  }
  