import { NextApiRequest, NextApiResponse } from 'next';
import { DefaultHandler } from '../interfaces';
import handleRefreshToken from './refreshToken';

export default function handleGetSession({ getClient, baseConfig }: DefaultHandler) {
  const client = getClient();
  const errorMessage = { message: 'Invalid session', success: false };

  return async (req: NextApiRequest, res: NextApiResponse) => {
    const accessToken = req.cookies?.at;

    if (!accessToken) {
      res.status(401).json(errorMessage);
      return;
    }

    const params = {
      token: accessToken,
      tokenType: 'access_token' as const,
    };

    // Check if access token is valid
    const atCheckRes = await client.introspectToken(params);

    if (!atCheckRes?.data?.active) {
      return handleRefreshToken({ getClient, baseConfig })(req, res);
    }

    res.status(200).json({
      data: {
        access_token: accessToken,
      },
      success: true,
    });
  };
}
