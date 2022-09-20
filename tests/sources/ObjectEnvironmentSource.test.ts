import { ObjectEnvironmentSource } from '../../src/sources/ObjectEnvironmentSource';

describe('ObjectEnvironmentSource', function() {
	const sourceFromObject = new ObjectEnvironmentSource({
		'EXAMPLE': 'true'
	});

	const sourceFromMap = new ObjectEnvironmentSource(new Map([
		['EXAMPLE', 'true']
	]));

	it('Can check for variables', function() {
		expect(sourceFromObject.has('EXAMPLE')).toBe(true);
		expect(sourceFromMap.has('EXAMPLE')).toBe(true);

		expect(sourceFromObject.has('NOTFOUND')).toBe(false);
		expect(sourceFromMap.has('NOTFOUND')).toBe(false);
	});

	it('Can read variables', function() {
		expect(sourceFromObject.get('EXAMPLE')).toBe('true');
		expect(sourceFromMap.get('EXAMPLE')).toBe('true');

		expect(sourceFromObject.get('NOTFOUND')).toBe(undefined);
		expect(sourceFromMap.get('NOTFOUND')).toBe(undefined);
	});
});
