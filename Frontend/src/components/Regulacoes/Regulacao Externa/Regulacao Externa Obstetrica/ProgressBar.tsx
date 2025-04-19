import { TiBookmark } from "react-icons/ti";

interface Props {
  currentStep: number;
}

export const ProgressBar = ({ currentStep }: Props) => {
  const steps = ['Paciente', 'Regulação', 'Confirmação'];

  return (
    <div className="Steps">
      {steps.map((label, index) => (
        <div key={label} className={`Step ${currentStep === index + 1 ? 'active' : ''}`}>
          <TiBookmark />{label}
        </div>
      ))}
    </div>
  );
};
