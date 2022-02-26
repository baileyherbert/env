import { ProcessEnvironmentSource } from '../../src/main';

describe('ProcessEnvironmentSource', function() {
	const source = new ProcessEnvironmentSource();

	process.env.EXAMPLE = 'true';

	it('Can check for variables', function() {
		expect(source.has('EXAMPLE')).toBe(true);
		expect(source.has('NOTFOUND')).toBe(false);
	});

	it('Can read variables', function() {
		expect(source.get('EXAMPLE')).toBe('true');
		expect(source.get('NOTFOUND')).toBe(undefined);
	});
});
