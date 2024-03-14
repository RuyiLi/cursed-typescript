A collection of cursed types, or a repository in which I abuse the fact that TypeScript's type system is Turing complete to write programs that "run" at compile time.

`type-challenges/` - My solutions to problems from https://github.com/type-challenges/type-challenges.

`random/` - Basically everything else, e.g. a [Conway's Game of Life simulator](random/game-of-life.ts), a [Sudoku solver](random/sudoku.ts), and a [Brainfuck interpreter](random/brainfuck.ts).


## TS(2589)
You _**might**_ be able to temporarily bypass the "Type instantiation is excessively deep and possibly infinite" error by editing the TypeScript server. Does not work in the playground.
1. Open the "Output" tab (View > Output)
2. Select "TypeScript" from the dropdown
3. Look for a log line that starts with "Using tsserver from: <some_file_path>/tsserver.js"
4. Open `tsserver.js`
5. Ctrl-F "Type_instantiation_is_excessively_deep_and_possibly_infinite". There should be 4 occurences
6. For the 3rd and 4th occurences, change the number in the condition above to some much larger number (or just comment the blocks out altogether if you're brave)
7. Restart the TypeScript server
