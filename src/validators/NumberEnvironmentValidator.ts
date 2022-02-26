import { EnvironmentValidator } from '../EnvironmentValidator';
import { EnvironmentValidationError } from '../errors/EnvironmentValidationError';

export class NumberEnvironmentValidator<T extends number | undefined = number> extends EnvironmentValidator {

	/**
	 * Whether the environment variable is optional.
	 */
	protected isOptional = false;

	/**
	 * The default value to use for the environment variable (if it's optional).
	 */
	protected defaultValue?: number;

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

		const casted = Number(input);

		if (isNaN(casted)) {
			throw new EnvironmentValidationError('is not a number');
		}

		return casted as T;
	}

	/**
	 * Marks the variable as optional.
	 */
	public optional(): NumberEnvironmentValidator<T | undefined>;

	/**
	 * Marks the variable as optional with a default value.
	 *
	 * @param defaultValue
	 */
	public optional(defaultValue: number): NumberEnvironmentValidator<T>;
	public optional(defaultValue?: number): NumberEnvironmentValidator<T | undefined> {
		this.isOptional = true;
		this.defaultValue = defaultValue as T;

		return this;
	}

}
