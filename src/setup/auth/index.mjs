const authOptions = `
export const getConfig = () => {
    const baseConfig = {
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
      clientSecret: process.env.OIDC_CLIENT_SECRET,
      clientId: process.env.OIDC_CLIENT_ID,
      issuer: process.env.NEXT_PUBLIC_OIDC_ISSUER,
      redirectUri: process.env.OIDC_REDIRECT_URI,
      redirectUriLogout: \`\${process.env.NEXT_PUBLIC_APP_URL}/api/auth/login\`,
      authorizationParams: {
        response_type: 'code',
        response_mode: 'query',
        scope: 'openid offline_access',
      },
      cookieOptions: {
        secure: true,
        sameSite: 'none',
        path: '/',
        httpOnly: true,
      },
    };
    return baseConfig;
  };
`;

const authDefaultEnv = ` 
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_OIDC_ISSUER=https://auth.ghtklab.com
NEXT_PUBLIC_OIDC_AUTH_URL=https://id.ghtklab.com
OIDC_REDIRECT_URI=http://localhost:3000/api/auth/callback
OIDC_CLIENT_ID=
OIDC_CLIENT_SECRET=

NEXT_PUBLIC_GCHAT_API_URL=https://chat.ghtklab.com
`;

export { authOptions, authDefaultEnv };
