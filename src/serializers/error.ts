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

import { useCallsites } from '../utils';

export interface SerializedCallsite {
  eval_invocation: boolean;
  this_context: string;
  constructor: boolean;
  function: string;
  toplevel: boolean;
  native: boolean;
  method: string;
  file: string;
  line: number;
  col: number;
}

export interface SerializedError {
  name: string;
  message: string;
  stack: SerializedCallsite[];
}

export const error = (error: Error): SerializedError => {
  const stack = useCallsites(error);
  return {
    name: error.name,
    message: error.message,
    stack: stack
      .filter((s) => !s.getFileName()?.startsWith('node:') ?? true)
      .map((site) => ({
        eval_invocation: site.isEval(),
        this_context: site.getTypeName() || 'Object',
        constructor: site.isConstructor(),
        function: site.getFunctionName() || '<anonymous>',
        toplevel: site.isToplevel(),
        native: site.isNative(),
        method: site.getMethodName() || '<unknown>',
        file: site.getFileName() || '',
        line: site.getLineNumber() || -1,
        col: site.getColumnNumber() || -1
      }))
  };
};
