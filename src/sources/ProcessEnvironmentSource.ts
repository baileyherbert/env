import { EnvironmentSource } from '../EnvironmentSource';

/**
 * An environment source which reads variables from `process.env`.
 */
export class ProcessEnvironmentSource extends EnvironmentSource {

	/**
	 * Constructs a new `ProcessEnvironmentSource` instance.
	 */
	public constructor() {
		super();
	}

	public get(name: string): string | undefined {
		if (typeof process !== 'undefined') {
			return process.env[name];
		}

		return;
	}

	public has(name: string): boolean {
		if (typeof process !== 'undefined') {
			return name in process.env;
		}

		return false;
	}

	public all() {
		if (typeof process !== 'undefined') {
			return new Map(Object.entries(process.env));
		}

		return new Map()
	}

}
