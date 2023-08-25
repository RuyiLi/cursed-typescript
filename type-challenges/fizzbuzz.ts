/*
  14080 - FizzBuzz
  -------
  by Lee Crosby (@Cygnut) #hard #array #math #infer

  ### Question

  The FizzBuzz problem is a classic test given in coding interviews. The task is simple:

  Print integers 1 to N, except:

  - Print "Fizz" if an integer is divisible by 3;
  - Print "Buzz" if an integer is divisible by 5;
  - Print "FizzBuzz" if an integer is divisible by both 3 and 5.

  For example, for N = 20, the output should be:
  `1, 2, Fizz, 4, Buzz, Fizz, 7, 8, Fizz, Buzz, 11, Fizz, 13, 14, FizzBuzz, 16, 17, Fizz, 19, Buzz`

  In the challenge below, we will want to generate this as an array of string literals.

  For large values of N, you will need to ensure that any types generated do so efficiently (e.g. by
  correctly using the tail-call optimisation for recursion).

  > View on GitHub: https://tsch.js.org/14080
*/

type Div3<N extends number, C extends 0[] = []> =
  C['length'] extends N
  ? true
  : [...C, 0]['length'] extends N
    ? false
    : [...C, 0, 0]['length'] extends N
      ? false
      : Div3<N, [...C, 0, 0, 0]>

type Div5<N extends number> =
  `${N}` extends `${infer L}0` | `${infer L}5`
  ? true
  : false

type FizzBuzz<N extends number, C extends 0[] = [0], Res extends string[] = []> =
  Res['length'] extends N
  ? Res
  : Div3<C['length']> extends true
    ? Div5<C['length']> extends true
      ? FizzBuzz<N, [...C, 0], [...Res, 'FizzBuzz']>
      : FizzBuzz<N, [...C, 0], [...Res, 'Fizz']>
    : Div5<C['length']> extends true
      ? FizzBuzz<N, [...C, 0], [...Res, 'Buzz']>
      : FizzBuzz<N, [...C, 0], [...Res, `${C['length']}`]>

// ================================
// ======== BEGIN TESTING =========
// ================================

import type { Equals, Expect } from '../util'

type TestCases = [
  Expect<Equals<FizzBuzz<1>, ['1']>>,
  Expect<Equals<FizzBuzz<5>, ['1', '2', 'Fizz', '4', 'Buzz']>>,
  Expect<Equals<FizzBuzz<20>, [
    '1',
    '2',
    'Fizz',
    '4',
    'Buzz',
    'Fizz',
    '7',
    '8',
    'Fizz',
    'Buzz',
    '11',
    'Fizz',
    '13',
    '14',
    'FizzBuzz',
    '16',
    '17',
    'Fizz',
    '19',
    'Buzz',
  ]>>,
  Expect<Equals<FizzBuzz<100>, [
    '1',
    '2',
    'Fizz',
    '4',
    'Buzz',
    'Fizz',
    '7',
    '8',
    'Fizz',
    'Buzz',
    '11',
    'Fizz',
    '13',
    '14',
    'FizzBuzz',
    '16',
    '17',
    'Fizz',
    '19',
    'Buzz',
    'Fizz',
    '22',
    '23',
    'Fizz',
    'Buzz',
    '26',
    'Fizz',
    '28',
    '29',
    'FizzBuzz',
    '31',
    '32',
    'Fizz',
    '34',
    'Buzz',
    'Fizz',
    '37',
    '38',
    'Fizz',
    'Buzz',
    '41',
    'Fizz',
    '43',
    '44',
    'FizzBuzz',
    '46',
    '47',
    'Fizz',
    '49',
    'Buzz',
    'Fizz',
    '52',
    '53',
    'Fizz',
    'Buzz',
    '56',
    'Fizz',
    '58',
    '59',
    'FizzBuzz',
    '61',
    '62',
    'Fizz',
    '64',
    'Buzz',
    'Fizz',
    '67',
    '68',
    'Fizz',
    'Buzz',
    '71',
    'Fizz',
    '73',
    '74',
    'FizzBuzz',
    '76',
    '77',
    'Fizz',
    '79',
    'Buzz',
    'Fizz',
    '82',
    '83',
    'Fizz',
    'Buzz',
    '86',
    'Fizz',
    '88',
    '89',
    'FizzBuzz',
    '91',
    '92',
    'Fizz',
    '94',
    'Buzz',
    'Fizz',
    '97',
    '98',
    'Fizz',
    'Buzz',
  ]>>,
]