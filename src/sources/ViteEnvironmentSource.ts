// @ts-nocheck

import { EnvironmentSource } from '../EnvironmentSource';

/**
 * An environment source which reads variables from `import.meta.env`, which is available in vite builds for browsers.
 */
export class ViteEnvironmentSource extends EnvironmentSource {

	/**
	 * Constructs a new `ViteEnvironmentSource` instance.
	 */
	public constructor() {
		super();
	}

	public get(name: string): string | undefined {
		if (typeof window !== 'undefined' && typeof import.meta === 'object' && typeof import.meta.env === 'object') {
			return import.meta.env[name];
		}

		return;
	}

	public has(name: string): boolean {
		if (typeof window !== 'undefined' && typeof import.meta === 'object' && typeof import.meta.env === 'object') {
			return name in import.meta.env;
		}

		return false;
	}

	public all() {
		if (typeof process !== 'undefined') {
			return new Map(Object.entries(import.meta.env));
		}

		return new Map()
	}

}
