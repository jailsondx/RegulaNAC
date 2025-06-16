import React, { useState, useEffect, ChangeEvent, FormEvent, useMemo } from 'react';
import axios from 'axios';
import { AxiosError } from 'axios';


/*IMPORT COMPONENTS*/
import DadosPaciente from '../Dados Paciente/DadosPaciente';

/*IMPORT INTERFACES*/
import { UserData } from '../../interfaces/UserData';
import { DadosPacienteData } from '../../interfaces/DadosPaciente';

/*IMPORT FUNCTIONS*/
import { getUserData } from '../../functions/storageUtils';

/*IMPORT CSS*/
import '../Modal/Modal-Inputs.css';

/*VARIÁVEIS DE AMBIENTE*/
const NODE_URL = import.meta.env.VITE_NODE_SERVER_URL;

interface Props {
    dadosPaciente: DadosPacienteData;
    onClose: () => void;
    showSnackbar: (message: string, severity: 'success' | 'error' | 'info' | 'warning') => void;
}

interface FaseOption {
    value: number;
    label: string;
}

const RetornarFase: React.FC<Props> = ({ dadosPaciente, onClose, showSnackbar }) => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [faseOptions, setFaseOptions] = useState<FaseOption[]>([]);
    const [selectedFaseValue, setselectedFaseValue] = useState<string>('');
    const StatusAtual = dadosPaciente.status_regulacao;

    // Carrega os dados do usuário do armazenamento local
    useEffect(() => {
        const data = getUserData();
        setUserData(data);
    }, []);

    // Carrega as opções de fase do JSON
    useEffect(() => {
        axios.get('/JSON/fases_regulacao.json')
            .then((res) => {
                setFaseOptions(res.data);
            })
            .catch(() => {
                showSnackbar('Erro ao carregar os dados dos Cancelamentos', 'error');
            });
    }, []);

    // Mapeamento de status para número
    const ValueStatus = useMemo(() => {
        switch (StatusAtual) {
            case 'ABERTO - AGUARDANDO AVALIACAO':
                return 1;
            case 'ABERTO - APROVADO - AGUARDANDO ORIGEM':
                return 2;
            case 'ABERTO - APROVADO - AGUARDANDO DESTINO':
                return 3;
            case 'ABERTO - APROVADO - AGUARDANDO ACIONAMENTO TRANSPORTE':
                return 4;
            case 'ABERTO - APROVADO - AGUARDANDO FINALIZACAO TRANSPORTE':
                return 5;
            case 'ABERTO - APROVADO - AGUARDANDO DESFECHO':
                return 6;
            // outros casos que precisar
            default:
                return 0; // valor grande para não bloquear nada, por exemplo
        }
    }, [StatusAtual]);

    //Filtrar faseOptions para mostrar só os que têm value < ValueStatus
    const filteredFaseOptions = useMemo(() => {
        return faseOptions.filter(fase => fase.value < ValueStatus);
    }, [faseOptions, ValueStatus]);


    const handleChange = (e: ChangeEvent<HTMLSelectElement>): void => {
        setselectedFaseValue(e.target.value);
    };

    const handleSubmit = async (e: FormEvent): Promise<void> => {
        e.preventDefault();

        if (!selectedFaseValue) {
            showSnackbar('Selecione uma fase antes de confirmar.', 'warning');
            return;
        }


        try {
            const dataToSubmit = {
                id_user: userData?.id_user,
                id_regulacao: dadosPaciente.id_regulacao,
                value_fase: Number(selectedFaseValue),
            };

            const response = await axios.post(`${NODE_URL}/api/internal/post/RetornarFase`, dataToSubmit);

            if (response.status === 200) {
                showSnackbar(response.data?.message || 'Fase retornada com sucesso.', 'success');
                onClose();
            } else {
                showSnackbar(response.data?.message || 'Erro ao retornar fase.', 'error');
            }
        } catch (error: unknown) {
            if (error instanceof AxiosError && error.response) {
                showSnackbar(error.response.data?.message || 'Erro na requisição.', 'error');
            } else {
                showSnackbar('Erro desconhecido. Verifique sua conexão.', 'error');
            }
        }
    };

    return (
        <>
            <div>
                <DadosPaciente dadosPaciente={dadosPaciente} />
            </div>

            <form onSubmit={handleSubmit}>
                <div className="modal-input-line">
                    <label>Selecione a fase a ser definida:</label>
                    <select value={selectedFaseValue} onChange={handleChange} required>
                        <option value="">-- Selecione uma fase --</option>
                        {filteredFaseOptions.map((fase) => (
                            <option key={fase.value} value={fase.value}>
                                {fase.label}
                            </option>
                        ))}
                    </select>

                </div>
                <button type="submit">Confirmar</button>
            </form>
        </>
    );
};

export default RetornarFase;
