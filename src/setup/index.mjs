/* eslint-disable no-console */
import prompts from 'prompts';
import path from 'path';
import { promises as fs } from 'fs';
import { themeColor, themeConfig, themeProvider, _document, _app, tailwindConfig } from './theme/index.mjs';
import { authOptions, authDefaultEnv } from './auth/index.mjs';
import {
  createNewNextConfig,
  sentryConfigClient,
  sentryConfigEdge,
  sentryConfigServer,
} from './sentry/index.mjs';
import { command, createDir, delay, deleteFolderRecursive, log } from './util.mjs';

const questions = [
  {
    type: 'text',
    name: 'name',
    message: 'What is your project name?',
    validate: (value) => (value ? true : 'Invalid project name'),
  },
  {
    type: 'toggle',
    name: 'theme',
    message: 'Would you like to use theme (light + dark)?',
    initial: true,
    active: 'Yes',
    inactive: 'No',
  },
  {
    type: 'toggle',
    name: 'auth',
    message: 'Does the project integrate with Gchat via iframe?',
    initial: true,
    active: 'Yes',
    inactive: 'No',
  },
  {
    type: 'toggle',
    name: 'sentry',
    message: 'Would you like to use sentry monitoring?',
    initial: true,
    active: 'Yes',
    inactive: 'No',
  },
];

const sentryQuestions = [
  {
    type: 'text',
    name: 'projectName',
    message: ' - What is your sentry project name?',
    validate: (value) => (value ? true : 'Invalid project name'),
  },
  {
    type: 'text',
    name: 'sentryDsn',
    message: ' - What is your sentry DSN?',
    validate: (value) => (value ? true : 'Invalid DSN'),
  },
];

const handleChangeName = async (name) => {
  try {
    const data = await fs.readFile('package.json', 'utf8');
    const result = data.replace('boilerplate-nextjs', name.trim().toLowerCase());

    await fs.writeFile('package.json', result);
    log.green('\n- Project name updated!\n');
  } catch (err) {
    console.log(err);
  }
};

const handleSetupTheme = async () => {
  const root = path.join(process.cwd(), '/');
  const configDir = path.join(process.cwd(), '/src/configs');
  const providerDir = path.join(process.cwd(), '/src/provider');
  const pagesDir = path.join(process.cwd(), '/src/pages');
  let id;

  try {
    id = log.install('Installing theme config');
    await createDir(providerDir);

    await Promise.all([
      fs.writeFile(path.join(configDir, 'themeColor.ts'), themeColor),
      fs.writeFile(path.join(configDir, 'themeConfig.ts'), themeConfig),
      fs.writeFile(path.join(providerDir, 'index.tsx'), themeProvider),
      fs.writeFile(path.join(pagesDir, '_document.tsx'), _document),
      fs.writeFile(path.join(pagesDir, '_app.tsx'), _app),
      fs.writeFile(path.join(root, 'tailwind.config.ts'), tailwindConfig),
    ]);

    await delay(1000);
    log.green('- Theme config created!\n', id);
  } catch (err) {
    log.red(`Error while creating theme config:\n${err}\n`, id);
  }
};

const handleSetupAuth = async () => {
  const configDir = path.join(process.cwd(), '/src/configs/Auth');
  let id;

  try {
    id = log.install('Updating auth config');

    await fs.writeFile(path.join(configDir, 'config.ts'), authOptions);
    await delay(1000);

    log.green('- Auth config updated!\n', id);
  } catch (err) {
    log.red(`Error while updating auth config:\n${err}\n`, id);
  }
};

const handleSetupSentry = async (projectName) => {
  const root = path.join(process.cwd(), '/');
  let id;

  try {
    id = log.install('Installing Sentry packages');
    await command('npm', ['install', '@sentry/nextjs'], { cwd: root });

    await Promise.all([
      fs.writeFile(path.join(root, 'sentry.client.config.ts'), sentryConfigClient),
      fs.writeFile(path.join(root, 'sentry.edge.config.ts'), sentryConfigEdge),
      fs.writeFile(path.join(root, 'sentry.server.config.ts'), sentryConfigServer),
      fs.writeFile(path.join(root, 'next.config.js'), createNewNextConfig(projectName)),
    ]);
    await delay(1000);

    log.green('- Sentry config installed!\n', id);
  } catch (err) {
    log.red(`Error while creating sentry config:\n${err}\n`, id);
  }
};

(async () => {
  let sentryResponse;
  let env = authDefaultEnv;
  const root = path.join(process.cwd(), '/');

  const response = await prompts(questions);

  if (response.sentry) {
    sentryResponse = await prompts(sentryQuestions);
  }

  const sTime = performance.now();

  if (response.name) {
    await handleChangeName(response.name);
  }

  if (response.theme) {
    await handleSetupTheme();
  }

  if (response.auth) {
    await handleSetupAuth();
  }

  if (response.sentry) {
    env += `NEXT_PUBLIC_SENTRY_DSN=${sentryResponse.sentryDsn?.trim()}\n`;
    await handleSetupSentry(sentryResponse.projectName?.trim());
  }

  await fs.writeFile(path.join(root, '.env'), env);

  const id = log.install('Cleaning up');
  //  Delete setup folder once done
  deleteFolderRecursive(path.join(root, 'setup'));

  //  Clean up
  await command('npm', ['uninstall', 'prompts', 'chalk'], { cwd: root });
  await command('npx', ['prettier', '.', '--write', '--ignore-path', '.gitignore'], { cwd: root });

  const fTime = performance.now();
  log.greenBold(`\n✔ Setup completed in ${(fTime - sTime).toFixed(2)}ms \n`, id);
})();
