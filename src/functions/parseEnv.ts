import { EnvironmentParseError } from '../errors/EnvironmentParseError';

/**
 * Parses the given dotenv-formatted string into a `Map` object.
 *
 * Throws a `EnvironmentParseError` if a formatting error is encountered during parsing.
 *
 * @param content
 * @returns
 */
export function parseEnv(content: string) {
	const map = new Map<string, string>();

	let isAfterEqual = false;
	let isWithinQuotes = false;
	let isAfterQuotes = false;
	let isBackslash = false;
	let isBackslashConsumed = false;

	let valueName = '';
	let valueContent = '';
	let quoteCharacter = '';
	let numConsecutiveWhitespace = 0;
	let quoteStartLine = 0;

	let lineNumber = 1;

	/**
	 * Pushes the current name+value into the map and resets all state.
	 */
	const push = () => {
		if (isWithinQuotes) {
			throw new EnvironmentParseError(
				`Unterminated quotes (starting on line ${quoteStartLine})`,
				lineNumber
			);
		}

		if (valueName.trim().length > 0) {
			map.set(valueName, valueContent);
		}

		isAfterEqual = false;
		isWithinQuotes = false;
		isAfterQuotes = false;
		isBackslash = false;
		isBackslashConsumed = false;

		valueName = '';
		valueContent = '';
		quoteCharacter = '';
		quoteStartLine = 0;
		numConsecutiveWhitespace = 0;
	}

	for (let index = 0; index < content.length; index++) {
		const char = content[index];
		const charNext = content[index + 1];

		if (content[index - 1] === '\n') {
			lineNumber++;
		}

		if (!isAfterEqual) {
			if (char === '#') {
				if (valueName.trim().length > 0) {
					throw new EnvironmentParseError(`Found stray text "${valueName.trim()}"`, lineNumber);
				}

				const nextNewLine = content.indexOf('\n', index);

				if (nextNewLine > 0) {
					index = nextNewLine;
					continue;
				}

				break;
			}

			else if (char === '=') {
				isAfterEqual = true;
				valueName = valueName.trim();
			}

			else if (char === '\n') {
				if (valueName.trim().length > 0) {
					throw new EnvironmentParseError(`Found stray text "${valueName.trim()}"`, lineNumber);
				}

				valueName = '';
			}

			else {
				valueName += char;
			}
		}
		else {
			// Newlines
			let isNewline = char === '\n';
			let isNewlineEscape = (char === '\\' && charNext === 'n');
			if (isNewline || isNewlineEscape) {
				if (!isWithinQuotes) {
					push();
					continue;
				}

				valueContent += '\n';

				if (isNewlineEscape) {
					index++;
				}

				continue;
			}

			// Backslashes
			if (char === '\\') {
				if (!isBackslash) {
					isBackslash = true;
					continue;
				}
			}

			// Quotes
			if (char === `"` || char === `'`) {
				if (!isWithinQuotes) {
					if (valueContent.trim().length === 0) {
						isWithinQuotes = true;
						quoteCharacter = char;
						quoteStartLine = lineNumber;

						continue;
					}
				}
				else if (isWithinQuotes && char === quoteCharacter) {
					if (isBackslash) {
						isBackslashConsumed = true;
					}
					else {
						isWithinQuotes = false;
						isAfterQuotes = true;
						quoteCharacter = '';
						continue;
					}
				}
			}

			// Comments
			if (char === '#' && !isWithinQuotes) {
				// Remove whitespace before the comment
				if (numConsecutiveWhitespace > 0 && !isAfterQuotes) {
					valueContent = valueContent.substring(0, valueContent.length - numConsecutiveWhitespace);
				}

				// Push the line's content
				push();

				// Skip to the next newline or end now
				const nextNewLine = content.indexOf('\n', index);

				if (nextNewLine > 0) {
					index = nextNewLine;
					continue;
				}

				break;
			}

			// Track whitespace for trimming
			let isWhitespace = /\s/.test(char);

			if (isWhitespace) {
				numConsecutiveWhitespace++;
			}
			else {
				numConsecutiveWhitespace = 0;
			}

			// For content found after a "quoted string" has ended
			if (isAfterQuotes) {
				if (isWhitespace) {
					continue;
				}

				throw new EnvironmentParseError(
					`Found more content after quoted string had ended. Did you forget to escape the quotes?`,
					lineNumber
				);
			}

			// Reset backslash
			if (isBackslash) {
				if (!isBackslashConsumed) {
					valueContent += '\\';
				}

				isBackslash = false;
			}

			// Skip whitespace
			if (isWhitespace && !isWithinQuotes && valueContent.length === 0) {
				continue;
			}

			valueContent += char;
		}
	}

	push();
	return map;
}
