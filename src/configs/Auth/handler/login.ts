import { AUTH_ROUTES } from '../service/routes';
import { NextApiRequest, NextApiResponse } from 'next';
import { toQueryParams } from '../utils/functions';
import { DefaultHandler } from '../interfaces';

export default function handleLogin({ baseConfig }: DefaultHandler) {
  const { issuer, clientId: client_id, redirectUri: redirect_uri, authorizationParams } = baseConfig;

  return async (req: NextApiRequest, res: NextApiResponse) => {
    const params = {
      ...authorizationParams,
      client_id,
      redirect_uri,
    };

    const authorizeUrl = `api/v1${AUTH_ROUTES.AUTHORIZE}${toQueryParams(params)}`;
    const baseURL = new URL(authorizeUrl, issuer).toString();

    res.redirect(baseURL);
  };
}
