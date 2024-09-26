import { existsSync, mkdirSync } from 'fs';
import { systemVal } from './system';

let logDir: string = 'logs'
// logs dir
if (systemVal?.log_dir && systemVal.log_dir != '')
  logDir = systemVal.log_dir

if (!existsSync(logDir)) {
  mkdirSync(logDir);
}

const logger = console;
const stream = process.stdout

export { logger, stream };
