type Equals<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends
  (<T>() => T extends Y ? 1 : 2) ? true : false;

type Cell = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
type Board = Cell[][]
type IndexToBox = [0, 0, 0, 3, 3, 3, 6, 6, 6]
type ValidIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

// fix range of possible values to ValidIndex
type Add1<N extends number, C extends 0[] = []> =
  true extends Equals<N, number> | Equals<N, never>
  ? never
  : N extends C['length']
    ? [...C, 0]['length'] extends ValidIndex
      ? [...C, 0]['length']
      : never  // prevent index out of bounds
    : Add1<N, [...C, 0]>

// Add1<Add1<N>> is annoying to fix
type Add2<N extends IndexToBox[number]> =
  Add1<N> extends ValidIndex
  ? Add1<Add1<N>>
  : never

type RowValues<BoardState extends Board, Y extends number> = BoardState[Y][number]
type ColValues<BoardState extends Board, X extends number> = BoardState[number][X]
type BoxValues<BoardState extends Board, X extends ValidIndex, Y extends ValidIndex> =
  | BoardState[IndexToBox[Y]][IndexToBox[X]]
  | BoardState[IndexToBox[Y]][Add1<IndexToBox[X]>]
  | BoardState[IndexToBox[Y]][Add2<IndexToBox[X]>]
  | BoardState[Add1<IndexToBox[Y]>][IndexToBox[X]]
  | BoardState[Add1<IndexToBox[Y]>][Add1<IndexToBox[X]>]
  | BoardState[Add1<IndexToBox[Y]>][Add2<IndexToBox[X]>]
  | BoardState[Add2<IndexToBox[Y]>][IndexToBox[X]]
  | BoardState[Add2<IndexToBox[Y]>][Add1<IndexToBox[X]>]
  | BoardState[Add2<IndexToBox[Y]>][Add2<IndexToBox[X]>]
type DisallowedValues<BoardState extends Board, X extends ValidIndex, Y extends ValidIndex> =
  RowValues<BoardState, Y> | ColValues<BoardState, X> | BoxValues<BoardState, X, Y>

// Locates the coordinates of the first zero (top to bottom, left to right).
type FirstZero<BoardState extends Board, X extends 0[] = [], Y extends 0[] = []> =
  BoardState[Y['length']][X['length']] extends 0
  ? [X['length'], Y['length']]
  : X['length'] extends ValidIndex
    ? FirstZero<BoardState, [...X, 0], Y>
    : Y['length'] extends ValidIndex
      ? FirstZero<BoardState, [], [...Y, 0]>
      : false

// Basically deep clones the board and forces it into a 2D array.
type NormalizeBoard<
  BoardState extends Board,
  X extends 0[] = [],
  Y extends 0[] = [],
  CurrBoard extends Board = [],
  CurrRow extends Cell[] = []
> =
  Y['length'] extends ValidIndex
  ? X['length'] extends ValidIndex
    ? NormalizeBoard<BoardState, [...X, 0], Y, CurrBoard, [...CurrRow, BoardState[Y['length']][X['length']]]>
    : NormalizeBoard<BoardState, [], [...Y, 0], [...CurrBoard, CurrRow], []>
  : CurrBoard

// Surgically replaces the value at X, Y with Target. Quick and easy but returns an ugly object.
// Requires NormalizeBoard to turn it back into a nice and readable matrix.
type ReplaceCell<
  BoardState extends Board,
  X extends number,
  Y extends number,
  Target extends Cell,
> =
  NormalizeBoard<{
    [BY in keyof BoardState]: // as Exclude<BY, Exclude<BY, `${ValidIndex}`>> 
      BY extends `${ValidIndex}`
      ? { [BX in keyof BoardState[BY]]: [BX, BY] extends [`${X}`, `${Y}`] ? Target : BoardState[BY][BX] }
      : BoardState[BY]
  }>

// Recursively attempts to brute force the puzzle, backtracking if an invalid decision is made.
// !! Some puzzles encounter TS(2589) because they hit the max instantiation count.
// !! A temporary (bad) fix is to locate this line in the tsserver file:
// !! `if (instantiationDepth === 100 || instantiationCount >= 5e6) {`
// !! and remove the instantiationCount limit.
// !! TODO: use custom ds/strings instead of arrays 
// !!       https://herringtondarkholme.github.io/2023/04/30/typescript-magic/
// false = unsolvable, never = should actually never happen
type Solve<BoardState extends Board, C extends 0[] = [0]> =
  // if no more zeroes
  FirstZero<BoardState> extends false
  // solved, return board
  ? BoardState
  : FirstZero<BoardState> extends [infer X extends ValidIndex, infer Y extends ValidIndex]
    ? C['length'] extends Cell
      ? C['length'] extends DisallowedValues<BoardState, X, Y>
        // go next, can't use current cell value
        ? Solve<BoardState, [...C, 0]>
        // cache result to prevent exponential growth
        // TODO verify: actually, ts might already cache it for us?
        : Solve<ReplaceCell<BoardState, X, Y, C['length']>> extends infer Result
          ? Result extends false
            // go next, current cell value didn't work
            ? Solve<BoardState, [...C, 0]>
            : Result
          : never
      // backtrack, we've tried all possible values
      : false                                         
    : never

