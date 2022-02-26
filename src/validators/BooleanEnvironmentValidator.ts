import { EnvironmentValidator } from '../EnvironmentValidator';
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

	public validate(input: string | undefined): T {
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
	public optional(defaultValue: boolean): BooleanEnvironmentValidator<T>;
	public optional(defaultValue?: boolean): BooleanEnvironmentValidator<T | undefined> {
		this.isOptional = true;
		this.defaultValue = defaultValue as T;

		return this;
	}

}
