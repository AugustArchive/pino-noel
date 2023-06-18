# 🐻‍❄️🌲 @augu/pino-transport

> _Noel's opinionated logging transport for [Pino](https://getpino.io)_

**@augu/pino-transport** is an opinionated logging transport for the [Pino](https://getpino.io) logging library. This was made to _not repeat_ what this library entails. If you like it, then install it with:

![default formatter](https://noel-is.gay/images/5d85a88c.png)
![json formatter](https://noel-is.gay/images/e9bc906a.png)

```shell
$ npm i @augu/pino-transport
$ yarn add @augu/pino-transport
$ pnpm i @augu/pino-transport
```

## Limitations

-   The library expects you to use `msg` instead anything set in the `name` options for `pino()`.

## Usage

```ts
import pino from 'pino';

const log = pino({
    transports: [
        {
            target: '@augu/pino-transport',
            options: {
                json: true
            }
        }
    ]
});

log.info('Hello, world!');
```

## Custom Transports

You can create custom transports that the transport will transform the logs to. You will need to create a second file that will be serialized to the proper value instead of a plain object; [related issue (pinojs/pino#262)](https://github.com/pinojs/pino-pretty/issues/262)

```ts
// transport.js
import noelPino, { BaseFormatter, type LogRecord } from '@augu/pino-transport';

class MyFormatter extends BaseFormatter {
    override transform(record: LogRecord) {
        return record.msg;
    }
}

export default (options) =>
    noelPino({
        ...options,
        transport: new MyFormatter()
    });

// main.js
import pino from 'pino';

const log = pino({
    transport: {
        target: './transport.js'
    }
});

log.info('Hello, world!');
// => "Hello, world!" is printed instead
```

## Pino Serializers

This library also comes with custom serializers that I recommend setting in the `serializers` option when creating a root Pino logger since it will work better with the Default and Json formatters.

```ts
import { serializers } from '@augu/pino-transport';
import pino from 'pino';

const log = pino({
    serializers: {
        err: serializers.createErrorSerializer(),
        req: serializers.request,
        res: serializers.response
    }
});

log.info({ err: new Error('woof') }, 'waff');
```

In **1.3.0**, the library provides a `createSerializers` method to create serializers type-safely:

```ts
import { createSerializers } from '@augu/pino-transport';
import pino from 'pino';

const log = pino({
    serializers: createSerializers({
        // Enables the request serializer for `request` from the log record.
        request: false,

        // Enables the response serializer for `response` from the log record.
        response: false,

        // Enables the error serializer for `error` from the log record.
        error: true,

        // List of easier-to-write names when passing in from the log
        // record.
        allow: {
            req: false,
            res: false,
            err: true
        }
    })
});

log.info({ err: new Error('woof') }, 'waff');
```

## License

**@augu/pino-transport** is released under the **MIT License** with love by [Noel](https://floofy.dev)!
