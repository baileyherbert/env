import { EnvironmentValidator } from '../EnvironmentValidator';
import { EnvironmentValidationError } from '../errors/EnvironmentValidationError';

export class EnumEnvironmentValidator<T extends string | number | undefined | unknown> extends EnvironmentValidator {

	/**
	 * Whether the environment variable is optional.
	 */
	protected isOptional = false;

	/**
	 * The default value to use for the environment variable (if it's optional).
	 */
	protected defaultValue?: T;

	protected keys?: string[];
	protected values: (string | number)[] = [];

	/**
	 * Constructs a new `EnumEnvironmentValidator` instance.
	 *
	 * @param options The possible options for this variable.
	 * @param allowValues Whether or not to accept value inputs for keyed enum objects.
	 */
	public constructor(options: (string | number)[] | Enum, protected allowValues = false) {
		super();

		if (Array.isArray(options)) {
			this.values = options;
		}
		else {
			this.keys = Object.keys(options).filter(k => !k.match(/^\d+$/));
			this.values = this.keys.map(k => options[k as any]);
		}
	}

	public validate(input: string | undefined): T {
		if (input === undefined) {
			if (this.isOptional) {
				return this.defaultValue as T;
			}

			throw new EnvironmentValidationError('is required but was not available');
		}

		// Match using keys
		if (this.keys) {
			// Match by exact key
			const index = this.keys.indexOf(input);
			if (index >= 0) {
				return this.values[index] as T;
			}

			// Match by case-insensitive key
			const caseIndex = this.keys.findIndex(key => key.toLowerCase() === input.toLowerCase());
			if (caseIndex >= 0) {
				return this.values[caseIndex] as T;
			}

			if (!this.allowValues) {
				throw new EnvironmentValidationError('must be one of [' + this.keys.join(', ') + ']');
			}
		}

		// Match using values
		if (this.values.includes(input)) {
			return input as T;
		}

		if (this.values.includes(Number(input))) {
			return Number(input) as T;
		}

		if (!this.keys) {
			throw new EnvironmentValidationError('must be one of [' + this.values.join(', ') + ']');
		}

		throw new EnvironmentValidationError('must be one of [' + [...this.keys, ...this.values].join(', ') + ']');
	}

	/**
	 * Marks the variable as optional.
	 */
	public optional(): EnumEnvironmentValidator<T | undefined>;

	/**
	 * Marks the variable as optional with a default value.
	 *
	 * @param defaultValue
	 */
	public optional(defaultValue: T): EnumEnvironmentValidator<T>;
	public optional(defaultValue?: T): EnumEnvironmentValidator<T | undefined> {
		this.isOptional = true;
		this.defaultValue = defaultValue as T;

		return this;
	}

}

interface Enum {
    [id: number | string]: string | number;
}
