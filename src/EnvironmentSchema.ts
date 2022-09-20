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
	 * Creates a new `enum` environment variable, whose value must match one of the given options.
	 *
	 * @param options
	 *   A read-only array of possible string or number values, or a reference to an actual `enum` object.
	 */
	public enum<T extends string | number | undefined>(options: ReadonlyArray<T>): EnumEnvironmentValidator<T>;
	public enum<T extends Enum>(options: T): EnumEnvironmentValidator<EnumValueType<T>>;
	public enum<T extends string | number | undefined>(options: ReadonlyArray<T>): any {
		return new EnumEnvironmentValidator(options as any);
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

type EnumValueType<T extends Enum> = T extends { [id: number | string]: infer U } ? U : never;
