/* eslint-disable no-unused-vars */
import { APIResponse } from '@/interfaces';
import { NextApiRequest, NextApiResponse } from 'next';

export interface BaseConfig {
  appUrl: string;
  clientSecret: string;
  clientId: string;
  issuer: string;
  redirectUri: string;
  redirectUriLogout: string;
  authorizationParams: {
    response_type: string;
    scope: string;
  };
  cookieOptions: {
    secure: boolean;
    sameSite: string;
    path: string;
    httpOnly: boolean;
  };
}

export type AuthInstance = {
  handleAuth: (req: NextApiRequest, res: NextApiResponse) => Promise<NextApiResponse<any>>;
};

export interface IToken {
  access_token: string;
  expires_in: number;
  id_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
}

export interface ITokenParams {
  token?: string;
  tokenType: 'access_token' | 'refresh_token';
}

export interface ILogOutParams {
  access_token: string;
  id_token: string;
  redirect_uri: string;
}

export interface AuthClient {
  getToken({ token, tokenType }: ITokenParams): Promise<APIResponse<IToken>>;
  revokeToken({ token, tokenType }: ITokenParams): Promise<{
    error?: string;
    status?: number;
    message: string;
  }>;
  introspectToken({ token, tokenType }: ITokenParams): Promise<
    APIResponse<{
      active: boolean;
    }>
  >;
}

export interface DefaultHandler {
  baseConfig: BaseConfig;
  getClient?: () => AuthClient;
}

export interface IUserInfo {
  avatar?: string;
  duty?: string;
  email?: string;
  floor?: string;
  fullname?: string;
  group_id?: number;
  id?: string;
  position_job?: number;
  position_name?: string;
  province_id?: number;
  province_name?: string;
  station_id?: number;
  station_name?: string;
  status_id?: number;
  tel?: string;
  user_id?: string;
  user_key?: string;
  user_type?: string;
  username?: string;
}
