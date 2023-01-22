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
import { hasOwnProperty, Lazy } from '@noelware/utils';

// this is for tsup for not converting colorette to an
// default export
import colors = require('colorette');
import { SerializedError } from '../serializers';
import { basename } from 'path';

const username = new Lazy(() => {
  const info = userInfo();
  return info.username || '(unknown)';
});

// colours are from
// https://github.com/charted-dev/charted/blob/1019f58768b881b55a6e5a0f6289e5b1f99ed2c4/modules/logging/src/main/java/org/noelware/charted/logback/composite/LogLevelColorComposite.java
const levels: Record<number, string> = {
  10: colors.isColorSupported
    ? `\x1b[38;2;156;156;252m${levelLabelNames[10].toUpperCase().padEnd(5, ' ')}\x1b[0m`
    : levelLabelNames[10].toUpperCase().padEnd(5, ' '),
  20: colors.isColorSupported
    ? `\x1b[38;2;241;204;209m${levelLabelNames[20].toUpperCase().padEnd(5, ' ')}\x1b[0m`
    : levelLabelNames[20].toUpperCase().padEnd(5, ' '),
  30: colors.isColorSupported
    ? `\x1b[38;2;81;81;140m${levelLabelNames[30].toUpperCase().padEnd(5, ' ')}\x1b[0m`
    : levelLabelNames[30].toUpperCase().padEnd(5, ' '),
  40: colors.isColorSupported
    ? `\x1b[38;2;234;234;208m${levelLabelNames[40].toUpperCase().padEnd(5, ' ')}\x1b[0m`
    : levelLabelNames[40].toUpperCase().padEnd(5, ' '),
  50: colors.isColorSupported
    ? `\x1b[38;2;166;76;76m${levelLabelNames[50].toUpperCase().padEnd(5, ' ')}\x1b[0m`
    : levelLabelNames[50].toUpperCase().padEnd(5, ' '),
  60: colors.isColorSupported
    ? `\x1b[38;2;166;76;76m${levelLabelNames[60].toUpperCase().padEnd(5, ' ')}\x1b[0m`
    : levelLabelNames[60].toUpperCase().padEnd(5, ' ')
};

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
  timeStyle: 'long',
  timeZone: process.env.TZ || 'America/Phoenix'
});

export class DefaultFormatter extends BaseFormatter {
  override transform(record: LogRecord) {
    let buf = colors.gray(`[${dateFormatter.format(new Date(record.time))}] `);
    buf += colors.gray('[');
    {
      buf += `${colors.bold(levels[record.level])} ${colors.gray('|')} ${colors.magenta(
        `${username.get()}@${record.hostname}`
      )}${colors.gray('/')}${colors.magenta(record.pid)}`;
    }
    buf += colors.gray(']');

    {
      buf += ' ';
      // all of the other keys will be presented at tne end of the string
      // req, err/error, and res won't appear since it'll make it weird appearing here.
      const attrs = Object.entries(
        omit(record, ['hostname', 'level', 'msg', 'time', 'error', 'req', 'res', 'err', 'pid'])
      )
        .map(([key, value]) => colors.gray(`[${key} ~> ${value}]`))
        .join(' ');
      if (attrs.length > 0) {
        buf += attrs;
        buf += ' ';
      }
    }

    if (hasOwnProperty(record, 'msg')) {
      buf += record.msg;
    }

    if (hasOwnProperty(record, 'err') || hasOwnProperty(record, 'error')) {
      const error: SerializedError = hasOwnProperty(record, 'err') ? record.err : record.error;
      buf += EOL;
      buf += `${colors.bold(colors.red(error.name))} :: ${error.message}${EOL}`;

      const cache: string[] = [];

      for (const item of error.stack) {
        if (cache.includes(item.file)) {
          buf += `       ${colors.dim('~')} ${colors.bold(colors.dim(`${item.file}:${item.line}:${item.col}`))}`;
          buf += EOL;
        } else {
          cache.push(item.file);
          buf += `   • ${colors.dim(`in ${basename(item.file)}:${item.line}:${item.col}`)}`;

          if (item.native) {
            buf += ' (native method)';
          }

          buf += EOL;
        }
      }
    }

    return buf.trim() + EOL;
  }
}
