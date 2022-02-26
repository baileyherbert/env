import { EnvironmentSource } from '../EnvironmentSource';

/**
 * An environment source which stores variables internally. This is primarily useful for testing.
 */
export class MemoryEnvironmentSource extends EnvironmentSource {

	/**
	 * The environment variables.
	 */
	protected values: Map<string, string>;

	/**
	 * Constructs a new `MemoryEnvironmentSource` instance.
	 *
	 * @param filePath
	 * @param format
	 */
	public constructor() {
		super();

		this.values = new Map();
	}

	public get(name: string): string | undefined {
		return this.values.get(name);
	}

	public has(name: string): boolean {
		return this.values.has(name);
	}

	/**
	 * Sets the value of the specified environment variable.
	 *
	 * @param name
	 * @param value
	 */
	public set(name: string, value: string) {
		this.values.set(name, value);
	}

}
