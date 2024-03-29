import { EnvironmentValidator, WhenCallback, WhenEnvironment } from '../EnvironmentValidator';
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

	/**
	 * Whether or not to allow partial values when matching user input against the enum.
	 */
	protected allowPartialValues = false;

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

		// Match using keys
		if (this.keys) {
			// Match by partial key
			if (this.allowPartialValues) {
				const match = this.getMatchFromPartialString(input, this.keys);

				if (match !== undefined) {
					return this.values[this.keys.indexOf(match)] as T;
				}
			}

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

		// Match by partial value
		if (this.allowPartialValues) {
			const match = this.getMatchFromPartialString(
				input,
				this.values.filter(value => typeof value === 'string') as string[]
			);

			if (match !== undefined) {
				return match as T;
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
	 * Finds a value from the enum that starts with the given input and returns it if there's only a single match.
	 * Otherwise, returns `undefined`.
	 *
	 * @param input
	 * @param options
	 * @returns
	 */
	private getMatchFromPartialString(input: string, options: string[]) {
		const matches = options.filter(o => o.toLowerCase().startsWith(input.toLowerCase()));

		if (matches.length === 1) {
			return matches[0];
		}

		return undefined;
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
	public optional(defaultValue: T): EnumEnvironmentValidator<NonNullable<T>>;
	public optional(defaultValue?: T): EnumEnvironmentValidator<T | undefined> {
		this.isOptional = true;
		this.defaultValue = defaultValue as T;

		return this;
	}

	/**
	 * Marks the variable as optional, and only parses it if the given function returns `true`.
	 */
	public when(fn: WhenCallback): EnumEnvironmentValidator<T | undefined> {
		this.whenConditionCallback = fn;
		return this;
	}

	/**
	 * Allows partial values when matching user input against the enum. For this to work, the following conditions must
	 * be true:
	 *
	 * - The enum must have a value that starts with the user's input (case-insensitive)
	 * - The enum values must be strings (numeric values are not supported)
	 * - There must be only one matching value
	 */
	public allowPartial(): EnumEnvironmentValidator<T> {
		this.allowPartialValues = true;
		return this;
	}

}

interface Enum {
    [id: number | string]: string | number;
}
