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
	public enum<T extends string | number | undefined>(options: ReadonlyArray<T>): EnumEnvironmentValidator<T>;

	/**
	 * Creates a new `enum` environment variable, whose input must match one of the keys from the given enum object.
	 * If specified, both string and numeric values can also be accepted (disabled by default).
	 *
	 * @param options The reference to an actual `enum` object.
	 * @param acceptValues Whether or not to accept values in addition to keys (default: false).
	 */
	public enum<T extends Enum>(options: T, acceptValues?: boolean): EnumEnvironmentValidator<EnumValueType<T>>;
	public enum<T extends string | number | undefined>(options: ReadonlyArray<T>, acceptValues?: boolean): any {
		return new EnumEnvironmentValidator(options as any, acceptValues);
	}

	/**
	 * Allows you to parse the value manually with a function. Return the parsed value in any format, and throw an
	 * instance of `EnvironmentValidationError` if the value is not acceptable.
	 *
	 * @param validator
	 * @returns
	 */
	public custom(validator: (value?: string) => any) {
		return validator;
	}

}

interface Enum {
    [id: number | string]: string | number;
}

type RemoveIndex<T> = { [ K in keyof T as string extends K ? never : number extends K ? never : K ] : T[K] };
type Filter<T> = unknown extends T ? string | number : T;
type Extract<T> = RemoveIndex<T> extends { [id: number | string]: infer U } ? U : never;
type EnumValueType<T extends Enum> = Filter<Extract<T>>;
