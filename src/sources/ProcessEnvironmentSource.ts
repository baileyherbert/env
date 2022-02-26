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
		return process.env[name];
	}

	public has(name: string): boolean {
		return name in process.env;
	}

}
