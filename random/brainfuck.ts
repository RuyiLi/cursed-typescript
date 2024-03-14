type Equals<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends
  (<T>() => T extends Y ? 1 : 2) ? true : false;

type ASCII = ["\u0000", "\u0001", "\u0002", "\u0003", "\u0004", "\u0005", "\u0006", "\u0007", "\b", "\t", "\n", "\u000b", "\f", "\r", "\u000e", "\u000f", "\u0010", "\u0011", "\u0012", "\u0013", "\u0014", "\u0015", "\u0016", "\u0017", "\u0018", "\u0019", "\u001a", "\u001b", "\u001c", "\u001d", "\u001e", "\u001f", " ", "!", "\"", "#", "$", "%", "&", "'", "(", ")", "*", "+", ",", "-", ".", "/", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ":", ";", "<", "=", ">", "?", "@", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "[", "\\", "]", "^", "_", "`", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "{", "|", "}", "~", ""]
type ValidASCIICode = Exclude<keyof ASCII, Exclude<keyof ASCII, `${number}`>> extends `${infer X extends number}` ? X : never
type ValidToken = '>' | '<' | '+' | '-' | '.' | ',' | '[' | ']' | '!'  // ! is a special debug token
type BadType<V> = true extends Equals<V, unknown> | Equals<V, never> | Equals<V, any> | Equals<V, number> ? true : false

type Num = (0 | 1)[]
type Add1<N extends Num> =
  N['length'] extends 0
  ? [0]
  : N[0] extends 0  // is positive?
    ? [...N, 0]
    : N extends [infer L, ...infer R]
      ? R
      : never

type Sub1<N extends Num> =
  N['length'] extends 0
  ? [1]
  : N[0] extends 1  // is negative?
    ? [...N, 1]
    : N extends [infer L, ...infer R]
      ? R
      : never

type AsNumber<N extends Num> =
  N['length'] extends 0
  ? 0
  : N[0] extends 1
    ? `-${N['length']}` extends `${infer X extends number}`
      ? X
      : never
    : N['length']

type AsNum<N extends number, Res extends Num = []> =
  `${N}` extends `-${infer X extends number}`
  ? Res['length'] extends X
    ? Res
    : AsNum<N, [...Res, 1]>
  : Res['length'] extends N
    ? Res
    : AsNum<N, [...Res, 0]>

// TODO revise? this enables negative cell #s and *theoretically* an infinite number of cells
type StateT = Record<number, Num>

type Get<Obj extends StateT, K extends Num> = AsNumber<K> extends keyof Obj ? Obj[AsNumber<K>] : []

// type Replace<Obj extends StateT, TargetKey extends number, V extends Num> = Omit<Obj, TargetKey> & { [K in TargetKey]: V}
type Replace<Obj extends StateT, TargetKey extends number, V extends Num> = {
  [K in keyof Obj | TargetKey]: Equals<K, TargetKey> extends true ? V : Obj[K];
}

type PutChar<V extends Num> = AsNumber<V> extends ValidASCIICode ? ASCII[AsNumber<V>] : ''

type JumpToLoopEnd<S extends string, C extends 0[] = []> =
  S extends `${infer L}${infer R}`
  ? L extends ']'
    ? C['length'] extends 1
      ? R
      : C extends [infer LC, ...infer RC extends 0[]]
        ? JumpToLoopEnd<R, RC>
        : never
    : L extends '['
      ? JumpToLoopEnd<R, [...C, 0]>
      : JumpToLoopEnd<R, C>
  : never

type Run<Program extends string, Input extends number[], Output extends string, State extends StateT, Pointer extends Num, LoopStack extends string[]> =
  Program extends `${infer T}${infer PRest}`
  ? T extends '>'
    ? Run<PRest, Input, Output, State, Add1<Pointer>, LoopStack>
    : T extends '<'
      ? Run<PRest, Input, Output, State, Sub1<Pointer>, LoopStack>
      : T extends '+'
        ? Run<
            PRest, Input, Output, 
            Replace<State, AsNumber<Pointer>, Add1<Get<State, Pointer>>>,
            // { [K in keyof State | AsNumber<Pointer>]: Equals<K, AsNumber<Pointer>> extends true ? Add1<Get<State, Pointer>> : State[K]; },
            Pointer, LoopStack
          >
        : T extends '-'
          ? Run<
              PRest, Input, Output,
              Replace<State, AsNumber<Pointer>, Sub1<Get<State, Pointer>>>,
              // { [K in keyof State | AsNumber<Pointer>]: Equals<K, AsNumber<Pointer>> extends true ? Sub1<Get<State, Pointer>> : State[K]; },
              Pointer, LoopStack
            >
          : T extends '.'
            ? Run<PRest, Input, `${Output}${PutChar<Get<State, Pointer>>}`, State, Pointer, LoopStack>
            : T extends ','
              ? Input extends [infer L extends number, ...infer R extends number[]]
                ? Run<
                    PRest, R, Output,
                    Replace<State, AsNumber<Pointer>, AsNum<L>>,
                    // { [K in keyof State | AsNumber<Pointer>]: Equals<K, AsNumber<Pointer>> extends true ? AsNum<L> : State[K]; },
                    Pointer, LoopStack
                  >
                : Output  // terminate on no input, can also be never if you want it to "throw" instead
              : T extends '['
                ? LoopStack extends [infer L extends string, ...infer R extends string[]]
                  ? L extends Program  // is it the currently running loop?
                    ? Get<State, Pointer> extends []
                      ? Run<JumpToLoopEnd<Program>, Input, Output, State, Pointer, R>
                      : Run<PRest, Input, Output, State, Pointer, LoopStack>
                    : Run<PRest, Input, Output, State, Pointer, [Program, ...LoopStack]>
                  : Get<State, Pointer> extends []
                    ? Run<JumpToLoopEnd<Program>, Input, Output, State, Pointer, []>
                    : Run<PRest, Input, Output, State, Pointer, [Program]>
                : T extends ']'
                  ? LoopStack extends [infer L extends string, ...infer R extends string[]]
                    ? Run<L, Input, Output, State, Pointer, LoopStack>
                    : never
                  : T extends '!'  // terminate and log parameters
                    ? [Input, Output, ExpandRecursively<ReadableState<State>>, AsNumber<Pointer>, LoopStack]
                    : Run<PRest, Input, Output, State, Pointer, LoopStack>
  : Output

