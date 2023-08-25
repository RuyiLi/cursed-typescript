/*
  151 - Query String Parser
  -------
  by Pig Fang (@g-plane) #extreme #template-literal

  ### Question

  You're required to implement a type-level parser to parse URL query string into a object literal type.

  Some detailed requirements:

  - Value of a key in query string can be ignored but still be parsed to `true`. For example, `'key'` is without value, so the parser result is `{ key: true }`.
  - Duplicated keys must be merged into one. If there are different values with the same key, values must be merged into a tuple type.
  - When a key has only one value, that value can't be wrapped into a tuple type.
  - If values with the same key appear more than once, it must be treated as once. For example, `key=value&key=value` must be treated as `key=value` only.

  > View on GitHub: https://tsch.js.org/151
*/

type ResType = Record<string, Array<string | boolean>>

type Merge<A, B> = { 
  [K in keyof (A & B)]: 
    K extends keyof A
    ? A[K]
    : K extends keyof B
      ? B[K]
      : never 
}

type ParseQueryTerm<T extends string, Res extends ResType> = 
  T extends `${infer K}=${infer V}`
  ? K extends keyof Res
    ? Merge<Omit<Res, K>, { [key in K]: [...Res[K], V] }>
    : Merge<Res, { [key in K]: [V] }>
  : T extends ""
    ? {}
    : T extends keyof Res 
      ? Merge<Omit<Res, T>, { [key in T]: [...Res[T], true] }>
      : Merge<Res, { [key in T]: [true] }>

type ParseQueryStringHelper<S extends string, Res extends ResType = {}> =
  S extends `${infer L}&${infer R}`
  ? ParseQueryStringHelper<R, ParseQueryTerm<L, Res>>
  : ParseQueryTerm<S, Res>

type RemoveDupes<A extends any[], Seen extends any[] = []> =
  A extends [infer L, ...infer R]
  ? L extends Seen[number]
    ? RemoveDupes<R, Seen>
    : RemoveDupes<R, [...Seen, L]>
  : Seen

type ParseQueryString<S extends string> =
  ParseQueryStringHelper<S> extends infer Res extends ResType
  ? { 
      [K in keyof Res]:
        RemoveDupes<Res[K]> extends [infer X]
        ? X
        : RemoveDupes<Res[K]>
    }
  : never

// ================================
// ======== BEGIN TESTING =========
// ================================

import type { Equals, Expect } from '../util'

type TestCases = [
  Expect<Equals<ParseQueryString<''>, {}>>,
  Expect<Equals<ParseQueryString<'k1'>, { k1: true }>>,
  Expect<Equals<ParseQueryString<'k1&k1'>, { k1: true }>>,
  Expect<Equals<ParseQueryString<'k1&k2'>, { k1: true; k2: true }>>,
  Expect<Equals<ParseQueryString<'k1=v1'>, { k1: 'v1' }>>,
  Expect<Equals<ParseQueryString<'k1=v1&k1=v2'>, { k1: ['v1', 'v2'] }>>,
  Expect<Equals<ParseQueryString<'k1=v1&k2=v2'>, { k1: 'v1'; k2: 'v2' }>>,
  Expect<Equals<ParseQueryString<'k1=v1&k2=v2&k1=v2'>, { k1: ['v1', 'v2']; k2: 'v2' }>>,
  Expect<Equals<ParseQueryString<'k1=v1&k2'>, { k1: 'v1'; k2: true }>>,
  Expect<Equals<ParseQueryString<'k1=v1&k1=v1'>, { k1: 'v1' }>>,
  Expect<Equals<ParseQueryString<'k1=v1&k1=v2&k1=v1'>, { k1: ['v1', 'v2'] }>>,
  Expect<Equals<ParseQueryString<'k1=v1&k2=v1&k1=v2&k1=v1'>, { k1: ['v1', 'v2']; k2: 'v1' }>>,
  Expect<Equals<ParseQueryString<'k1=v1&k2=v2&k1=v2&k1=v3'>, { k1: ['v1', 'v2', 'v3']; k2: 'v2' }>>,
  Expect<Equals<ParseQueryString<'k1=v1&k1'>, { k1: ['v1', true] }>>,
  Expect<Equals<ParseQueryString<'k1&k1=v1'>, { k1: [true, 'v1'] }>>,
]