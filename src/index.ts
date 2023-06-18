/*
 * 🐻‍❄️🌲 @augu/pino-transport: Noel's opinionated logging transport for Pino
 * Copyright (c) 2023 Noel <cutie@floofy.dev>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { BaseFormatter, formatters } from './formatters';
import createAbstractTransport from 'pino-abstract-transport';
import { createSerializers } from './serializers';
import { Transform } from 'stream';
import SonicBoom from 'sonic-boom';
import pump from 'pump';

export { BaseFormatter, formatters };
export * as serializers from './serializers';

export { createSerializers };

export interface TransportOptions {
    transport?: BaseFormatter;
    json?: boolean;
    dest?: string | number;
}

const transport = (opts: TransportOptions = {}) =>
    createAbstractTransport(
        (stream) => {
            let selectedTransport: BaseFormatter;
            if (opts.json === true) {
                selectedTransport = new formatters.Json();
            } else if (opts.transport !== undefined) {
                selectedTransport = opts.transport;
            } else {
                selectedTransport = new formatters.Default();
            }

            const wrapper = new Transform({
                objectMode: true,
                autoDestroy: true,
                transform(chunk, _, cb) {
                    const line = selectedTransport.transform(typeof chunk === 'string' ? JSON.parse(chunk) : chunk);
                    cb(null, line);
                }
            });

            const destination = new SonicBoom({
                append: true,
                dest: opts.dest || 1
            });

            stream.on('unknown', (line) => destination.write(`${line}\n`));
            pump(stream, wrapper, destination);
        },
        { parse: 'lines' }
    );

export default transport;
