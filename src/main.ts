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

/**
 * The global environment manager which reads environment variables from `process.env` first and a `.env` file in the
 * current working directory as a fallback.
 */
export const Env = new EnvironmentManager([
	new ProcessEnvironmentSource(),
	new FileEnvironmentSource('.env'),
]);
