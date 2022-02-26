import { EnvironmentValidator } from '../EnvironmentValidator';
import { EnvironmentValidationError } from '../errors/EnvironmentValidationError';

export class StringEnvironmentValidator<T extends string | undefined = string> extends EnvironmentValidator {

	/**
	 * Whether the environment variable is optional.
	 */
	protected isOptional = false;

	/**
	 * The default value to use for the environment variable (if it's optional).
	 */
	protected defaultValue?: string;

	public constructor() {
		super();
	}

	public validate(input: string | undefined): T {
		if (input === undefined) {
			if (this.isOptional) {
				return this.defaultValue as T;
			}

			throw new EnvironmentValidationError('is required but was not available');
		}

		return input as T;
	}

	/**
	 * Marks the variable as optional.
	 */
	public optional(): StringEnvironmentValidator<T | undefined>;

	/**
	 * Marks the variable as optional with a default value.
	 *
	 * @param defaultValue
	 */
	public optional(defaultValue: string): StringEnvironmentValidator<T>;
	public optional(defaultValue?: string): StringEnvironmentValidator<T | undefined> {
		this.isOptional = true;
		this.defaultValue = defaultValue as T;

		return this;
	}

}
