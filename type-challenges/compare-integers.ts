/*
  274 - Integers Comparator
  -------
  by Pig Fang (@g-plane) #extreme #template-literal #math

  ### Question

  Implement a type-level integers comparator. We've provided an enum for indicating the comparison result, like this:

  - If `a` is greater than `b`, type should be `Comparison.Greater`.
  - If `a` and `b` are equal, type should be `Comparison.Equal`.
  - If `a` is lower than `b`, type should be `Comparison.Lower`.

  **Note that `a` and `b` can be positive integers or negative integers or zero, even one is positive while another one is negative.**

  > View on GitHub: https://tsch.js.org/274
*/

enum Comparison {
  Greater,
  Equal,
  Lower,
}

type ComparatorUnsigned<A extends number, B extends Number, AC extends 0[] = [], BC extends 0[] = []> =
  AC['length'] extends A
  ? BC['length'] extends B
    ? Comparison.Equal
    : Comparison.Lower
  : BC['length'] extends B
    ? Comparison.Greater
    : ComparatorUnsigned<A, B, [...AC, 0], [...BC, 0]>

type Comparator<A extends number, B extends number> =
  `${A}` extends `-${infer UA extends number}`
  ? `${B}` extends `-${infer UB extends number}`
    ? { [Comparison.Lower]: Comparison.Greater, [Comparison.Equal]: Comparison.Equal, [Comparison.Greater]: Comparison.Lower }[ComparatorUnsigned<UA, UB>]
    : Comparison.Lower
  : `${B}` extends `-${infer _UB}`
    ? Comparison.Greater
    : ComparatorUnsigned<A, B>

// ================================
// ======== BEGIN TESTING =========
// ================================

import type { Expect, Equals } from '../util'

type TestCases = [
  Expect<Equals<Comparator<1, 2>, Comparison.Lower>>,
  Expect<Equals<Comparator<2, 1>, Comparison.Greater>>,
  Expect<Equals<Comparator<1, 1>, Comparison.Equal>>,
  Expect<Equals<Comparator<0, 0>, Comparison.Equal>>,
  Expect<Equals<Comparator<0, 1>, Comparison.Lower>>,
  Expect<Equals<Comparator<1, 0>, Comparison.Greater>>,
  Expect<Equals<Comparator<0, -1>, Comparison.Greater>>,
  Expect<Equals<Comparator<-1, 0>, Comparison.Lower>>,
  Expect<Equals<Comparator<-1, -1>, Comparison.Equal>>,
  Expect<Equals<Comparator<-1, 1>, Comparison.Lower>>,
  Expect<Equals<Comparator<1, -1>, Comparison.Greater>>,
  Expect<Equals<Comparator<2, -1>, Comparison.Greater>>,
  Expect<Equals<Comparator<-1, 2>, Comparison.Lower>>,
  Expect<Equals<Comparator<-2, 1>, Comparison.Lower>>,
  Expect<Equals<Comparator<-2, -1>, Comparison.Lower>>,
  Expect<Equals<Comparator<-1, -2>, Comparison.Greater>>,
  Expect<Equals<Comparator<0, -2>, Comparison.Greater>>,
  Expect<Equals<Comparator<-2, 0>, Comparison.Lower>>,

  Expect<Equals<Comparator<5, 5>, Comparison.Equal>>,
  Expect<Equals<Comparator<5, 6>, Comparison.Lower>>,
  Expect<Equals<Comparator<5, 8>, Comparison.Lower>>,
  Expect<Equals<Comparator<5, 0>, Comparison.Greater>>,
  Expect<Equals<Comparator<-5, 0>, Comparison.Lower>>,
  Expect<Equals<Comparator<0, 0>, Comparison.Equal>>,
  Expect<Equals<Comparator<0, -5>, Comparison.Greater>>,
  Expect<Equals<Comparator<5, -3>, Comparison.Greater>>,
  Expect<Equals<Comparator<5, -7>, Comparison.Greater>>,
  Expect<Equals<Comparator<-5, -7>, Comparison.Greater>>,
  Expect<Equals<Comparator<-5, -3>, Comparison.Lower>>,
  Expect<Equals<Comparator<-25, -30>, Comparison.Greater>>,
  Expect<Equals<Comparator<15, -23>, Comparison.Greater>>,
  Expect<Equals<Comparator<40, 37>, Comparison.Greater>>,
  Expect<Equals<Comparator<-36, 36>, Comparison.Lower>>,
  Expect<Equals<Comparator<27, 27>, Comparison.Equal>>,
  Expect<Equals<Comparator<-38, -38>, Comparison.Equal>>,

  Expect<Equals<Comparator<1, 100>, Comparison.Lower>>,
  Expect<Equals<Comparator<100, 1>, Comparison.Greater>>,
  Expect<Equals<Comparator<-100, 1>, Comparison.Lower>>,
  Expect<Equals<Comparator<1, -100>, Comparison.Greater>>,
  Expect<Equals<Comparator<-100, -1>, Comparison.Lower>>,
  Expect<Equals<Comparator<-1, -100>, Comparison.Greater>>,

  // Extra tests if you like to challenge yourself!
  // Expect<Equals<Comparator<9007199254740992, 9007199254740992>, Comparison.Equal>>,
  // Expect<Equals<Comparator<-9007199254740992, -9007199254740992>, Comparison.Equal>>,
  // Expect<Equals<Comparator<9007199254740991, 9007199254740992>, Comparison.Lower>>,
  // Expect<Equals<Comparator<9007199254740992, 9007199254740991>, Comparison.Greater>>,
  // Expect<Equals<Comparator<-9007199254740992, -9007199254740991>, Comparison.Lower>>,
  // Expect<Equals<Comparator<-9007199254740991, -9007199254740992>, Comparison.Greater>>,
]