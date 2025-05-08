import { DBconnection } from "../Controller/connection.js";

async function getAuditoriaByProntuario(num_prontuario) {
  const DBtable = "auditoria";

  try {
    const connection = await DBconnection.getConnection();

    const [rows] = await connection.query(
      `SELECT * FROM ${DBtable} WHERE num_prontuario = ?`,
      [num_prontuario]
    );

    connection.release();

    if (rows.length === 0) {
      return {
        success: false,
        message: "Nenhum registro de auditoria encontrado para esse prontuário.",
        data: []
      };
    }

    return {
      success: true,
      message: "Prontuario Encontrado.",
      data: rows
    };
  } catch (error) {
    console.error("Erro ao carregar auditoria:", error);
    return {
      success: false,
      message: "Erro ao carregar auditoria.",
      error
    };
  }
}


export { getAuditoriaByProntuario };
