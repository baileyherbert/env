import { EnvironmentValidator, WhenCallback, WhenEnvironment } from '../EnvironmentValidator';
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

	/**
	 * Validates and returns the final, converted value of the given environment variable value string.
	 *
	 * @param input The raw value of the environment variable or `undefined` if not set.
	 * @param environment An object containing other environment variables that have already been parsed.
	 */
	public validate(input: string | undefined, environment: WhenEnvironment): T {
		if (this.whenConditionCallback && !this.whenConditionCallback(environment)) {
			return this.defaultValue as T;
		}

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
	public optional(defaultValue: number): NumberEnvironmentValidator<NonNullable<T>>;
	public optional(defaultValue?: number): NumberEnvironmentValidator<T | undefined> {
		this.isOptional = true;
		this.defaultValue = defaultValue as T;

		return this;
	}

	/**
	 * Marks the variable as optional, and only parses it if the given function returns `true`.
	 */
	public when(fn: WhenCallback): NumberEnvironmentValidator<T | undefined> {
		this.whenConditionCallback = fn;
		return this;
	}

}
