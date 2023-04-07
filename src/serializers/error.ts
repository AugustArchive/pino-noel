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

export const originalErrorSymbol = Symbol.for('$noel:pino:serialization:originalError');
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
    stack?: SerializedCallsite[];

    /** The original {@link Error} that was thrown */
    [originalErrorSymbol]?: Error;
}

/**
 * Serializer factory for serializing JavaScript errors to objects that Pino can recognize
 * @param callsites If the payload should include the callsites (excluding Node internals)
 * @returns A serializer that can serialize JavaScript errors to what Pino can recognize.
 */
export const createErrorSerializer =
    (callsites = true) =>
    (error: Error): SerializedError => {
        if (!callsites) {
            const result: SerializedError = {
                name: error.name,
                message: error.message
            };

            Object.defineProperty(result, originalErrorSymbol, {
                enumerable: false,
                get() {
                    return error;
                },

                set(_) {
                    throw new Error('Readonly reference.');
                }
            });

            return result;
        }

        const stack = useCallsites(error);
        const result: SerializedError = {
            name: error.name,
            message: error.message,
            stack:
                stack !== undefined
                    ? stack
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
                    : []
        };

        Object.defineProperty(result, originalErrorSymbol, {
            enumerable: false,
            get() {
                return error;
            },

            set(_) {
                throw new Error('Readonly reference.');
            }
        });

        return result;
    };
