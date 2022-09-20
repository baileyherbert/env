import { EnvironmentSource } from '../EnvironmentSource';

/**
 * An environment source which uses variables from a provided object.
 */
export class ObjectEnvironmentSource extends EnvironmentSource {

	/**
	 * The environment variables.
	 */
	protected values: Map<string, string>;

	/**
	 * Constructs a new `ObjectEnvironmentSource` instance.
	 *
	 * @param environment
	 */
	public constructor(environment: Record<string, string> | Map<string, string>) {
		super();

		this.values = environment instanceof Map ? environment : new Map(Object.entries(environment));
	}

	public get(name: string): string | undefined {
		return this.values.get(name);
	}

	public has(name: string): boolean {
		return this.values.has(name);
	}

	public all() {
		return this.values;
	}

}
