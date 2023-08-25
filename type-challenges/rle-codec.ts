/*
  14188 - Run-length encoding
  -------
  by Hen Hedymdeith (@alfaproxima) #hard

  ### Question

  Given a `string` sequence of a letters f.e. `AAABCCXXXXXXY`. Return run-length encoded string `3AB2C6XY`.
  Also make a decoder for that string.

  > View on GitHub: https://tsch.js.org/14188
*/

type Repeat<S extends string, N extends number, C extends 0[] = [0]> =
  number extends N
  ? never
  : N extends C['length']
    ? S
    : `${S}${Repeat<S, N, [0, ...C]>}`

namespace RLE {
  export type Encode<S extends string, C extends 0[] = [0]> = 
    S extends `${infer L}${infer R}`
    ? R extends `${L}${infer _R}`
      ? Encode<R, [0, ...C]>
      : C['length'] extends 1
        ? `${L}${Encode<R, [0]>}`
        : `${C['length']}${L}${Encode<R, [0]>}`
    : ''
    
  export type Decode<S extends string> =
    S extends `${infer L}${infer R}`
    ? L extends `${infer X extends number}`
      ? R extends `${infer C}${infer W}`
        ? `${Repeat<C, X>}${Decode<W>}`
        : ''
      : `${L}${Decode<R>}`
    : ''
}

// ================================
// ======== BEGIN TESTING =========
// ================================

import type { Equals, Expect } from '../util'

type TestCases = [
  Expect<Equals<RLE.Encode<'AAABCCXXXXXXY'>, '3AB2C6XY'>>,
  Expect<Equals<RLE.Decode<'3AB2C6XY'>, 'AAABCCXXXXXXY'>>,
]