import { FC } from 'react';
import { useEffect } from 'react';

interface HomeProps {
  title: string;
}

const Home: FC<HomeProps> = ({ title }) => {

  //RECARREGA A PAGINA ASSIM QUE FOR RENDERIZADO
  useEffect(() => {
    if (!sessionStorage.getItem('pageReloaded')) {
      sessionStorage.setItem('pageReloaded', 'true');
      window.location.reload();
    }
  }, []);


  return (
    <div>
      <h1>{title}</h1>
    </div>
  );
};

export default Home;
