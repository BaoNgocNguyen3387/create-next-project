/* eslint-disable max-lines */
const themeColor = `
import { IColor } from './themeConfig';

export const LIGHT: IColor = {
  display: 'light',

  text: 'hsl(0, 0%, 0%)',

  background: 'hsl(0, 0%, 100%)',
  'background-dark': 'hsl(209, 100%, 8%)',
  'background-overlay': 'hsl(0, 0%, 95%)',

  primary: 'hsl(215, 100%, 54%)',
  'primary-light': 'hsl(215, 100%, 60%)',
  'primary-lighter': 'hsl(215, 100%, 68%)',
  'primary-lightest': 'hsl(215, 100%, 74%)',

  'gray-50': 'hsl(0, 0%, 95%)',
  'gray-100': 'hsl(0, 0%, 90%)',
  'gray-200': 'hsl(0, 0%, 80%)',
  'gray-300': 'hsl(0, 0%, 70%)',
  'gray-400': 'hsl(0, 0%, 60%)',
  'gray-500': 'hsl(0, 0%, 50%)',
  'gray-600': 'hsl(0, 0%, 40%)',
  'gray-700': 'hsl(0, 0%, 30%)',
  'gray-800': 'hsl(0, 0%, 20%)',
  'gray-900': 'hsl(0, 0%, 10%)',

  'blue-50': 'hsl(227, 84%, 95%)',
  'blue-100': 'hsl(227, 100%, 90%)',
  'blue-400': 'hsl(227, 84%, 50%)',
  'blue-500': 'hsl(227, 84%, 40%)',
  'blue-600': 'hsl(227, 84%, 30%)',

  'green-200': 'hsl(141, 70%, 85%)',
  'green-500': 'hsl(141, 70%, 45%)',
  'green-600': 'hsl(141, 70%, 35%)',

  'red-500': 'hsl(0, 84%, 50%)',
  'red-600': 'hsl(0, 84%, 60%)',
  'red-700': 'hsl(0, 84%, 70%)',

  'cyan-50': 'hsl(188, 86%, 85%)',
  'cyan-400': 'hsl(188, 86%, 60%)',
  'cyan-800': 'hsl(188, 86%, 20%)',

  'orange-500': 'hsl(33, 90%, 50%)',
};

export const DARK: IColor = {
  display: 'dark',

  text: 'hsl(0, 0%, 100%)',

  background: 'hsl(0, 0%, 10%)',
  'background-dark': 'hsl(0, 0%, 0%)',
  'background-overlay': 'hsl(0, 0%, 15%)',

  primary: 'hsl(215, 100%, 74%)',
  'primary-light': 'hsl(215, 100%, 68%)',
  'primary-lighter': 'hsl(215, 100%, 62%)',
  'primary-lightest': 'hsl(215, 100%, 54%)',

  'gray-50': 'hsl(0, 0%, 10%)',
  'gray-100': 'hsl(0, 0%, 20%)',
  'gray-200': 'hsl(0, 0%, 30%)',
  'gray-300': 'hsl(0, 0%, 40%)',
  'gray-400': 'hsl(0, 0%, 50%)',
  'gray-500': 'hsl(0, 0%, 60%)',
  'gray-600': 'hsl(0, 0%, 70%)',
  'gray-700': 'hsl(0, 0%, 80%)',
  'gray-800': 'hsl(0, 0%, 90%)',
  'gray-900': 'hsl(0, 0%, 95%)',

  'blue-50': 'hsl(227, 84%, 10%)',
  'blue-400': 'hsl(227, 84%, 50%)',
  'blue-500': 'hsl(227, 84%, 60%)',
  'blue-600': 'hsl(227, 84%, 70%)',

  'green-200': 'hsl(141, 70%, 15%)',
  'green-500': 'hsl(141, 70%, 55%)',
  'green-600': 'hsl(141, 70%, 65%)',

  'red-500': 'hsl(0, 84%, 50%)',
  'red-600': 'hsl(0, 84%, 40%)',
  'red-700': 'hsl(0, 84%, 30%)',

  'cyan-50': 'hsl(188, 86%, 15%)',
  'cyan-400': 'hsl(188, 86%, 50%)',
  'cyan-800': 'hsl(188, 86%, 80%)',

  'orange-500': 'hsl(33, 90%, 50%)',
};
`;

const themeConfig = ` 
import { ThemeConfig } from '@/UI';
import * as colors from './themeColor';

type ITheme = {
  // eslint-disable-next-line no-unused-vars
  [key in keyof Omit<IColor, 'display'>]: Record<ThemeDisplayName, string>;
};

export type ThemeDisplayName = 'light' | 'dark';
export interface IColor {
  [key: string]: string;
}

// Get all theme colors from themeColor.ts and merge them into one object
const mergeTheme = (): ITheme => {
  if (!colors) return;

  return Object.values(colors).reduce((acc, cur) => {
    const { display, ...rest } = cur;
    const properties = Object.keys(rest).reduce((propsAcc, propsCur) => {
      return {
        ...propsAcc,
        [propsCur]: {
          ...acc[propsCur],
          [display]: rest[propsCur],
        },
      };
    }, {});
    return {
      ...acc,
      ...properties,
    };
  }, {} as ITheme);
};

// Key name in localStorage
export const COLOR_MODE = 'color-mode';

// Key name in CSS variable
export const INITIAL_COLOR_MODE = '--initial-color-mode';
export const COLORS = mergeTheme();
export const antdDefaultTheme: ThemeConfig = {
  token: {
    fontSize: 14,
    borderRadius: 4,
    colorBorder: 'var(--color-border-200)',
    controlHeight: 36,
    controlHeightXS: 28,
    controlHeightLG: 40,
    controlHeightSM: 32,
  },
  components: {
    Button: {
      colorText: 'var(--color-primary)',
      colorBorder: 'var(--color-primary)',
    },
    Modal: {
      paddingContentHorizontalLG: 0,
      paddingMD: 0,
      colorTextHeading: '#fff',
    },
    Spin: {
      colorPrimary: 'var(--color-primary)',
      colorBgContainer: 'var(--color-primary)',
    },
    Menu: {
      collapsedIconSize: 20,
    },
    Input: {
      colorBorder: 'var(--color-gray-300)',
    },
    Select: {
      colorBorder: 'var(--color-gray-300)',
    },
  },
};
`;

