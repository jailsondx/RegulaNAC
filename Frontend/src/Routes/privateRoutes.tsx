import React from 'react';
import { Navigate } from 'react-router-dom';
import { getUserData } from '../functions/storageUtils';

interface PrivateRouteProps {
  element: JSX.Element;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ element }) => {
  const userData = getUserData();
  const isAuthenticated = userData?.id_user;

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return element;
};

export default PrivateRoute;
