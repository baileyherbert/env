import { MemoryEnvironmentSource } from '../../src/main';

describe('MemoryEnvironmentSource', function() {
	const source = new MemoryEnvironmentSource();

	it('Can set variables', function() {
		source.set('EXAMPLE', 'true');
	});

	it('Can check for variables', function() {
		expect(source.has('EXAMPLE')).toBe(true);
		expect(source.has('NOTFOUND')).toBe(false);
	});

	it('Can read variables', function() {
		expect(source.get('EXAMPLE')).toBe('true');
		expect(source.get('NOTFOUND')).toBe(undefined);
	});
});
