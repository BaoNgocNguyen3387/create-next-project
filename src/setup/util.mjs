/* eslint-disable no-console */
import path from 'path';
import { promises as fs } from 'fs';
import { spawn } from 'child_process';
import chalk from 'chalk';

const clearLine = () => {
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
};

export const log = {
  green: (message, id) => {
    if (id) clearInterval(id);
    clearLine();
    process.stdout.write(chalk.greenBright(message));
  },
  greenBold: (message, id) => {
    if (id) clearInterval(id);
    clearLine();
    process.stdout.write(chalk.green.bold(message));
  },
  red: (message, id) => {
    if (id) clearInterval(id);
    clearLine();
    process.stdout.write(chalk.bgRed.bold(message));
  },
  install: (message) => {
    process.stdout.write(chalk.dim(`[${message}]`));
    let count = 0;

    const id = setInterval(() => {
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
      count++;
      process.stdout.write(chalk.dim(`[${message}${Array(count)?.join('.')}]`));
      if (count === 6) count = 0;
    }, 800);

    return id;
  },
};

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const command = (cmd, args, options = {}) => {
  // Enable shell option for cross-platform compatibility
  options.shell = true;

  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, options);

    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command "${cmd}" failed with code ${code}`));
      }
    });
  });
};

export const createDir = async (dir) => {
  const dirExists = await fs.stat(dir).catch(() => null);
  if (!dirExists) await fs.mkdir(dir);
};

export const move = async (oldPath, newPath, callback) => {
  // Move file from oldPath to newPath, if err using copy instead
  await fs.rename(oldPath, newPath, function (err) {
    if (err) {
      if (err.code === 'EXDEV') {
        copy();
      } else {
        callback(err);
      }
      return;
    }
    callback();
  });

  function copy() {
    const readStream = fs.createReadStream(oldPath);
    const writeStream = fs.createWriteStream(newPath);

    readStream.on('error', callback);
    writeStream.on('error', callback);

    readStream.on('close', function () {
      fs.unlink(oldPath, callback);
    });

    readStream.pipe(writeStream);
  }
};

export const getPathName = (name) => {
  return path.join(__dirname, name);
};

export const deleteFolderRecursive = async (path) => {
  const stat = await fs.stat(path);
  if (stat.isDirectory()) {
    const files = await fs.readdir(path);
    await Promise.all(files.map((file) => deleteFolderRecursive(`${path}/${file}`)));
    await fs.rmdir(path);
  } else {
    await fs.unlink(path);
  }
};
