export abstract class EnvironmentValidator {

	/**
	 * Validates and returns the final, converted value of the given environment variable value string.
	 *
	 * @param input The raw value of the environment variable or `undefined` if not set.
	 */
	public abstract validate(input: string | undefined): any;

}
