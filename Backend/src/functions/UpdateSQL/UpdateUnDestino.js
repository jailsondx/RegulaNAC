async function UpdateUnDestino(id_regulacao, un_destino, connection) {
  const DBtable = "regulacao";

  try {
    const [updateResult] = await connection.query(
      `
      UPDATE ${DBtable}
      SET un_destino = ?
      WHERE id_regulacao = ?
      `,
      [un_destino, id_regulacao]
    );

    if (updateResult.affectedRows === 0) {
      console.error("❌ Nenhuma unidade destino foi atualizada.");
      return {
        success: false,
        message: "Nenhum registro foi atualizado. Verifique os critérios fornecidos.",
      };
    }

    console.log(`✅ Unidade destino atualizada para ${un_destino}`);
    return { success: true, message: "Unidade destino atualizada com sucesso." };
  } catch (err) {
    console.error("❌ Erro ao atualizar un_destino:", err);
    return { success: false, message: "Erro ao atualizar unidade destino.", error: err };
  }
}

export default UpdateUnDestino;
