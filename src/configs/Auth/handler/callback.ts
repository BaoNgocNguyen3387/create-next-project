import { NextApiRequest, NextApiResponse } from 'next';
import { APIResponse } from '@/interfaces';
import { DefaultHandler, IToken } from '../interfaces';
import { getCookie, toQueryParams } from '../utils/functions';

// Don't need to send access token to client side instead we can store it in cookie
// and use Nextjs api route as a proxy to access it
export default function handleCallback({ baseConfig, getClient }: DefaultHandler) {
  const client = getClient();
  const { appUrl, cookieOptions } = baseConfig;

  return async (req: NextApiRequest, res: NextApiResponse) => {
    const { code, error, error_description } = req.query;

    let redirectUrl: string = appUrl;
    let query: string;

    if (error) {
      query = toQueryParams({
        error,
        error_description,
      });
      redirectUrl = new URL(`/callback${query}`, appUrl).toString();
    }

    if (code) {
      const params = {
        token: code as string,
        tokenType: 'access_token' as const,
      };

      const response: APIResponse<IToken> = await client.getToken(params);

      if (response.error) {
        query = toQueryParams({
          error: response.error,
        });
        redirectUrl = new URL(`/callback${query}`, appUrl).toString();
      } else {
        const rtCookie = getCookie('rt', cookieOptions, response?.data?.refresh_token);
        const atCookie = getCookie('at', cookieOptions, response?.data?.access_token);

        res.setHeader('set-cookie', [rtCookie, atCookie]);
        redirectUrl = new URL('/', appUrl).toString();
      }
    }

    res.redirect(redirectUrl);
  };
}