// ================================
// ======== BEGIN TESTING =========
// ================================

// Testing utilities

type StringToBoard<S extends string, CurrBoard extends Board = [], CurrRow extends Cell[] = []> =
  S extends `${infer L}${infer R}`
  ? L extends '\n'
    ? CurrRow['length'] extends 0
      ? StringToBoard<R, CurrBoard, []>
      : StringToBoard<R, [...CurrBoard, CurrRow], []>
    : L extends `${infer C extends Cell}`
      ? StringToBoard<R, CurrBoard, [...CurrRow, C]>
      : StringToBoard<R, CurrBoard, CurrRow>
  : CurrBoard

type JoinRow<Row extends Cell[], S extends string = '', C extends 0[] = []> =
  Row extends [infer L extends Cell, ...infer R extends Cell[]]
  ? S extends ''
    ? JoinRow<R, `${L}`, [0]>
    : C['length'] extends 3 | 6
      ? JoinRow<R, `${S} | ${L}`, [...C, 0]>
      : JoinRow<R, `${S} ${L}`, [...C, 0]>
  : S

type PrintBoard<
  BoardState extends Board,
  LineSep extends string = '\n',
  BoxSep extends string = '------+-------+------',
  S extends string = '',
  C extends 0[] = []
> = 
  BoardState extends [infer CurrRow extends Cell[], ...infer NextRows extends Board]
  ? S extends ''
    ? PrintBoard<NextRows, LineSep, BoxSep, JoinRow<CurrRow>, [0]>
    : C['length'] extends 3 | 6
      ? PrintBoard<NextRows, LineSep, BoxSep, `${S}${LineSep}${BoxSep}${LineSep}${JoinRow<CurrRow>}`, [...C, 0]>
      : PrintBoard<NextRows, LineSep, BoxSep, `${S}${LineSep}${JoinRow<CurrRow>}`, [...C, 0]>
  : S

// Hover over this to see the solution
type SudokuEasySolved = PrintBoard<Solve<SudokuEasy>>
type SudokuEasy = StringToBoard<`
  5 0 0  4 6 7  3 0 9
  9 0 3  8 1 0  4 2 7
  1 7 4  2 0 3  0 0 0

  2 3 1  9 7 6  8 5 4
  8 5 7  1 2 4  0 9 0
  4 9 6  3 0 8  1 7 2
  
  0 0 0  0 8 9  2 6 0
  7 8 2  6 4 1  0 0 5
  0 1 0  0 0 0  7 0 8
`>

// Hits instantiation count limit
// type SudokuMediumSolved = PrintBoard<Solve<SudokuMedium>>
// type SudokuMedium = StringToBoard<`
//   5 3 0  0 7 0  0 0 0
//   6 0 0  1 9 5  0 0 0
//   0 9 8  0 0 0  0 6 0

//   8 0 0  0 6 0  0 0 3
//   4 0 0  8 0 3  0 0 1
//   7 0 0  0 2 0  0 0 6

//   0 6 0  0 0 0  2 8 0
//   0 0 0  4 1 9  0 0 5
//   0 0 0  0 8 0  0 7 9
// `>

// type SudokuHardSolved = PrintBoard<Solve<SudokuHard>>
// type SudokuHard = StringToBoard<`
//   0 8 0  0 9 0  0 0 0
//   0 0 6  7 1 0  0 0 5
//   0 3 0  0 4 6  0 9 0
  
//   7 0 2  1 5 0  6 0 0
//   6 0 0  0 0 0  1 0 0
//   0 0 0  0 0 0  9 5 0

//   2 0 8  0 0 0  0 0 0
//   0 0 0  0 2 0  7 0 0
//   0 1 0  6 7 0  0 3 2
// `>

// // Format: NYT Difficulty MM DD YY

// type NYTEasy021024 = PrintBoard<Solve<StringToBoard<`
//   4 0 1  0 5 0  9 0 0
//   3 0 0  0 6 0  7 0 4
//   7 9 0  8 0 0  0 1 0

//   1 0 3  7 0 0  0 0 6
//   0 8 5  0 0 4  0 0 2
//   0 0 0  6 0 0  0 8 1

//   8 3 4  0 7 2  0 0 0
//   0 0 7  4 8 6  2 0 0
//   0 2 0  0 0 1  8 4 7
// `>>>

// Hits instantiation count limit
// type NYTMedium021024 = PrintBoard<Solve<StringToBoard<`
//   0 0 5  0 0 0  3 0 8
//   7 0 0  0 0 0  0 0 0
//   0 0 0  0 1 0  2 6 0

//   0 3 9  0 2 0  0 4 0
//   6 0 0  0 0 0  0 7 0
//   0 0 0  1 0 5  6 0 0

//   0 0 3  0 0 0  5 0 0
//   0 6 0  2 9 0  0 0 0
//   0 4 2  0 0 6  0 0 0
// `>>>
