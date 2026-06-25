import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const parseEnvFile = (filePath: string): void => {
  if (!existsSync(filePath)) return;

  for (const line of readFileSync(filePath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;

    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
};

const backendDir = path.resolve(import.meta.dirname, '..');
const repoRoot = path.resolve(backendDir, '../..');
const supabaseDir = path.join(repoRoot, 'supabase');

// Later files do not override vars already set in the shell or earlier files.
for (const file of [
  path.join(supabaseDir, '.env'),
  path.join(supabaseDir, '.env.local'),
  path.join(backendDir, '.env'),
]) {
  parseEnvFile(file);
}
