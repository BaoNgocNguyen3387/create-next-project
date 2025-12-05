export const getConfig = () => {
  const baseConfig = {
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
    clientSecret: process.env.OIDC_CLIENT_SECRET,
    clientId: process.env.OIDC_CLIENT_ID,
    issuer: process.env.NEXT_PUBLIC_OIDC_ISSUER,
    redirectUri: process.env.OIDC_REDIRECT_URI,
    redirectUriLogout: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/login`,
    authorizationParams: {
      response_type: 'code',
      response_mode: 'query',
      scope: 'openid offline_access',
    },
    cookieOptions: {
      secure: true,
      sameSite: 'strict',
      path: '/',
      httpOnly: true,
    },
  };
  return baseConfig;
};
