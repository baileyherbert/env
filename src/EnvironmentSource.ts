export abstract class EnvironmentSource {

	/**
	 * Retrieves the value of the specified environment variable or `undefined` if not found.
	 *
	 * @param name
	 */
	public abstract get(name: string): string | undefined;

	/**
	 * Returns true if the specified environment variable exists in the source.
	 *
	 * @param name
	 */
	public abstract has(name: string): boolean;

}
