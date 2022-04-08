export class EnvironmentParseError extends Error {
	public constructor(message: string, public readonly line: number) {
		super(message);
	}
}
