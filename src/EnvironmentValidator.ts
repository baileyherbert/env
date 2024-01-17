export abstract class EnvironmentValidator {

	/**
	 * The callback used to determine whether or not the validator should be applied.
	 */
	protected whenConditionCallback?: WhenCallback;

	/**
	 * Validates and returns the final, converted value of the given environment variable value string.
	 *
	 * @param input The raw value of the environment variable or `undefined` if not set.
	 * @param environment An object containing other environment variables that have already been parsed.
	 */
	public abstract validate(input: string | undefined, environment: WhenEnvironment): any;

	/**
	 * Marks the variable as optional, and only parses it if the given function returns `true`.
	 */
	public abstract when(fn: WhenCallback): any;

}

/**
 * A callback used for `when()` conditions on environment validators.
 */
export type WhenCallback = (environment: WhenEnvironment) => boolean;

export type WhenEnvironment = { [key: string]: any };
