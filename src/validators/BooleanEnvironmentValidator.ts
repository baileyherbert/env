import { EnvironmentValidator, WhenCallback, WhenEnvironment } from '../EnvironmentValidator';
import { EnvironmentValidationError } from '../errors/EnvironmentValidationError';

/**
 * @internal
 */
export const AFFIRMATIVE = ['1', 1, 'true', true];

/**
 * @internal
 */
export const NEGATIVE = ['0', 0, 'false', false];

export class BooleanEnvironmentValidator<T extends boolean | undefined = boolean> extends EnvironmentValidator {

	/**
	 * Whether the environment variable is optional.
	 */
	protected isOptional = false;

	/**
	 * The default value to use for the environment variable (if it's optional).
	 */
	protected defaultValue?: boolean;

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

		if (AFFIRMATIVE.includes(input)) {
			return true as T;
		}

		if (NEGATIVE.includes(input)) {
			return false as T;
		}

		throw new EnvironmentValidationError('is not a boolean');
	}

	/**
	 * Marks the variable as optional.
	 */
	public optional(): BooleanEnvironmentValidator<T | undefined>;

	/**
	 * Marks the variable as optional with a default value.
	 *
	 * @param defaultValue
	 */
	public optional(defaultValue: boolean): BooleanEnvironmentValidator<NonNullable<T>>;
	public optional(defaultValue?: boolean): BooleanEnvironmentValidator<T | undefined> {
		this.isOptional = true;
		this.defaultValue = defaultValue as T;

		return this;
	}

	/**
	 * Marks the variable as optional, and only parses it if the given function returns `true`.
	 */
	public when(fn: WhenCallback): BooleanEnvironmentValidator<T | undefined> {
		this.whenConditionCallback = fn;
		return this;
	}

}
