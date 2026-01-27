import { useState, useEffect } from 'react';
import { URLs } from '../__data__/urls';

interface UseAdminRoleReturn {
  role: 'admin' | 'user' | null;
  isLoading: boolean;
  isAdmin: boolean;
}

export const useAdminRole = (): UseAdminRoleReturn => {
  const [role, setRole] = useState<'admin' | 'user' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      try {
        const response = await fetch(`${URLs.apiBase}/auth/admin/me`, {
          credentials: 'include'
        });
        if (!response.ok) {
          setRole('user');
          return;
        }
        const data = await response.json();
        if (data.role === 'admin') {
          setRole('admin');
        } else {
          setRole('user');
        }
      } catch (error) {
        console.error('Error checking role:', error);
        setRole('user');
      } finally {
        setIsLoading(false);
      }
    };

    checkRole();
  }, []);

  return {
    role,
    isLoading,
    isAdmin: role === 'admin'
  };
};
