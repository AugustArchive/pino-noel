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

import { BaseFormatter, type LogRecord } from './base';
import { levelLabelNames, omit } from '../utils';
import { EOL, userInfo } from 'os';
import { Lazy } from '@noelware/utils';

const username = new Lazy(() => {
  const info = userInfo();
  return info.username || '(unknown)';
});

export class JsonFormatter extends BaseFormatter {
  override transform(record: LogRecord) {
    const payload: Record<string, any> = {
      '@timestamp': new Date(record.time).toISOString(),
      'log.level': levelLabelNames[record.level],
      'log.name': record.name || 'root',
      hostname: `${username.get()}@${record.hostname}`,
      message: record.msg
    };

    const rest = omit(record, ['hostname', 'level', 'msg', 'time', 'name']);
    return (
      JSON.stringify({
        ...payload,
        ...rest
      }) + EOL
    );
  }
}
