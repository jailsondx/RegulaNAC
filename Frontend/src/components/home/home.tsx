import { FC } from 'react';

interface HomeProps {
  title: string;
}

const Home: FC<HomeProps> = ({ title }) => {
  return (
    <div>
      <h1>{title}</h1>
    </div>
  );
};

export default Home;
