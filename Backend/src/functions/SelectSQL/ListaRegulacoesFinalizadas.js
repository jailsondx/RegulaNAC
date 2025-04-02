import { DBconnection } from "../Controller/connection.js";

async function ListaRegulacoesFinalizadas() {
    const DBtable = "regulacao";
    const DBtableRegulacaoMedico = "regulacao_medico";
    const DBtableDesfecho = "desfecho";
    const DBtableUsuarios = "usuarios";

    try {
        // Inicie a conexão com o banco de dados
        const connection = await DBconnection.getConnection();

        // Execute a query para selecionar os registros da tabela regulacao
        const [rows] = await connection.query(`
            SELECT 
                r.id_regulacao, 
                r.nome_regulador_nac, 
                r.num_prontuario, 
                r.nome_paciente, 
                r.num_regulacao, 
                r.un_origem, 
                r.un_destino,
                r.link, 
                rm.nome_regulador_medico
            FROM ${DBtable} r
            JOIN ${DBtableRegulacaoMedico} rm ON r.id_regulacao = rm.id_regulacao
            WHERE r.status_regulacao LIKE ?
        `, ["FECHADO"]);

        // Adicione os desfechos relacionados
        const idsRegulacao = rows.map((row) => row.id_regulacao);

        if (idsRegulacao.length > 0) {
            // Busque os desfechos para os IDs de regulacao obtidos
            const [desfechos] = await connection.query(`
                SELECT id_regulacao, id_user, desfecho 
                FROM ${DBtableDesfecho}
                WHERE id_regulacao IN (?)
            `, [idsRegulacao]);

            // Mapeie os desfechos aos registros correspondentes
            rows.forEach((row) => {
                const desfechoRelacionado = desfechos.find((d) => d.id_regulacao === row.id_regulacao);
                row.desfecho = desfechoRelacionado ? desfechoRelacionado.desfecho : null; // Adicione o desfecho ou null
            });

            // Obtenha os IDs de usuários dos desfechos
            const idsUsuarios = desfechos.map((desfecho) => desfecho.id_user);

            if (idsUsuarios.length > 0) {
                // Busque os nomes dos usuários usando os IDs de usuários obtidos
                const [reguladorFinal] = await connection.query(`
                    SELECT id_user, nome 
                    FROM ${DBtableUsuarios}
                    WHERE id_user IN (?)
                `, [idsUsuarios]);

                // Mapeie os nomes dos usuários aos desfechos correspondentes
                desfechos.forEach((desfecho) => {
                    const usuarioRelacionado = reguladorFinal.find((usuario) => usuario.id_user === desfecho.id_user);
                    desfecho.regulador_final = usuarioRelacionado ? usuarioRelacionado.nome : null; // Adicione o nome do usuário ou null
                });

                // Adicione os desfechos e nomes de usuários aos registros correspondentes
                rows.forEach((row) => {
                    const desfechoRelacionado = desfechos.find((d) => d.id_regulacao === row.id_regulacao);
                    row.desfecho = desfechoRelacionado ? desfechoRelacionado.desfecho : null; // Adicione o desfecho ou null
                    row.regulador_final = desfechoRelacionado ? desfechoRelacionado.regulador_final : null; // Adicione o nome do usuário ou null
                });
            }
        }

        connection.release(); // Libera a conexão

        return { success: true, data: rows };

    } catch (error) {
        // Tratamento de erro
        console.error("Erro ao carregar regulações:", error);
        return { success: false, message: "Erro ao carregar regulações.", error };
    }
}

export default ListaRegulacoesFinalizadas;
