import { EnvironmentSchema } from './EnvironmentSchema';
import { EnvironmentSource } from './EnvironmentSource';
import { EnvironmentValidator } from './EnvironmentValidator';
import { EnvironmentError } from './errors/EnvironmentError';
import { EnvironmentValidationError } from './errors/EnvironmentValidationError';
import { BooleanEnvironmentValidator } from './validators/BooleanEnvironmentValidator';
import { NumberEnvironmentValidator } from './validators/NumberEnvironmentValidator';

export class EnvironmentManager extends EnvironmentSource {

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
	 */
	public constructor(source: EnvironmentSource);

	/**
	 * Constructs a new `EnvironmentManager` instance with the given sources.
	 *
	 * @param sources
	 */
	public constructor(sources: EnvironmentSource[]);
	public constructor(sources: EnvironmentSource[] | EnvironmentSource) {
		super();

		if (!Array.isArray(sources)) {
			sources = [sources];
		}

		this.sources = sources;
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
		for (const source of this.sources) {
			if (source.has(name)) {
				const value = source.get(name);

				try {
					switch (typeof defaultValue) {
						case 'string': return value;
						case 'number': return (new NumberEnvironmentValidator()).validate(value);
						case 'boolean': return (new BooleanEnvironmentValidator()).validate(value);
					}
				}
				catch (error) {
					if (error instanceof EnvironmentValidationError) {
						error.message = name + ' ' + error.message;
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
		for (const source of this.sources) {
			if (source.has(name)) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Builds an object containing environment variable values, all parsed and validated according to the specified
	 * schema. Throws an `EnvironmentError` instance if there are any errors.
	 *
	 * @param rules
	 * @returns
	 */
	public rules<T extends EnvironmentRules>(rules: T): EnvironmentRulesConverted<T> {
		const transformed: any = {};
		const errors: string[] = [];

		for (let name in rules) {
			try {
				const validator = rules[name];

				if (typeof validator === 'function') {
					transformed[name] = validator(this.get(name));
				}
				else {
					transformed[name] = validator.validate(this.get(name));
				}
			}
			catch (error) {
				if (error instanceof EnvironmentValidationError) {
					errors.push(`${name} ${error.message}`);
				}
			}
		}

		if (errors.length > 0) {
			throw new EnvironmentError(errors);
		}

		return transformed;
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
