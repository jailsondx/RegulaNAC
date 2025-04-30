import { DBconnection } from "../Controller/connection.js";

async function ApagarRegulacao(idUser, idRegulacao) {
  const DBtable = "regulacao";
  const DBtableUsuarios = "usuarios";

  try {
    const connection = await DBconnection.getConnection();

    // Verifica se o usuário existe e qual seu tipo
    const [rowsUser] = await connection.query(
      `SELECT tipo FROM ${DBtableUsuarios} WHERE id_user = ?`,
      [idUser]
    );

    if (rowsUser.length === 0) {
      console.error("Usuário não encontrado: ID:", idUser);
      connection.release();
      return { success: false, message: "Usuário não encontrado." };
    }

    const userType = rowsUser[0].tipo;

    // Somente GERENCIA pode apagar
    if (userType !== "GERENCIA") {
      console.warn(`Usuário sem permissão: ID ${idUser}, tipo ${userType}`);
      connection.release();
      return {
        success: false,
        message: "Usuário não tem permissão para apagar regulações.",
      };
    }

    // Apaga da tabela regulacao (os registros dependentes em regulacao_medico serão apagados automaticamente)
    const [deleteResult] = await connection.query(
        `DELETE FROM ${DBtable} WHERE id_regulacao = ?`,
        [idRegulacao]
      );
  
      connection.release();
  
      // Verifica se houve exclusão
      if (deleteResult.affectedRows === 0) {
        // Se affectedRows é 0, significa que o id_regulacao não foi encontrado, mas não houve erro
        console.warn("Nenhuma regulação encontrada para exclusão com id_regulacao:", idRegulacao);
        return { success: false, message: "Regulação não encontrada para exclusão." };
      }
  
      // Se affectedRows for maior que 0, a exclusão foi bem-sucedida
      return { success: true, message: "Regulação apagada com sucesso." };
    } catch (error) {
      console.error("Erro ao apagar regulação:", error);
      return { success: false, message: "Erro interno ao apagar regulação.", error };
    }
  }
export default ApagarRegulacao;
