import { EnvironmentManager } from './EnvironmentManager';
import { FileEnvironmentSource } from './sources/FileEnvironmentSource';
import { ProcessEnvironmentSource } from './sources/ProcessEnvironmentSource';

export * from './EnvironmentManager';
export * from './EnvironmentSource';

export * from './sources/FileEnvironmentSource';
export * from './sources/MemoryEnvironmentSource';
export * from './sources/ProcessEnvironmentSource';

export * from './errors/EnvironmentError';
export * from './errors/EnvironmentValidationError';
export * from './errors/EnvironmentParseError';

export * from './functions/parseEnv';

/**
 * The global environment manager which reads environment variables from `process.env` first and a `.env` file in the
 * current working directory as a fallback.
 */
export const Env = new EnvironmentManager([
	new ProcessEnvironmentSource()
]);

if (typeof process !== 'undefined') {
	if (!process.env.ENV_SILENT || ['false', '0'].includes(process.env.ENV_SILENT)) {
		const path = process.env.ENV_PATH ?? '.env';
		Env.sources.push(new FileEnvironmentSource(path));
	}
}
