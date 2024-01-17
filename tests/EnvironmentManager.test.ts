import { EnvironmentManager } from '../src/EnvironmentManager';
import { FileEnvironmentSource, MemoryEnvironmentSource } from '../src/main';
import path from 'path';

describe('EnvironmentManager', function() {
	const artifact = path.resolve(__dirname, 'artifacts/.env');
	const memory = new MemoryEnvironmentSource();

	memory.set('MEMORY', '1');
	memory.set('NUMBER', '456');

	const manager = new EnvironmentManager([
		new FileEnvironmentSource(artifact),
		memory
	]);

	it('Reads from multiple sources in the correct order', function() {
		expect(manager.get('MEMORY')).toBe('1');
		expect(manager.get('NUMBER')).toBe('123');
	});

	it('Can check for existence of variables in multiple sources', function() {
		expect(manager.has('MEMORY')).toBe(true);
		expect(manager.has('NUMBER')).toBe(true);
		expect(manager.has('NOTFOUND')).toBe(false);
	});

	it('Parses values into the same format as their defaults', function() {
		expect(manager.get('NUMBER')).toBe('123');
		expect(manager.get('NUMBER', 0)).toBe(123);

		expect(manager.get('BOOL_TRUE')).toBe('true');
		expect(manager.get('BOOL_TRUE', false)).toBe(true);
	});

	it('Falls back to default values', function() {
		expect(manager.get('NOTFOUND', 'found')).toBe('found');
	});

	it('Can parse from schema rules', function() {
		enum StringEnum { A = 'a', B = 'b' };
		enum NumberEnum { One, Two };

		const parsed = manager.rules({
			STRING: manager.schema.string(),
			NUMBER: manager.schema.number(),
			NUMBER_NEGATIVE: manager.schema.number(),
			BOOL_TRUE: manager.schema.boolean(),
			BOOL_FALSE: manager.schema.boolean(),
			OPTIONAL: manager.schema.string().optional('default'),
			OPTIONAL_NO_DEFAULT: manager.schema.string().optional(),
			ENUM: manager.schema.enum(StringEnum),
			ENUM_NUMBER: manager.schema.enum(NumberEnum),
			ENUM_CONST: manager.schema.enum(['a', 'b'] as const),
			ENUM_CONST_INFERRED: manager.schema.enum(['a', 'b']),
			ENUM_BY_NAME: manager.schema.enum(NumberEnum),
			ENUM_BY_VALUE: manager.schema.enum(NumberEnum, true),
			STRING2: manager.schema.custom(value => {
				return value + '!';
			}),
			STRING3: manager.schema.custom(false, value => {
				return value + '!';
			}),
		});

		expect(parsed).toMatchObject({
			STRING: 'This is a string!',
			NUMBER: 123,
			NUMBER_NEGATIVE: -123,
			BOOL_TRUE: true,
			BOOL_FALSE: false,
			OPTIONAL: 'default',
			OPTIONAL_NO_DEFAULT: undefined,
			ENUM: StringEnum.A,
			ENUM_NUMBER: NumberEnum.One,
			ENUM_CONST: 'a',
			ENUM_CONST_INFERRED: 'a',
			ENUM_BY_NAME: NumberEnum.One,
			ENUM_BY_VALUE: NumberEnum.One,
			STRING2: 'Hello world!',
			STRING3: 'undefined!'
		});
	});

	it('Parses empty values', function() {
		expect(manager.get('EMPTY')).toBe('');
	})

	it('Parses values within quotes', function() {
		expect(manager.get('WITH_QUOTES')).toBe('I am in quotes!');
		expect(manager.get('WITH_QUOTES_ESCAPED')).toBe('I am in "quotes"!');
		expect(manager.get('WITH_COMMENT_QUOTES')).toBe('The correct name is # octothorp');
	});

	it('Ignores comments at the end of lines', function() {
		expect(manager.get('WITH_COMMENT')).toBe('I have a comment');
	});

	it('Parses values that span multiple lines', function() {
		const expected = `I am a multiline\nstring\nwith a #hashtag!`;

		expect(manager.get('MULTILINE')).toBe(expected);
		expect(manager.get('MULTILINE_ESCAPE')).toBe(expected);
	});

	it('Handles whitespace around values and names', function() {
		expect(manager.get('WITH_PADDING')).toBe('Hello!');
		expect(manager.get('WITH_PADDING_QUOTES')).toBe('Hello!');
		expect(manager.get('WITH_NAME_PADDING')).toBe('Hello!');
		expect(manager.get('WITH_QUOTED_PADDING')).toBe(' Hello! ');
	});

	it('Can use another manager as a source', function() {
		const sourceA = new MemoryEnvironmentSource();
		const managerA = new EnvironmentManager(sourceA);
		const managerB = new EnvironmentManager(managerA);

		sourceA.set('inherited', 'true');
		expect(managerB.get('inherited')).toBe('true');
	});

	it('Supports prefixes', function() {
		const source = new MemoryEnvironmentSource();
		const manager = new EnvironmentManager(source, 'PREFIX_');

		source.set('PREFIX_TEST', '2');
		source.set('TEST', '1');

		expect(manager.get('TEST')).toBe('2');

		const rules = manager.rules({
			TEST: manager.schema.number()
		});

		expect(rules.TEST).toBe(2);
	});

	it('Supports applying environment to process.env', function() {
		const source = new MemoryEnvironmentSource();
		const manager = new EnvironmentManager(source);

		source.set('APPLY_TEST', 'process');
		expect(process.env.APPLY_TEST).toBe(undefined);

		manager.apply();
		expect(process.env.APPLY_TEST).toBe('process');
	});

	it('Supports applying environment to objects', function() {
		const source = new MemoryEnvironmentSource();
		const manager = new EnvironmentManager(source);
		const o: Record<string, string> = {};

		source.set('APPLY_TEST', 'object');
		expect(process.env.APPLY_TEST).not.toBe('object');
		expect(o.APPLY_TEST).toBe(undefined);

		manager.apply(o);
		expect(process.env.APPLY_TEST).not.toBe('object');
		expect(o.APPLY_TEST).toBe('object');
	});

	it('Supports validation without throwing errors', function() {
		const parsed = manager.rules({
			STRING: manager.schema.boolean(),
		}, false);

		expect(parsed.STRING).toBe(undefined);
	});
});
