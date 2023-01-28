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

import { type SerializedRequest, request } from './request';
import { ServerResponse, STATUS_CODES } from 'http';
import { hasOwnProperty } from '@noelware/utils';

export interface SerializedResponse {
  status: number;
  status_message: string;
  headers: Record<string, string>;
  request: SerializedRequest;
}

export const response = (resp: ServerResponse): SerializedResponse => {
  // @ts-ignore
  // This is for fastify usage
  if (hasOwnProperty(resp, 'raw')) {
    // @ts-ignore
    resp = resp.raw;
  }

  return {
    status: resp.statusCode,
    status_message: resp.statusMessage || STATUS_CODES[resp.statusCode] || 'Unknown',
    headers: resp.getHeaders() as any,
    request: request(resp.req)
  };
};
