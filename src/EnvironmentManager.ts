import { EnvironmentSchema } from './EnvironmentSchema';
import { EnvironmentSource } from './EnvironmentSource';
import { EnvironmentValidator } from './EnvironmentValidator';
import { EnvironmentError } from './errors/EnvironmentError';
import { EnvironmentValidationError } from './errors/EnvironmentValidationError';
import { BooleanEnvironmentValidator } from './validators/BooleanEnvironmentValidator';
import { NumberEnvironmentValidator } from './validators/NumberEnvironmentValidator';

export class EnvironmentManager extends EnvironmentSource {

	/**
	 * The prefix to prepend to all variable names when sending to and receiving from the sources.
	 */
	public readonly prefix: string;

	/**
	 * The sources this manager will read variables from.
	 */
	public readonly sources: EnvironmentSource[];

	/**
	 * A collection of validator factories for use with the `rules()` method.
	 */
	public readonly schema = new EnvironmentSchema();

	/**
	 * Constructs a new `EnvironmentManager` instance with the given source.
	 *
	 * @param source
	 * @param prefix
	 *   An optional string prefix to prepend to the beginning of all environment variable names sent between the
	 *   manager and the source.
	 */
	public constructor(source: EnvironmentSource, prefix?: string);

	/**
	 * Constructs a new `EnvironmentManager` instance with the given sources.
	 *
	 * @param sources
	 * @param prefix
	 *   An optional string prefix to prepend to the beginning of all environment variable names sent between the
	 *   manager and the sources.
	 */
	public constructor(sources: EnvironmentSource[], prefix?: string);
	public constructor(sources: EnvironmentSource[] | EnvironmentSource, prefix?: string) {
		super();

		if (!Array.isArray(sources)) {
			sources = [sources];
		}

		this.sources = sources;
		this.prefix = prefix ?? '';
	}

	/**
	 * Returns the value of the specified environment variable.
	 *
	 * @param name
	 * @returns
	 */
	public get(name: string): string | undefined;
	public get(name: string, defaultValue: string): string;
	public get(name: string, defaultValue: number): number;
	public get(name: string, defaultValue: boolean): boolean;
	public get(name: string, defaultValue?: any): any {
		const internalName = this.prefix + name;

		for (const source of this.sources) {
			if (source.has(internalName)) {
				const value = source.get(internalName);

				try {
					switch (typeof defaultValue) {
						case 'string': return value;
						case 'number': return (new NumberEnvironmentValidator()).validate(value, {});
						case 'boolean': return (new BooleanEnvironmentValidator()).validate(value, {});
					}
				}
				catch (error) {
					if (error instanceof EnvironmentValidationError) {
						error.message = internalName + ' ' + error.message;
					}
				}

				return value;
			}
		}

		return defaultValue;
	}

	/**
	 * Returns true if the specified environment variable exists in this manager's sources.
	 *
	 * @param name
	 * @returns
	 */
	public has(name: string): boolean {
		const internalName = this.prefix + name;

		for (const source of this.sources) {
			if (source.has(internalName)) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Returns a map containing all environment variables in the manager (in raw string format).
	 */
	public all(): Map<string, string> {
		const environment = new Map<string, string>();

		for (const source of this.sources) {
			for (const [key, value] of source.all()) {
				if (!environment.has(key)) {
					environment.set(key, value);
				}
			}
		}

		return environment;
	}

	/**
	 * Builds an object containing environment variable values, all parsed and validated according to the specified
	 * schema. Throws an `EnvironmentError` instance if there are any errors.
	 *
	 * @param rules
	 * @param throwErrors
	 * @returns
	 */
	public rules<T extends EnvironmentRules>(rules: T, throwErrors = true): EnvironmentRulesConverted<T> {
		const transformed: any = {};
		const errors: string[] = [];

		for (let name in rules) {
			const internalName = this.prefix + name;

			try {
				const validator = rules[name];

				if (typeof validator === 'function') {
					transformed[name] = validator(this.get(name));
				}
				else {
					transformed[name] = validator.validate(this.get(name), transformed);
				}
			}
			catch (error) {
				if (error instanceof EnvironmentValidationError) {
					errors.push(`${internalName} ${error.message}`);
				}
			}
		}

		if (errors.length > 0 && throwErrors) {
			throw new EnvironmentError(errors);
		}

		return transformed;
	}

	/**
	 * Applies this manager's environment variables to the global `process` object. You can also provide a custom
	 * object to augment instead.
	 */
	public apply(object?: any) {
		if (typeof object !== 'object') {
			if (typeof process !== 'object') {
				return;
			}

			object = process.env;
		}

		for (const [key, value] of this.all()) {
			object[key] = value;
		}

	}

}

interface EnvironmentRules {
	[name: string]: EnvironmentValidator | EnvironmentValidatorFunction;
}

type EnvironmentValidatorFunction = (value?: string) => any;
type EnvironmentRulesConverted<T extends EnvironmentRules> = {
	[K in keyof T]: ReturnType<(
		T[K] extends EnvironmentValidatorFunction ? T[K] :
		(T[K] extends EnvironmentValidator ? T[K]['validate'] : never)
	)>;
}
