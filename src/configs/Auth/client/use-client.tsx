import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { toQueryParams } from '../utils/functions';
import { useRouter } from 'next/router';
import { ErrorFallback } from './components/ErrorFallback';
import { Spin } from '@/UI';
import { useQuery } from '@tanstack/react-query';
import { GET_ME_INFO_API, getUserInfo } from '@/services/Gchat.service';
import { APIResponse } from '@/interfaces';
import { IUserInfo } from '../interfaces';
import Author from '@/components/auth/Author';
import axios from 'axios';

interface Props {
  children: React.ReactNode;
}

interface IAuthContext {
  handleLogOut: () => void;
  userInfo: IUserInfo;
}

const AuthContext = createContext<IAuthContext | null>(null);

const UserProvider: React.FC<Props> = ({ children }) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>();
  const { error, error_description } = router.query;

  useEffect(() => {
    const handleGetSession = async () => {
      try {
        const res = await axios('/api/auth/session');
        const { access_token } = res.data.data;

        localStorage.setItem('token', access_token);
        setIsAuthenticated(true);
      } catch (e) {
        window.location.href = '/api/auth/login';
        return;
      }
    };

    if (window.location.pathname === '/callback') {
      setIsAuthenticated(false);
      return;
    }
    handleGetSession();
  }, []);

  const { data: userInfo } = useQuery(
    [GET_ME_INFO_API],
    async () => {
      const res: APIResponse<IUserInfo> = await getUserInfo();
      if (res?.error) {
        return {};
      }
      return res?.data;
    },
    {
      staleTime: Infinity,
      enabled: Boolean(isAuthenticated),
    }
  );

  const handleLogOut = () => {
    if (typeof window === 'undefined') return;

    const access_token = localStorage.getItem('token');
    const id_token = localStorage.getItem('id_token');

    const params = toQueryParams({
      access_token,
      id_token,
    });

    window.location.href = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/logout${params}`;
  };

  const authContextValue = useMemo(() => {
    return {
      handleLogOut,
      userInfo,
    };
  }, [userInfo]);

  if (typeof isAuthenticated === 'undefined')
    return (
      <div className="flex h-screen items-center justify-center">
        <Spin />
      </div>
    );

  if (error) return <ErrorFallback error={error} error_description={error_description} />;

  return (
    <AuthContext.Provider value={authContextValue}>
      <Author renderContent={children} />
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default UserProvider;
