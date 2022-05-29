import { EnvironmentSource } from '../EnvironmentSource';
import { EnvironmentParseError } from '../errors/EnvironmentParseError';
import { parseEnv } from '../functions/parseEnv';
import fs from 'fs';
import path from 'path';

/**
 * An environment source which reads variables from a file.
 */
export class FileEnvironmentSource extends EnvironmentSource {

	/**
	 * The absolute path of the target file.
	 */
	protected path: string;

	/**
	 * The format of the file.
	 */
	protected format: FileEnvironmentFormat;

	/**
	 * The environment variables in this file.
	 */
	protected values: Map<string, string>;

	/**
	 * Constructs a new `FileEnvironmentSource` which parses environment variables from the specified file.
	 *
	 * @param filePath
	 * @param format
	 */
	public constructor(filePath: string, format: FileEnvironmentFormat = 'env') {
		super();

		this.path = path.resolve(filePath);
		this.format = format;
		this.values = new Map();

		this.init();
	}

	/**
	 * Initializes the source and reads variables from the file if it exists.
	 */
	protected init() {
		if (fs.existsSync(this.path)) {
			const content = fs.readFileSync(this.path).toString();

			if (this.format === 'env') {
				return this.parseEnv(content);
			}

			throw new Error(`Unknown parsing format: ${this.format}`);
		}
	}

	/**
	 * Parses the target file in the dotenv format.
	 *
	 * @param content
	 */
	protected parseEnv(content: string) {
		try {
			this.values = parseEnv(content);
		}
		catch (error) {
			if (error instanceof EnvironmentParseError) {
				throw new Error(`Error parsing ${this.path}:${error.line}: ` + error.message);
			}
		}
	}

	public get(name: string): string | undefined {
		return this.values.get(name);
	}

	public has(name: string): boolean {
		return this.values.has(name);
	}

}

/**
 * The format of the file to read. More will be added later.
 */
export type FileEnvironmentFormat = 'env';
