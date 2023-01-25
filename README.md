# 🐻‍❄️🌲 @augu/pino-transport

> _Noel's opinionated logging transport for [Pino](https://getpino.io)_

**@augu/pino-transport** is an opinionated logging transport for the [Pino](https://getpino.io) logging library. This was made to _not repeat_ what this library entails. If you like it, then install it now:

![default formatter](https://noel-is.gay/images/3d87e6a9.png)
![json formatter](https://noel-is.gay/images/f8d6645d.png)

```shell
$ npm i @augu/pino-transport
$ yarn add @augu/pino-transport
$ pnpm i @augu/pino-transport
```

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

You can create custom transports that the transport will transform the logs to.

```ts
import { BaseFormatter, type LogRecord } from '@augu/pino-transport';
import pino from 'pino';

class MyFormatter extends BaseFormatter {
  override transform(record: LogRecord) {
    return record.msg;
  }
}

const log = pino({
  transports: [
    {
      target: '@augu/pino-transport',
      options: {
        formatter: new MyFormatter()
      }
    }
  ]
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
    err: serializers.error,
    req: serializers.request,
    res: serializers.response
  }
});

log.info({ err: new Error('woof') }, 'waff');
```

## License

**@augu/pino-transport** is released under the **MIT License** with love by [Noel](https://floofy.dev)!