const themeProvider = ` 
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ConfigProvider } from '@/UI';
import {
  COLORS,
  COLOR_MODE,
  INITIAL_COLOR_MODE,
  ThemeDisplayName,
  antdDefaultTheme,
} from '@/configs/themeConfig';
import { theme as antdTheme } from 'antd';

interface IThemeContext {
  theme: ThemeDisplayName;
  // eslint-disable-next-line no-unused-vars
  toggleTheme: (theme?: ThemeDisplayName) => void;
}

const ThemeContext = React.createContext<IThemeContext>({} as IThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState<ThemeDisplayName>();

  useEffect(() => {
    const root = window.document.documentElement;
    const initialColorValue = root.style.getPropertyValue(INITIAL_COLOR_MODE);

    setTheme(initialColorValue as ThemeDisplayName);
  }, []);

  const toggleTheme = useCallback(
    (newTheme?: ThemeDisplayName) => {
      if (!newTheme) newTheme = theme === 'dark' ? 'light' : 'dark';

      const root = document.documentElement;

      localStorage.setItem(COLOR_MODE, newTheme);
      setTheme(newTheme);

      Object.entries(COLORS).forEach(([name, colorByTheme]) => {
        const cssVarName = \`--color-\${name}\`;

        root.style.setProperty(cssVarName, colorByTheme[newTheme]);
      });

      if (newTheme === 'dark') root.classList.add(newTheme);
      else root.classList.remove('dark');
    },
    [theme]
  );

  const contextValue = useMemo(() => ({ toggleTheme, theme }), [theme, toggleTheme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      <ConfigProvider theme={{ ...antdDefaultTheme, algorithm: theme === 'dark' && antdTheme.darkAlgorithm }}>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const data = React.useContext(ThemeContext);

  if (!data) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return data;
};

`;

const _document = `
import { COLORS, COLOR_MODE, INITIAL_COLOR_MODE } from '@/configs/themeConfig';
import { Html, Head, Main, NextScript } from 'next/document';
import Script from 'next/script';

function setColorsByTheme() {
  const colors = 'colorsValue';
  const colorModeKey = 'colorKey';
  const colorModeCssProp = 'initialColorMode';
  let colorMode = 'light';

  const persistedPreference = localStorage.getItem(colorModeKey);
  const hasUsedToggle = typeof persistedPreference === 'string';

  if (hasUsedToggle) {
    colorMode = persistedPreference;
  }

  const root = document.documentElement;

  root.style.setProperty(colorModeCssProp, colorMode);

  Object.entries(colors).forEach(([name, colorByTheme]) => {
    const cssVarName = \`--color-\${name}\`;

    root.style.setProperty(cssVarName, colorByTheme[colorMode]);
  });

  if (colorMode === 'dark') root.classList.add(colorMode);
}

const injectedFn = String(setColorsByTheme)
  .replace('"colorsValue"', JSON.stringify(COLORS))
  .replace('colorKey', COLOR_MODE)
  .replace('initialColorMode', INITIAL_COLOR_MODE);

export default function Document() {
  const date = process.env.buildId;

  return (
    <Html lang="en">
      <Head>
        <meta app-version={date} />
        <link rel="icon" href="/ghtk.ico" />
      </Head>
      <body>
        <Script
          id="inline-script"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: \`(\${injectedFn})()\`,
          }}
        />

        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
`;

const _app = `
import type { AppProps } from 'next/app';
import { ReactElement, ReactNode } from 'react';
import { NextPage } from 'next';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import 'antd/dist/reset.css';
import '@/styles/globals.scss';
import ErrorBoundary from '@/components/ErrorBoundary';
import Head from 'next/head';
import { AuthClient } from '@/configs/Auth/client';
import { ThemeProvider } from '@/provider';

// eslint-disable-next-line @typescript-eslint/ban-types
export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  // eslint-disable-next-line no-unused-vars
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <>
      <Head>
        <title>Giao Hàng Tiết Kiệm</title>
      </Head>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <ErrorBoundary>
            <AuthClient>{getLayout(<Component {...pageProps} />)}</AuthClient>
          </ErrorBoundary>
        </ThemeProvider>
      </QueryClientProvider>
    </>
  );
}
`;

const tailwindConfig = `
/** @type {import('tailwindcss').Config} */
import type { Config } from 'tailwindcss';
import { COLORS } from './src/configs/themeConfig';

const getMergeConfig = (): Config => {
  const properties = Object.keys(COLORS).reduce((acc, cur) => {
    return {
      ...acc,
      [\`th-\${cur}\`]: \`var(--color-\${cur})\`,
    };
  }, {});

  return {
    content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
    corePlugins: {
      preflight: false,
    },
    darkMode: 'class',
    theme: {
      extend: {
        colors: properties,
      },
    },
  };
};

export default getMergeConfig();

`;

export { themeColor, themeConfig, themeProvider, _document, _app, tailwindConfig };
