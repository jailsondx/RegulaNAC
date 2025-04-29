// arquivo: UpdateSQL/UpdateUnDestino.js
import { DBconnection } from "../Controller/connection.js";

async function UpdateUnDestino(id_regulacao, un_destino) {
  const DBtable = "regulacao";
  try {
    const connection = await DBconnection.getConnection();
    await connection.query(`
      UPDATE ${DBtable}
      SET un_destino = ?
      WHERE id_regulacao = ?
    `, [un_destino, id_regulacao]);
    console.log(`Unidade Destino atualizado para ${un_destino}`);
  } catch (err) {
    console.error('Erro ao atualizar un_destino:', err);
    throw err;
  }
}

export default UpdateUnDestino;
