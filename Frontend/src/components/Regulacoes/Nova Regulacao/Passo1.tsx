import { FaSearch } from 'react-icons/fa';
import { FcOk, FcLeave } from 'react-icons/fc';

/*IMPORT INTERFACES*/
import { NovaRegulacaoData } from '../../../interfaces/Regulacao';

interface Props {
    formData: NovaRegulacaoData;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleVerificaProntuarioAutoComplete: (pront: number) => void;
    handleAtualizarRegulacao: () => void;
    iconStatusProntOk: boolean;
    iconStatusProntDeny: boolean;
    showAtualizarButton: boolean;
}

export const Passo1 = ({
    formData,
    handleChange,
    handleVerificaProntuarioAutoComplete,
    handleAtualizarRegulacao,
    iconStatusProntOk,
    iconStatusProntDeny,
    showAtualizarButton,
}: Props) => {

    return (
        <div className="StepContent">

            <div className="StepContent">
                <div className="line-StepContent">
                    <label>Nome do Paciente:</label>
                    <input
                        type="text"
                        name="nome_paciente"
                        value={formData.nome_paciente}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="line-StepContent">
                    <label>Prontuário:</label>
                    <div className='div-AtualizarRegulacao'>
                        <span className='spanInput-line-StepContent'>
                            <input
                                type="number"
                                name="num_prontuario"
                                value={formData.num_prontuario ?? ''}
                                onChange={handleChange}
                                required
                            />
                            <button className='MicroButtonInput'
                                onClick={() => handleVerificaProntuarioAutoComplete(Number(formData.num_prontuario))}
                                title='Verifica Pré Cadastro'>
                                <FaSearch />
                            </button>
                            {iconStatusProntOk && (<FcOk className='Icon-Status-NovaRegulacao' title='Prontuário OK' />)} {iconStatusProntDeny && (<FcLeave className='Icon-Status-NovaRegulacao' title='Prontuário com Pendência' />)}
                            {showAtualizarButton && (
                                <button type="button" className='btn button-warning' onClick={handleAtualizarRegulacao}>
                                    Atualizar Regulação
                                </button>
                            )}
                        </span>
                    </div>
                </div>

                <div className='line-StepContent-2'>
                    <div className="line-StepContent-sub">
                        <label>Data Nascimento:</label>
                        <input
                            type="date"
                            name="data_nascimento"
                            value={formData.data_nascimento}
                            onChange={handleChange}
                            max="2199-12-31" // Restringe anos superiores a 2199
                            required
                        />
                    </div>

                    <div className="line-StepContent-sub">
                        <label>Idade:</label>
                        <input
                            type="number"
                            name="num_idade"
                            value={formData.num_idade ?? ''}
                            onChange={handleChange}
                            disabled
                            required
                        />
                    </div>
                </div>
            </div>

        </div>
    );
};
