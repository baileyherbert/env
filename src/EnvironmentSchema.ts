import { EnvironmentValidationError } from './errors/EnvironmentValidationError';
import { BooleanEnvironmentValidator } from './validators/BooleanEnvironmentValidator';
import { EnumEnvironmentValidator } from './validators/EnumEnvironmentValidator';
import { NumberEnvironmentValidator } from './validators/NumberEnvironmentValidator';
import { StringEnvironmentValidator } from './validators/StringEnvironmentValidator';

export class EnvironmentSchema {

	/**
	 * Creates a new `string` environment variable.
	 *
	 * @returns
	 */
	public string() {
		return new StringEnvironmentValidator();
	}

	/**
	 * Creates a new `number` environment variable.
	 *
	 * @returns
	 */
	public number() {
		return new NumberEnvironmentValidator();
	}

	/**
	 * Creates a new `boolean` environment variable.
	 *
	 * @returns
	 */
	public boolean() {
		return new BooleanEnvironmentValidator();
	}

	/**
	 * Creates a new `enum` environment variable, whose input must match one of the given values.
	 *
	 * @param options A read-only array of possible string or number values.
	 */
	public enum<const T extends string | number | undefined>(options: ReadonlyArray<T>): EnumEnvironmentValidator<T>;

	/**
	 * Creates a new `enum` environment variable, whose input must match one of the keys from the given enum object.
	 * If specified, both string and numeric values can also be accepted (disabled by default).
	 *
	 * @param options The reference to an actual `enum` object.
	 * @param acceptValues Whether or not to accept values in addition to keys (default: false).
	 */
	public enum<const T extends Enum>(options: T, acceptValues?: boolean): EnumEnvironmentValidator<EnumValueType<T>>;
	public enum<const T extends string | number | undefined>(options: ReadonlyArray<T>, acceptValues?: boolean): any {
		return new EnumEnvironmentValidator(options as any, acceptValues);
	}

	/**
	 * Allows you to parse the value manually with a function. Return the parsed value in any format, and throw an
	 * instance of `EnvironmentValidationError` if the value is not acceptable.
	 *
	 * @param required Whether or not the validator should throw errors if the value is not set.
	 * @param validator
	 * @returns
	 */
	public custom<T>(required: true, validator: (value: string) => T): (value?: string) => T;
	public custom<T>(required: false, validator: (value?: string) => T): (value?: string) => T;

	/**
	 * Allows you to parse the value manually with a function. Return the parsed value in any format, and throw an
	 * instance of `EnvironmentValidationError` if the value is not acceptable.
	 *
	 * @param validator
	 * @returns
	 */
	public custom<T>(validator: (value?: string) => T): (value?: string) => T;
	public custom<T>(required: boolean | ((value?: string) => T), validator?: any) {
		if (typeof required !== 'boolean') {
			validator = required;
			required = false;
		}

		return (value?: string) => {
			if (required && value === undefined) {
				throw new EnvironmentValidationError('is required but was not available');
			}

			return validator(value);
		};
	}

}

interface Enum {
    [id: number | string]: string | number;
}

type RemoveIndex<T> = { [ K in keyof T as string extends K ? never : number extends K ? never : K ] : T[K] };
type Filter<T> = unknown extends T ? string | number : T;
type Extract<T> = RemoveIndex<T> extends { [id: number | string]: infer U } ? U : never;
type EnumValueType<T extends Enum> = Filter<Extract<T>>;
