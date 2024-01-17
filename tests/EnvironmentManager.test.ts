import { EnvironmentManager } from '../src/EnvironmentManager';
import { FileEnvironmentSource, MemoryEnvironmentSource, ObjectEnvironmentSource } from '../src/main';
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

	it('Supports conditional variables', function() {
		const source = new ObjectEnvironmentSource({
			CONDITION1: 'true',
			CONDITION2: 'false',
			DATA1: '1',
			DATA2: '2',
			DATA3: '3',
			DATA4: '4',
			DATA5: '5',
			DATA6: '6',
			DATA7: '7',
			DATA8: '8',
			DATA9: '9',
		});

		const manager = new EnvironmentManager(source);
		const parsed = manager.rules({
			// Two booleans read from the source
			CONDITION1: manager.schema.boolean(),
			CONDITION2: manager.schema.boolean(),

			// Two booleans with default values
			CONDITION3: manager.schema.boolean().optional(true),
			CONDITION4: manager.schema.boolean().optional(false),

			// One boolean with no value
			CONDITION5: manager.schema.boolean().optional(),

			// These variables should be undefined
			DATA1: manager.schema.string().when(() => false),
			DATA2: manager.schema.string().when(() => false).optional(),
			DATA8: manager.schema.string().when(e => e.CONDITION2).optional(),

			// These variables should use default values
			DATA3: manager.schema.string().when(() => false).optional('default'),
			DATA7: manager.schema.string().when(e => e.CONDITION2).optional('default'),

			// These variables should read from the source
			DATA4: manager.schema.string().when(() => true),
			DATA5: manager.schema.string().when(() => true).optional('default'),
			DATA6: manager.schema.string().when(e => e.CONDITION1).optional('default'),
			DATA9: manager.schema.string().when(e => e.CONDITION1),
		});

		expect(parsed).toMatchObject({
			CONDITION1: true,
			CONDITION2: false,

			CONDITION3: true,
			CONDITION4: false,
			CONDITION5: undefined,

			DATA1: undefined,
			DATA2: undefined,
			DATA8: undefined,

			DATA3: 'default',
			DATA7: 'default',

			DATA4: '4',
			DATA5: '5',
			DATA6: '6',
			DATA9: '9',
		});
	});

	it('Supports partial values', function() {
		const source = new ObjectEnvironmentSource({
			A: 'i',
			B: 'in',
			C: 'inf',
			D: 'info',
			E: 'IN',
			AMBIGUOUS_A: 't',
			AMBIGUOUS_B: 'trace',
			AMBIGUOUS_C: 'trace2',
		});

		const manager = new EnvironmentManager(source);
		const values = ['info', 'error', 'debug', 'warn', 'trace', 'trace2'] as const;

		enum LoggingLevel {
			INFO = 'info',
			ERROR = 'error',
			DEBUG = 'debug',
			WARN = 'warn',
			TRACE = 'trace',
			TRACE2 = 'trace2',
		};

		const parsedFromStrings = manager.rules({
			A: manager.schema.enum(values).allowPartial(),
			B: manager.schema.enum(values).allowPartial(),
			C: manager.schema.enum(values).allowPartial(),
			D: manager.schema.enum(values).allowPartial(),
			E: manager.schema.enum(values).allowPartial(),
			UNSET: manager.schema.enum(values).allowPartial().optional(),
			AMBIGUOUS_B: manager.schema.enum(values).allowPartial(),
			AMBIGUOUS_C: manager.schema.enum(values).allowPartial(),
		});

		const parsedFromEnum = manager.rules({
			A: manager.schema.enum(LoggingLevel).allowPartial(),
			B: manager.schema.enum(LoggingLevel).allowPartial(),
			C: manager.schema.enum(LoggingLevel).allowPartial(),
			D: manager.schema.enum(LoggingLevel).allowPartial(),
			E: manager.schema.enum(LoggingLevel).allowPartial(),
			UNSET: manager.schema.enum(values).allowPartial().optional(),
			AMBIGUOUS_B: manager.schema.enum(values).allowPartial(),
			AMBIGUOUS_C: manager.schema.enum(values).allowPartial(),
		});

		const parsedFromEnumWithValues = manager.rules({
			A: manager.schema.enum(LoggingLevel, true).allowPartial(),
			B: manager.schema.enum(LoggingLevel, true).allowPartial(),
			C: manager.schema.enum(LoggingLevel, true).allowPartial(),
			D: manager.schema.enum(LoggingLevel, true).allowPartial(),
			E: manager.schema.enum(LoggingLevel, true).allowPartial(),
			UNSET: manager.schema.enum(values).allowPartial().optional(),
			AMBIGUOUS_B: manager.schema.enum(values).allowPartial(),
			AMBIGUOUS_C: manager.schema.enum(values).allowPartial(),
		});

		expect(parsedFromStrings).toMatchObject({
			A: 'info',
			B: 'info',
			C: 'info',
			D: 'info',
			E: 'info',
			UNSET: undefined,
			AMBIGUOUS_B: 'trace',
			AMBIGUOUS_C: 'trace2',
		});

		expect(parsedFromEnum).toMatchObject({
			A: LoggingLevel.INFO,
			B: LoggingLevel.INFO,
			C: LoggingLevel.INFO,
			D: LoggingLevel.INFO,
			E: LoggingLevel.INFO,
			UNSET: undefined,
			AMBIGUOUS_B: LoggingLevel.TRACE,
			AMBIGUOUS_C: LoggingLevel.TRACE2,
		});

		expect(parsedFromEnumWithValues).toMatchObject({
			A: LoggingLevel.INFO,
			B: LoggingLevel.INFO,
			C: LoggingLevel.INFO,
			D: LoggingLevel.INFO,
			E: LoggingLevel.INFO,
			UNSET: undefined,
			AMBIGUOUS_B: LoggingLevel.TRACE,
			AMBIGUOUS_C: LoggingLevel.TRACE2,
		});

		expect(() => {
			manager.rules({
				AMBIGUOUS_A: manager.schema.enum(values).allowPartial()
			});
		}).toThrow('AMBIGUOUS_A must be one of');

		expect(() => {
			manager.rules({
				AMBIGUOUS_A: manager.schema.enum(LoggingLevel).allowPartial()
			});
		}).toThrow('AMBIGUOUS_A must be one of');

		expect(() => {
			manager.rules({
				AMBIGUOUS_A: manager.schema.enum(LoggingLevel, true).allowPartial()
			});
		}).toThrow('AMBIGUOUS_A must be one of');
	});
});
