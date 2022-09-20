import { EnvironmentParseError } from '../errors/EnvironmentParseError';
import { ObjectEnvironmentSource } from './ObjectEnvironmentSource';
import { parseEnv } from '../functions/parseEnv';

/**
 * An environment source which accepts an input string in the dotenv format.
 */
export class StringEnvironmentSource extends ObjectEnvironmentSource {

	/**
	 * Constructs a new `StringEnvironmentSource` instance.
	 *
	 * @param env
	 */
	public constructor(env: string) {
		let environment: Map<string, string>;

		try {
			environment = parseEnv(env);
		}
		catch (error) {
			if (error instanceof EnvironmentParseError) {
				throw new Error(`Error parsing dotenv input (line ${error.line}): ` + error.message);
			}

			throw error;
		}

		super(environment);
	}

}
