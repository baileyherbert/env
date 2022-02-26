/**
 * This error is thrown when validation fails for a specific environment variable.
 */
export class EnvironmentValidationError extends Error {

	/**
	 * Constructs a new `EnvironmentValidationError` instance.
	 *
	 * @param message
	 *   Describes the error in the context of the environment variable. This message should start with a lowercase
	 *   helping verb, such as "is" or "must". The name of the offending variable will be automatically prefixed to
	 *   the message at runtime.
	 */
	public constructor(message: string) {
		super(message);
	}

}
