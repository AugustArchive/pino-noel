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

import { response, SerializedError, SerializedRequest, SerializedResponse } from '../serializers';
import { BaseFormatter, type LogRecord } from './base';
import { levelLabelNames, omit } from '../utils';
import { hasOwnProperty, Lazy } from '@noelware/utils';
import { EOL, userInfo } from 'os';
import { basename } from 'path';

// this is for tsup for not converting colorette to an
// default export
import colors = require('colorette');

const defaultLevelColors: Record<number, string> = {
  // trace
  10: colors.isColorSupported
    ? `\x1b[38;2;163;182;138m${levelLabelNames[10].toUpperCase().padEnd(5, ' ')}\x1b[0m`
    : levelLabelNames[10].toUpperCase().padEnd(5, ' '),

  // debug
  20: colors.isColorSupported
    ? `\x1b[38;2;163;182;138m${levelLabelNames[20].toUpperCase().padEnd(5, ' ')}\x1b[0m`
    : levelLabelNames[20].toUpperCase().padEnd(5, ' '),

  // info
  30: colors.isColorSupported
    ? `\x1b[38;2;178;157;243m${levelLabelNames[30].toUpperCase().padEnd(5, ' ')}\x1b[0m`
    : levelLabelNames[30].toUpperCase().padEnd(5, ' '),

  // warning
  40: colors.isColorSupported
    ? `\x1b[38;2;234;234;208m${levelLabelNames[40].toUpperCase().padEnd(5, ' ')}\x1b[0m`
    : levelLabelNames[40].toUpperCase().padEnd(5, ' '),

  // error
  50: colors.isColorSupported
    ? `\x1b[38;2;153;75;104m${levelLabelNames[50].toUpperCase().padEnd(5, ' ')}\x1b[0m`
    : levelLabelNames[50].toUpperCase().padEnd(5, ' '),

  // fatal
  60: colors.isColorSupported
    ? `\x1b[38;2;166;76;76m${levelLabelNames[60].toUpperCase().padEnd(5, ' ')}\x1b[0m`
    : levelLabelNames[60].toUpperCase().padEnd(5, ' ')
};

const defaultDateTimeFormatter = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
  timeStyle: 'long',
  timeZone: process.env.TZ || 'America/Phoenix'
});

const gray = (t: string) => (colors.isColorSupported ? `\x1b[38;2;134;134;134m${t}\x1b[0m` : t);

export interface DefaultFormatterOptions {
  targetPadding?: number;
  formatter?: Intl.DateTimeFormat;
  levels?: Record<number, string>;
}

export class DefaultFormatter extends BaseFormatter {
  #username: Lazy<string> = new Lazy(() => {
    const info = userInfo();
    return info.username || '(unknown)';
  });

  #dateTimeFormatter: Intl.DateTimeFormat;
  #targetPadding: number;
  #levels: Record<number, string>;

  constructor(
    options: DefaultFormatterOptions = {
      targetPadding: 30,
      formatter: defaultDateTimeFormatter,
      levels: defaultLevelColors
    }
  ) {
    super();

    this.#dateTimeFormatter = options.formatter || defaultDateTimeFormatter;
    this.#targetPadding = options.targetPadding || 30;
    this.#levels = options.levels || defaultLevelColors;
  }

  override transform(record: LogRecord) {
    let buf = gray(`[${this.#dateTimeFormatter.format(new Date(record.time))}] `);
    buf += gray('[');
    {
      const level = colors.bold(this.#levels[record.level]);
      const hostname = colors.magenta(`${this.#username.get()}@${record.hostname}`);
      const pid = colors.isColorSupported ? `\x1b[38;2;169;147;227m${record.pid}\x1b[0m` : record.pid;
      const target = colors.isColorSupported
        ? `\x1b[38;2;120;231;255m${(record.name || 'root').padEnd(this.#targetPadding, ' ')}\x1b[0m`
        : (record.name || 'root').padEnd(this.#targetPadding, ' ');

      buf += `${level} ${target} ${hostname} ${gray('(')}${pid}${gray(')')}`.trim();
    }
    buf += gray(']');

    // insert all the other attributes here
    {
      buf += ' ';
      const attrs = Object.entries(
        omit(record, [
          'hostname',
          'level',
          'msg',
          'time',
          'error',
          'req',
          'res',
          'err',
          'pid',
          'name',
          'reqId',
          'responseTime'
        ])
      )
        .map(([key, value]) => gray(`[${key}=>${value}]`))
        .join(' ');

      if (attrs.length > 0) {
        buf += attrs;
        buf += ' ';
      }
    }

    // append the message if we have it
    if (hasOwnProperty(record, 'msg')) {
      buf += record.msg;
    }

    if (hasOwnProperty(record, 'req')) {
      const req: SerializedRequest = record.req;
      const reqId: string | null = hasOwnProperty(record, 'reqId') ? record.reqId : req.id;

      buf += ` ${gray(`${req.method.toUpperCase()} ${req.url}`)}${reqId !== null ? ` ${gray(`[${reqId}]`)}` : ''}`;
    }

    if (hasOwnProperty(record, 'res')) {
      const res: SerializedResponse = record.res;
      const time = hasOwnProperty(record, 'responseTime') ? Number(record.responseTime) : null;
      const reqId: string | null = hasOwnProperty(record, 'reqId') ? record.reqId : res.request.id;
      const { request: req } = res;

      buf += ` ${gray(`${req.method.toUpperCase()} ${req.url}`)}${
        reqId !== null ? ` ${gray(`[${reqId}]`)}` : ''
      } -> ${gray(`${res.status} ${res.status_message}`)}${time !== null ? ` ${gray(`[~${time.toFixed(2)}ms]`)}` : ''}`;
    }

    if (hasOwnProperty(record, 'err') || hasOwnProperty(record, 'error')) {
      const error: SerializedError = hasOwnProperty(record, 'err') ? record.err : record.error;
      buf += EOL;
      buf += `${colors.bold(colors.red(error.name))} :: ${error.message}${EOL}`;

      if (error.stack !== undefined) {
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
    }

    return buf.trim() + EOL;
  }
}
