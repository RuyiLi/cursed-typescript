type Cell = 'x' | '.'
type Board = Cell[][]

type ValidIndex<Arr extends unknown[]> =
  Exclude<keyof Arr, Exclude<keyof Arr, `${number}`>> extends `${infer N extends number}`
  ? N
  : never

type Equals<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends
  (<T>() => T extends Y ? 1 : 2) ? true : false;

// Doesn't handle negative or decimal cases
// It's annoying to handle the never case, so I'm using -1 as a sentinel value instead
type Sub1<N extends number, C extends 0[] = []> =
  true extends Equals<N, 0> | Equals<N, number> 
  ? -1
  : N extends [...C, 0]['length']
    ? C['length']
    : Sub1<N, [...C, 0]>

type Add1<N extends PossValues, PossValues extends number, C extends 0[] = []> =
  Equals<N, number> extends true
  ? -1
  : N extends C['length']
    ? [...C, 0]['length'] extends PossValues
      ? [...C, 0]['length']
      : -1  // prevent index out of bounds
    : Add1<N, PossValues, [...C, 0]>

type IsLive<BoardState extends Board, X extends number, Y extends number> =
  X extends ColIndexOf<BoardState>
  ? Y extends RowIndexOf<BoardState>
    ? BoardState[Y][X] extends 'x'
      ? true
      : false
    : false
  : false

type CountTrue<Arr extends any[], C extends 0[] = []> =
  Arr extends [infer L, ...infer R]
  ? L extends true
    ? CountTrue<R, [...C, 0]>
    : CountTrue<R, C>
  : C['length']

type CellState<BoardState extends Board, X extends ColIndexOf<BoardState>, Y extends RowIndexOf<BoardState>> =
  CountTrue<[
    IsLive<BoardState, Sub1<X>, Sub1<Y>>,
    IsLive<BoardState, X, Sub1<Y>>,
    IsLive<BoardState, Add1<X, ColIndexOf<BoardState>>, Sub1<Y>>,
    IsLive<BoardState, Add1<X, ColIndexOf<BoardState>>, Y>,
    IsLive<BoardState, Add1<X, ColIndexOf<BoardState>>, Add1<Y, RowIndexOf<BoardState>>>,
    IsLive<BoardState, X, Add1<Y, RowIndexOf<BoardState>>>,
    IsLive<BoardState, Sub1<X>, Add1<Y, RowIndexOf<BoardState>>>,
    IsLive<BoardState, Sub1<X>, Y>
  ]>

type EvolveCell<BoardState extends Board, X extends ColIndexOf<BoardState>, Y extends RowIndexOf<BoardState>> =
  BoardState[Y][X] extends '.'
  ? CellState<BoardState, X, Y> extends 3
    ? 'x'
    : '.'
  : BoardState[Y][X] extends 'x'
    ? CellState<BoardState, X, Y> extends 2 | 3
      ? 'x'
      : '.'
    : never

type EvolveRow<
  OrigBoardState extends Board,
  Y extends RowIndexOf<OrigBoardState>,
  CX extends 0[] = [],
  CurrRow extends Cell[] = [],
> = 
  CX['length'] extends ColIndexOf<OrigBoardState>
  ? EvolveRow<
      OrigBoardState,
      Y,
      [...CX, 0],
      [...CurrRow, EvolveCell<OrigBoardState, CX['length'], Y>]
    >
  : CurrRow

type Evolve<
  OrigBoardState extends Board,
  CurrBoardState extends Board = [],
  CY extends 0[] = [],
> = 
  CY['length'] extends RowIndexOf<OrigBoardState>
  ? Evolve<OrigBoardState, [...CurrBoardState, EvolveRow<OrigBoardState, CY['length']>], [...CY, 0]>
  : CurrBoardState

type EvolveN<BoardState extends Board, N extends number, C extends 0[] = []> =
  C['length'] extends N
  ? BoardState
  : EvolveN<Evolve<BoardState>, N, [...C, 0]>

type RowIndexOf<BoardState extends Board> = ValidIndex<BoardState>
type ColIndexOf<BoardState extends Board> = ValidIndex<BoardState[number]>

// ================================
// ======== BEGIN TESTING =========
// ================================

// Testing Utilities

type JoinRow<Row extends Cell[], S extends string = ''> =
  Row extends [infer L extends Cell, ...infer R extends Cell[]]
  ? JoinRow<R, `${S}${L}`>
  : S

type PrintBoard<BoardState extends Board, LineSep extends string = '|', S extends string = ''> = 
  BoardState extends [infer CurrRow extends Cell[], ...infer NextRows extends Board]
  ? PrintBoard<NextRows, LineSep, `${S}${LineSep}${JoinRow<CurrRow>}`>
  : S

type StringToBoard<S extends string, CurrBoard extends Board = [], CurrRow extends Cell[] = []> =
  S extends `${infer L}${infer R}`
  ? L extends '\n'
    ? CurrRow['length'] extends 0
      ? StringToBoard<R, CurrBoard, []>
      : StringToBoard<R, [...CurrBoard, CurrRow], []>
    : L extends Cell
      ? StringToBoard<R, CurrBoard, [...CurrRow, L]>
      : StringToBoard<R, CurrBoard, CurrRow>
  : CurrBoard

// Test Cases
// Hover over the type names to see the output

type Blinker = StringToBoard<`
...
xxx
...
`>

type PBlinker1 = PrintBoard<Blinker>
type PBlinker2 = PrintBoard<Evolve<Blinker>>
type PBlinker3 = PrintBoard<EvolveN<Blinker, 2>>
type PBlinker4 = PrintBoard<EvolveN<Blinker, 3>>

type GosperGliderGun = StringToBoard<`
........................................
.........................x..............
.......................x.x..............
.............xx......xx..............xx.
............x...x....xx..............xx.
.xx........x.....x...xx.................
.xx........x...x.xx....x................
...........x.....x.......x..............
............x...x........x..............
.............xx.........................
........................................
`>

type PGun1 = PrintBoard<GosperGliderGun>
type PGun2 = PrintBoard<EvolveN<GosperGliderGun, 30>>
