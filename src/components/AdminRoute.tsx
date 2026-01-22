import React from 'react';
import { Navigate } from 'react-router-dom';
import { Center, Spinner } from '@chakra-ui/react';
import { useAdminRole } from '../hooks';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAdmin, isLoading } = useAdminRole();

  if (isLoading) {
    return (
      <Center minH="100vh">
        <Spinner />
      </Center>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/workspace-finder/admin/login" replace />;
  }

  return <>{children}</>;
};
