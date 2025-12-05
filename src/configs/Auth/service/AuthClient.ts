import axios, { AxiosResponse, AxiosInstance, AxiosError } from 'axios';
import { IToken, ITokenParams, BaseConfig } from '../interfaces';
import { APIResponse } from '@/interfaces';
import { AUTH_ROUTES } from './routes';

const errorCallback = (status: number, error: string) => {
  return { status, error };
};

export const AuthClient = (issuer?: string, baseConfig?: BaseConfig) => {
  const baseURL: string = issuer || '';

  const _getInstance = () => {
    const api: AxiosInstance = axios.create({
      baseURL: baseURL,
      timeout: 30000,
      headers: {
        Accept: 'application/json',
      },
    });

    api.interceptors.request.use(
      (config: any) => {
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    api.interceptors.response.use(
      (response: AxiosResponse) => {
        const data = response.data;

        if (data.success === false) {
          const message = typeof data?.message === 'string' ? data?.message : '';
          return { ...response.data, status: 400, error: message || 'Có lỗi trong quá trình thực thi' };
        }

        return response.data;
      },
      async (error: AxiosError) => {
        const resError = error.response;
        const dataError: any = resError?.data;

        return errorCallback(
          resError?.status,
          (resError && dataError?.message) || 'Có lỗi trong quá trình thực thi'
        );
      }
    );
    return api;
  };

  const getClient = () => {
    const api = _getInstance();
    const { clientId: client_id, redirectUri: redirect_uri, clientSecret, authorizationParams } = baseConfig;

    const clientAuthentication = Buffer.from(`${client_id}:${clientSecret}`, 'utf-8').toString('base64');
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${clientAuthentication}`,
    };

    const buildTokenParams = ({ token, tokenType }: ITokenParams) => {
      if (tokenType === 'access_token')
        return {
          client_id,
          redirect_uri,
          code: token,
          grant_type: 'authorization_code',
        };

      return {
        client_id,
        scope: authorizationParams?.scope,
        refresh_token: token,
        grant_type: 'refresh_token',
      };
    };

    return {
      getToken({ token, tokenType }: ITokenParams): Promise<APIResponse<IToken>> {
        const params = buildTokenParams({ tokenType, token });

        return api.post(`${AUTH_ROUTES.GET_TOKEN}`, params, {
          headers,
        });
      },

      revokeToken({ token, tokenType }: ITokenParams): Promise<{
        error?: string;
        status?: number;
        message: string;
      }> {
        const params = {
          token,
          token_type_hint: tokenType,
        };

        return api.post(`${AUTH_ROUTES.REVOKE_TOKEN}`, params, {
          headers,
        });
      },

      introspectToken({ token, tokenType }: ITokenParams): Promise<
        APIResponse<{
          active: boolean;
        }>
      > {
        const params = {
          token,
          token_type_hint: tokenType,
        };

        return api.post(`${AUTH_ROUTES.INTROSPECT_TOKEN}`, params, {
          headers,
        });
      },
    };
  };

  return {
    getClient,
  };
};

export default AuthClient;
