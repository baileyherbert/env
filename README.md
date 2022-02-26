# Env

This package makes it simple to retrieve, manage, validate, and assign types to environment variables.

## Installation

```
npm install @baileyherbert/env
```

After installing the package, you can import the global `Env` variable which automatically reads environment variables
from `process.env`, as well as from a `.env` file in the current working directory if it exists.

```ts
import { Env } from '@baileyherbert/env';
```

## Documentation

### Get values

Retrieve the raw string value of a variable (or undefined if not set):

```ts
Env.get('VARNAME');
```

Retrieve the value of a variable with a default value. The string value will be converted to the same type as the
default value:

```ts
Env.get('VARNAME', 0); // always a number
Env.get('VARNAME', false); // always a boolean
```

Note that if a default value is supplied, and the value of the variable cannot be converted to that type, an instance
of `EnvironmentValidationError` will be thrown.

### Validation

In most cases, you should have a file within your application that defines all known environment variables and their
acceptable format, like below:

```ts
export const Environment = Env.rules({
	DRIVER: Env.schema.enum(['mysql', 'sqlite'] as const),
	HOSTNAME: Env.schema.string().optional('localhost'),
	PORT: Env.schema.number().optional(3306),
	USERNAME: Env.schema.string(),
	PASSWORD: Env.schema.string()
});
```

You can then import the file across your application and retrieve the parsed values:

```ts
const driver = Environment.DRIVER; // 'mysql' | 'sqlite'
const host = Environment.HOSTNAME; // string
```

#### String variables

```ts
Env.schema.string()
```

#### Number variables

```ts
Env.schema.number()
```

#### Boolean variables

```ts
Env.schema.boolean()
```

#### Enum variables

You can enumerate acceptable strings or numbers directly using `as const`:

```ts
Env.schema.enum(['option1', 'option2', ...] as const)
```

You can also supply an actual enum object, which supports both string and number values:

```ts
enum Values { A, B };
Env.schema.enum(Values)
```

#### Optional variables

To mark an environment variable as optional, call the `optional()` method on it. This will automatically add `undefined`
to the union type in your final environment object.

```ts
Env.schema.string().optional()
```

You can also provide a default value, which will avoid adding `undefined` to the union type.

```ts
Env.schema.string().optional('default')
```
