import { FileEnvironmentSource } from '../../src/main';
import path from 'path';

describe('FileEnvironmentSource', function() {
	const artifact = path.resolve(__dirname, '../artifacts/.env');
	const source = new FileEnvironmentSource(artifact);

	it('Can check for variables', function() {
		expect(source.has('STRING')).toBe(true);
		expect(source.has('NOTFOUND')).toBe(false);
	});

	it('Can read variables', function() {
		expect(source.get('STRING')).toBe('This is a string!');
		expect(source.get('NOTFOUND')).toBe(undefined);
	});
});
