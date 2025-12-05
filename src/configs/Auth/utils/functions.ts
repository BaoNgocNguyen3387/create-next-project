import { BaseConfig } from '../interfaces';

export const genRandomString = (length: number): string => {
  const randomCharset = 'abcdefghijklnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let random = '';
  for (let c = 0, cl = randomCharset.length; c < length; ++c) {
    random += randomCharset[Math.floor(Math.random() * cl)];
  }
  return random;
};

export const toQueryParams = (obj: object): string => {
  const str = [];
  if (obj !== null) {
    for (const key in obj) {
      if (obj[key] !== undefined && obj[key] !== null) {
        str.push(`${key}=${encodeURIComponent(obj[key])}`);
      }
    }
  }
  if (str.length === 0) return '';
  return `?${str.join('&')}`;
};

export const openPopupWindow = (
  url: string,
  windowName: string,
  win: Window,
  w: number = 500,
  h: number = 700
): Window => {
  const y = win.outerHeight / 2 + win.screenY - h / 2;
  const x = win.outerWidth / 2 + win.screenX - w / 2;
  return win.open(
    url,
    windowName,
    `width=${w}, 
      height=${h}, 
      top=${y}, 
      left=${x}`
  );
};

export const getCookie = (name: string, options: BaseConfig['cookieOptions'], value?: string) => {
  const config = Object.entries(options).reduce((acc, [key, value]) => {
    if (typeof value === 'string') return `${acc}${key}=${value}; `;
    if (typeof value === 'boolean' && value) return `${acc}${key}; `;
    return acc;
  }, '');

  return value ? `${name}=${value}; ${config}` : `${name}=deleted; Max-Age=0; ${config}`;
};
