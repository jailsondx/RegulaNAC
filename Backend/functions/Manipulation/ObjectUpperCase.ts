function convertObjectToUpperCase(obj) {
    const uppercasedData = {};
  
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        // Verifica se o valor é uma string e converte para maiúsculas
        uppercasedData[key] = typeof obj[key] === 'string' ? obj[key].toUpperCase() : obj[key];
      }
    }
  
    return uppercasedData;
  }
  
  module.exports = { convertObjectToUpperCase };
  