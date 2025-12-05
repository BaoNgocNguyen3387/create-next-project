import { AUTH_ROUTES } from '../service/routes';
import { NextApiRequest, NextApiResponse } from 'next';
import { getCookie, toQueryParams } from '../utils/functions';
import { DefaultHandler } from '../interfaces';

export default function handleLogout({ baseConfig, getClient }: DefaultHandler) {
  const { issuer, redirectUriLogout, cookieOptions } = baseConfig;
  const client = getClient();

  return async (req: NextApiRequest, res: NextApiResponse) => {
    const { access_token, id_token } = req.query;
    const rt = req.cookies?.rt;

    // Revoke tokens before logout
    const revokeQueue = [
      client.revokeToken({ token: access_token as string, tokenType: 'access_token' as const }),
    ];

    if (rt) revokeQueue.push(client.revokeToken({ token: rt, tokenType: 'refresh_token' as const }));
    Promise.all(revokeQueue);

    const params = {
      access_token_hint: access_token,
      id_token_hint: id_token,
      redirect_uri: redirectUriLogout,
    };

    const authorizeUrl = `api/v1${AUTH_ROUTES.LOGOUT}${toQueryParams(params)}`;
    const baseURL = new URL(authorizeUrl, issuer).toString();

    const rtCookie = getCookie('rt', cookieOptions);
    const atCookie = getCookie('at', cookieOptions);
    res.setHeader('set-cookie', [rtCookie, atCookie]);

    res.redirect(baseURL);
  };
}
