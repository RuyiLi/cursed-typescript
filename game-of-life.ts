type Cell = "x" | ".";

// type EvolveRow<Row extends Cell[], PrevRow extends Cell[], NextRow extends Cell[]> =
//   Row

// type Evolve<Board extends Cell[][], PrevRow extends Cell[] = []> =
//   Board extends [infer CurrRow extends Cell[], ...infer RemainingRows extends Cell[][]]
//   ? RemainingRows extends [infer NextRow extends Cell[], ...infer RemainingRows extends Cell[][]]
//     ? [EvolveRow<CurrRow, PrevRow, NextRow>, ...Evolve<RemainingRows, CurrRow>]
//     : [EvolveRow<CurrRow, PrevRow, []>]
//   : []

// expands object types one level deep
type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

// expands object types recursively
type ExpandRecursively<T> = T extends object
  ? T extends infer O
    ? { [K in keyof O]: ExpandRecursively<O[K]> }
    : never
  : T;

type Board = Cell[][];
type ValidIndex<Arr extends Cell[] | Board> = {
  [K in keyof Arr]: K extends `${infer N extends number}` ? N : never;
}[keyof Arr];

// Doesn't handle negative or decimal cases
type Sub1<N extends number, C extends 0[] = []> = N extends 0
  ? never
  : N extends [...C, 0]["length"]
  ? C["length"]
  : Sub1<N, [...C, 0]>;

type Add1<
  N extends Index,
  Index extends RowIndex | ColIndex,
  C extends 0[] = []
> = N extends C["length"]
  ? [...C, 0]["length"] extends Index
    ? [...C, 0]["length"]
    : never // prevent index overflow
  : Add1<N, Index, [...C, 0]>;

type IsLive<
  BoardState extends Board,
  X extends ColIndex,
  Y extends RowIndex
> = [X] extends [never]
  ? false
  : [Y] extends [never]
  ? false
  : BoardState[Y][X] extends "x"
  ? true
  : false;

type CountTrue<Arr extends any[], C extends 0[] = []> = Arr extends [
  infer L,
  ...infer R
]
  ? L extends true
    ? CountTrue<R, [...C, 0]>
    : CountTrue<R, C>
  : C["length"];

type CellState<
  BoardState extends Board,
  X extends ColIndex,
  Y extends RowIndex
> = CountTrue<
  [
    IsLive<BoardState, Sub1<X>, Sub1<Y>>,
    IsLive<BoardState, X, Sub1<Y>>,
    IsLive<BoardState, Add1<X, ColIndex>, Sub1<Y>>,
    IsLive<BoardState, Add1<X, ColIndex>, Y>,
    IsLive<BoardState, Add1<X, ColIndex>, Add1<Y, RowIndex>>,
    IsLive<BoardState, X, Add1<Y, RowIndex>>,
    IsLive<BoardState, Sub1<X>, Add1<Y, RowIndex>>,
    IsLive<BoardState, Sub1<X>, Y>
  ]
>;

type EvolveCell<
  BoardState extends Board,
  X extends ColIndex,
  Y extends RowIndex
> = BoardState[Y][X] extends "."
  ? CellState<BoardState, X, Y> extends 3
    ? "x"
    : "."
  : BoardState[Y][X] extends "x"
  ? CellState<BoardState, X, Y> extends 2 | 3
    ? "x"
    : "."
  : never;

// type ReplaceAt<BoardState extends Board, X extends ColIndex, Y extends RowIndex, Replacement extends Cell, CY extends 0[] = []> =
//   CY['length'] extends Y
//   ? [{ [K in keyof BoardState[Y]]: K extends X ? Replacement : BoardState[Y][K] }, ...BoardState]
//   : BoardState extends [infer CurrRow, ...infer NextRows extends Board]
//     ? [CurrRow, ReplaceAt<NextRows, X, Y,Replacement, [...CY, 0]>]
//     : never

type EvolveRow<
  OrigBoardState extends Board,
  Y extends RowIndex,
  CX extends 0[] = [],
  CurrRow extends Cell[] = []
> = CX["length"] extends ColIndex
  ? EvolveRow<
      OrigBoardState,
      Y,
      [...CX, 0],
      [...CurrRow, EvolveCell<OrigBoardState, CX["length"], Y>]
    >
  : CurrRow;

type Evolve<
  OrigBoardState extends Board,
  CurrBoardState extends Board = [],
  CY extends 0[] = []
> = CY["length"] extends RowIndex
  ? Evolve<
      OrigBoardState,
      [...CurrBoardState, EvolveRow<OrigBoardState, CY["length"]>],
      [...CY, 0]
    >
  : CurrBoardState;

type EvolveN<
  BoardState extends Board,
  N extends number,
  C extends 0[] = []
> = C["length"] extends N
  ? BoardState
  : EvolveN<Evolve<BoardState>, N, [...C, 0]>;

type JoinRow<Row extends Cell[], S extends string = ""> = Row extends [
  infer L extends Cell,
  ...infer R extends Cell[]
]
  ? JoinRow<R, `${S}${L}`>
  : S;

type PrintBoard<
  BoardState extends Board,
  S extends string = ""
> = BoardState extends [
  infer CurrRow extends Cell[],
  ...infer NextRows extends Board
]
  ? PrintBoard<NextRows, `${S}|${JoinRow<CurrRow>}`>
  : S;

// doesnt work when i put this logic in validindex for some reason
type RowIndex<G = ValidIndex<Board1>> = G extends number
  ? Board1[G] extends Cell[]
    ? G
    : never
  : never;
type ColIndex<G = ValidIndex<Board1[0]>> = G extends number
  ? Board1[0][G] extends Cell
    ? G
    : never
  : never;

// prettier-ignore
type Board1 = [
  ['.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.'],
  ['.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', 'x', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.'],
  ['.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', 'x', '.', 'x', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.'],
  ['.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', 'x', 'x', '.', '.', '.', '.', '.', '.', 'x', 'x', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', 'x', 'x', '.'],
  ['.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', 'x', '.', '.', '.', 'x', '.', '.', '.', '.', 'x', 'x', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', 'x', 'x', '.'],
  ['.', 'x', 'x', '.', '.', '.', '.', '.', '.', '.', '.', 'x', '.', '.', '.', '.', '.', 'x', '.', '.', '.', 'x', 'x', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.'],
  ['.', 'x', 'x', '.', '.', '.', '.', '.', '.', '.', '.', 'x', '.', '.', '.', 'x', '.', 'x', 'x', '.', '.', '.', '.', 'x', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.'],
  ['.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', 'x', '.', '.', '.', '.', '.', 'x', '.', '.', '.', '.', '.', '.', '.', 'x', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.'],
  ['.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', 'x', '.', '.', '.', 'x', '.', '.', '.', '.', '.', '.', '.', '.', 'x', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.'],
  ['.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', 'x', 'x', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.'],
  ['.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.'],
]

type PBoard1 = PrintBoard<Board1>;
type PBoard2 = PrintBoard<EvolveN<Board1, 30>>;