// this is needed if the comments are too long (like in Adder)
type CleanInput<S extends String, Acc extends string = ''> =
  S extends `${infer L}${infer R}`
  ? L extends ValidToken
    ? CleanInput<R, `${Acc}${L}`>
    : CleanInput<R, Acc>
  : Acc

type RunProgram<Program extends string, Input extends number[] = [], InitialState extends StateT = {}> =
  Run<CleanInput<Program>, Input, '', InitialState, [], []>


// 
// BEGIN TESTING 
// 


// expands object types one level deep
type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

// expands object types recursively
type ExpandRecursively<T> = T extends object
  ? T extends infer O ? { [K in keyof O]: ExpandRecursively<O[K]> } : never
  : T;

type ReadableState<State extends StateT> = {
  [K in keyof State]: State[K] extends Num ? AsNumber<State[K]> : never
}

//
// Test cases
// Hover over the type names (e.g. HelloWorld, Adder) to see the output
// See README.md for a temporary fix if you encounter the "Type instantiation is excessively deep and possibly infinite" error
// Unfortunately this version is very slow and can only run smaller programs :(
//

// Prints "Hello World!"
type HelloWorld = RunProgram<
  `
  > ++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]
  ++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]
  ++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]
  ++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]
  ++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]
  ++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]
  ++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]
  ++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]
  >.>---.+++++++..+++.>>.<-.<.+++.------.--------.>>+.>++.
  `
>

// Adapted from https://en.wikipedia.org/wiki/Brainfuck#Adding_two_values
type Adder = RunProgram<AdderSource, [2, 7]>
type AdderSource = `
Adds two unsigned single digit numbers
, > ,  Read two inputs A and B

[    Start your loops with your cell pointer on the loop counter (c1 in our case)
< +    Add 1 to c0
> -    Subtract 1 from c1
]    End your loops with the cell pointer on the loop counter

At this point our program has added A to B leaving B in c0 and 0 in c1
but we cannot output this value to the terminal since it is not ASCII encoded

To display the ASCII value of C we must add 48 to the value C
We use a loop to compute 48 = 6 * 8

++++ ++++  c1 = 8 and this will be our loop counter again
[
< +++ +++  Add 6 to c0
> -    Subtract 1 from c1
]
< .    Print out c0
`

// Repeatedly echos stdin until 0 is entered or EOF
type Cat = RunProgram<`,[.,]`, [65, 66, 0, 67]>

// Given an even number of inputs, solves two sum on each pair. Same constraints as Adder apply
// Only works with intersection replacement
type TwoSum = RunProgram<`+[>${AdderSource}<]`, [1, 2, 4, 5, 0, 8]>

// Prints input 1 - input 2. Both must be positive.
type Subtract = RunProgram<`>,>,[<[->]<]>>[[<+>-]>>]<<<!`, [13, 7]>


//
// Some cryptic testcases; these are more for myself than for actual demonstration purposes, but feel free to investigate
//


// [ mapped type replace only ]
// caching magic??? HelloWorld1 stops working if you comment out 0 (same with 2 and 1, 3 and 2)
// but if you manually expand the outer loop like I did in HelloWorld above, it works?
type HelloWorld0 = RunProgram<`+[>+++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]`>
type HelloWorld1 = RunProgram<`+[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]`>
type HelloWorld2 = RunProgram<`+[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-] +[>+++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]`>
type HelloWorld3 = RunProgram<`+[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-] +[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]`>
type HelloWorldFull = RunProgram<`++++++++[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]>>.>---.+++++++..+++.>>.<-.<.+++.------.--------.>>+.>++.`>

// replace issue: instantiation limit OR types randomly become any
// TESTED REPLACEMENT TYPES:
// [x] mapped type - fast but hits limit pretty quickly
// [x] inline - has an upper limit (~32) on the number of operations for some reason?
// [x] intersection - most correct but slowest
type TwoSumLastGoodStateWithInitial = RunProgram<`+[>,>,[<+>-]++++!++++[<++++++>-]<.!]`, [1, 2, 4, 5, 0, 8], { 3: AsNum<32> }>
type FourtyEight = RunProgram<`++++++++[>++++++<-]>.!`, [1, 2, 4, 5, 0, 8]>
type ReplacementTestMaxOps = RunProgram<`+++++++++++++++++++++++++++++++++!`, [], { 0: AsNum<12> }>
