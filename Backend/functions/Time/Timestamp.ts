function getCurrentTimestamp() {
  const now = new Date();

  // Formatar para o formato MySQL (YYYY-MM-DD HH:mm:ss)
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Mês (0-indexado)
  const day = String(now.getDate()).padStart(2, '0'); // Dia
  const hours = String(now.getHours()).padStart(2, '0'); // Horas
  const minutes = String(now.getMinutes()).padStart(2, '0'); // Minutos
  const seconds = String(now.getSeconds()).padStart(2, '0'); // Segundos

  // Retorna no formato MySQL
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

module.exports = { getCurrentTimestamp };
