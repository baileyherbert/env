import * as Main from '../src/main';

describe('main', function() {
	it('Exports all required items', function() {
		// Classes
		expect(typeof Main.EnvironmentManager).toBe('function');
		expect(typeof Main.EnvironmentSource).toBe('function');
		expect(typeof Main.FileEnvironmentSource).toBe('function');
		expect(typeof Main.MemoryEnvironmentSource).toBe('function');
		expect(typeof Main.ProcessEnvironmentSource).toBe('function');
		expect(typeof Main.ObjectEnvironmentSource).toBe('function');
		expect(typeof Main.StringEnvironmentSource).toBe('function');

		// Errors
		expect(typeof Main.EnvironmentError).toBe('function');
		expect(typeof Main.EnvironmentValidationError).toBe('function');
		expect(typeof Main.EnvironmentParseError).toBe('function');

		// Functions
		expect(typeof Main.parseEnv).toBe('function');

		// Variables
		expect(typeof Main.Env).toBe('object');
	});

	describe('Env', function() {
		it('Can read process variables', function() {
			process.env.EXAMPLE = 'testing';
			expect(Main.Env.get('EXAMPLE')).toBe('testing');
		});
	});
});
