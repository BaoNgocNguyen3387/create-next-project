/* eslint-disable no-unused-vars */
import { handleLogin, handleCallback, handleLogout, handleRefreshToken, handlerBuilder } from './handler';
import { getConfig } from './config';
import AuthClient from './service/AuthClient';
import { AuthInstance } from './interfaces';
import handleGetSession from './handler/getSession';

let instance: AuthInstance;

function getInstance() {
  if (instance) return instance;
  instance = _initAuth();
  return instance;
}

function _initAuth() {
  const baseConfig = getConfig();
  const { getClient } = AuthClient(`${baseConfig.issuer}/api/v1`, baseConfig);
  const defaultParams = { baseConfig, getClient };

  const handleAuth = handlerBuilder({
    handleLogin: handleLogin(defaultParams),
    handleCallback: handleCallback(defaultParams),
    handleLogout: handleLogout(defaultParams),
    handleRefreshToken: handleRefreshToken(defaultParams),
    handleGetSession: handleGetSession(defaultParams),
  });

  return {
    handleAuth,
  };
}

export const handleAuth = () => getInstance().handleAuth;
