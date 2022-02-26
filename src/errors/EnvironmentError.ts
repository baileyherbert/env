/**
 * This error is thrown when one or more environment variables fail to conform to the configured validation schema.
 */
export class EnvironmentError extends Error {

	/**
	 * Constructs a new `EnvironmentError` instance.
	 *
	 * @param errors An array of error messages for each environment variable that failed validation.
	 */
	public constructor(public errors: string[]) {
		super(
			'Environment variables failed to validate:\n' +
			errors.map(error => `- ${error}`).join('\n')
		);
	}

}
