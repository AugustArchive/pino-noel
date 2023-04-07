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

import { response as responseSerializer } from './response';
import { request as requestSerializer } from './request';
import * as err from './error';
import { hasOwnProperty } from '@noelware/utils';

export interface EnabledSerializers {
    /**
     * Whether if the Request serializer is enabled.
     */
    response: boolean;

    /**
     * Whether if the Request serializer is enabled.
     */
    request: boolean;

    /**
     * Whether if the Error serializer is enabled, or it if is, has
     * a `callsites` property to enable the Node.js callsites feature.
     */
    error: boolean | { callsites: boolean };

    /**
     * Allows `req` (request), `res` (response), and/or `err` (error) to be
     * used as a serializer.
     */
    allow: Partial<Record<'req' | 'res' | 'err', boolean>>;
}

/**
 * Type-safe way to configure Pino serializers with this library.
 */
export const createSerializers = (
    { request, response, error, allow: _allow }: Partial<EnabledSerializers> = {
        request: true,
        response: true,
        error: true,
        allow: { req: true, res: true, err: true }
    }
) => {
    const serializers: Record<string, any> = {};
    const allow = _allow || { req: true, res: true, err: true };

    if (request === true) {
        serializers.request = requestSerializer;
        if (hasOwnProperty(allow, 'req') && allow.req === true) {
            serializers.req = requestSerializer;
        }
    }

    if (response === true) {
        serializers.response = responseSerializer;
        if (hasOwnProperty(allow, 'res') && allow.res === true) {
            serializers.res = responseSerializer;
        }
    }

    if (error !== undefined) {
        const { callsites } = error === true ? { callsites: false } : (error as { callsites: boolean });
        serializers.error = err.createErrorSerializer(callsites);

        if (hasOwnProperty(allow, 'err') && allow.err === true) {
            serializers.err = err.createErrorSerializer(callsites);
        }
    }

    return serializers;
};

export * from './response';
export * from './request';
export * from './error';
