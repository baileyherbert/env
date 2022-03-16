import { EnvironmentManager } from '../src/EnvironmentManager';
import path from 'path';
import { FileEnvironmentSource, MemoryEnvironmentSource } from '../src/main';

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
		enum NumberEnum { A, B };

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
			STRING2: function(value) {
				return value + '!';
			}
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
			ENUM_NUMBER: NumberEnum.A,
			ENUM_CONST: 'a',
			STRING2: 'Hello world!'
		});
	});

	it('Can use another manager as a source', function() {
		const sourceA = new MemoryEnvironmentSource();
		const managerA = new EnvironmentManager(sourceA);
		const managerB = new EnvironmentManager(managerA);

		sourceA.set('inherited', 'true');
		expect(managerB.get('inherited')).toBe('true');
	});
});
