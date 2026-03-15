import { config } from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';

// Works from both src/ (dev) and dist/src/ (prod)
const envPath = [
  resolve(import.meta.dirname, '../../../.env'),
  resolve(import.meta.dirname, '../../../../.env'),
].find(p => existsSync(p));

if (envPath) config({ path: envPath });
