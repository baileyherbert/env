import { EnvironmentValidator } from '../EnvironmentValidator';
import { EnvironmentValidationError } from '../errors/EnvironmentValidationError';

export class EnumEnvironmentValidator<T extends string | number | undefined> extends EnvironmentValidator {

	/**
	 * Whether the environment variable is optional.
	 */
	protected isOptional = false;

	/**
	 * The default value to use for the environment variable (if it's optional).
	 */
	protected defaultValue?: string | number;

	/**
	 * The options that are available.
	 */
	protected options: (string | number)[];

	/**
	 * Constructs a new `EnumEnvironmentValidator` instance.
	 *
	 * @param options The possible options for this variable.
	 */
	public constructor(options: (string | number)[] | Enum) {
		super();

		if (Array.isArray(options)) {
			this.options = options;
		}
		else {
			this.options = Object.values(options);

			const keys = Object.keys(options).filter(k => typeof k === 'string');
			const values = keys.map(k => options[k as any]);

			this.options = values;
		}
	}

	public validate(input: string | undefined): T {
		if (input === undefined) {
			if (this.isOptional) {
				return this.defaultValue as T;
			}

			throw new EnvironmentValidationError('is required but was not available');
		}

		if (this.options.includes(input)) {
			return input as T;
		}

		if (this.options.includes(Number(input))) {
			return Number(input) as T;
		}

		throw new EnvironmentValidationError('must be one of [' + this.options.join(', ') + ']');
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
	public optional(defaultValue?: string | number): EnumEnvironmentValidator<T | undefined> {
		this.isOptional = true;
		this.defaultValue = defaultValue as T;

		return this;
	}

}

interface Enum {
    [id: number | string]: string | number;
}
