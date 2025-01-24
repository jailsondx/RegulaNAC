   // Função para garantir que o texto seja inserido em maiúsculas
   export const handleUpperCaseChange = (setter: React.Dispatch<React.SetStateAction<string>>) => {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setter(e.target.value.toUpperCase()); // Aplica o toUpperCase
    };
  };