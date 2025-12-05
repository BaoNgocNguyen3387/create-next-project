import { NextApiRequest, NextApiResponse } from 'next';
import { DefaultHandler } from '../interfaces';
import { getCookie } from '../utils/functions';

export default function handleRefreshToken({ getClient, baseConfig }: DefaultHandler) {
  const { cookieOptions } = baseConfig;
  const client = getClient();

  return async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed', success: false });

    const refreshToken = req.cookies?.rt;
    if (!refreshToken) return res.status(401).json({ message: 'Missing refresh token', success: false });

    const params = {
      token: refreshToken,
      tokenType: 'refresh_token' as const,
    };

    const response = await client.getToken(params);

    if (response?.error) res.status(response.status).json(response);
    if (response?.data) {
      // Set new tokens in cookie
      const rtCookie = getCookie('rt', cookieOptions, response?.data?.refresh_token);
      const atCookie = getCookie('at', cookieOptions, response?.data?.access_token);

      res.setHeader('Set-Cookie', [rtCookie, atCookie]);
      res.status(200).json({
        data: {
          access_token: response?.data?.access_token,
          id_token: response?.data?.id_token,
        },
        success: true,
      });
    }
  };
}
