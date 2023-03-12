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

export function deprecate<F extends (...args: any) => any, Args extends any[] = Parameters<F>, RT = ReturnType<F>>(
    func: F,
    removedIn: string,
    alternative: string
): (...args: Args) => RT {
    return (...args) => {
        process.emitWarning(`Method ${func.name || '(anonymous)'} is deprecated`, {
            code: 'DEPRECATION_WARNING',
            detail: `Method will be removed in ${removedIn}, please use ${alternative} instead!`
        });

        return func(...args);
    };
}
