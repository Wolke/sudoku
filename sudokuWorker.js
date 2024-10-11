class SudokuModel {
    constructor() {
        this.board = [];
        this.solution = [];
    }

    generateNewGame() {
        this.solution = this.generateSolution();
        this.board = this.removeNumbers(this.copyBoard(this.solution));
    }

    generateSolution() {
        let board = Array(9).fill().map(() => Array(9).fill(0));
        this.fillBoard(board);
        return board;
    }

    fillBoard(board) {
        const numbers = this.shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        return this.fillBoardRecursive(board, numbers);
    }

    fillBoardRecursive(board, numbers) {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (board[i][j] === 0) {
                    for (let num of numbers) {
                        if (this.isValidPlacement(board, i, j, num)) {
                            board[i][j] = num;
                            if (this.fillBoardRecursive(board, this.shuffleArray([...numbers]))) {
                                return true;
                            }
                            board[i][j] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    isValidPlacement(board, row, col, num) {
        for (let i = 0; i < 9; i++) {
            if (board[row][i] === num || board[i][col] === num) {
                return false;
            }
        }

        let boxRow = Math.floor(row / 3) * 3;
        let boxCol = Math.floor(col / 3) * 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[boxRow + i][boxCol + j] === num) {
                    return false;
                }
            }
        }

        return true;
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    removeNumbers(board) {
        const numToRemove = Math.floor(Math.random() * 10) + 35; // 隨機移除 35 到 44 個數字
        const positions = this.shuffleArray([...Array(81).keys()]);
        for (let i = 0; i < numToRemove; i++) {
            const pos = positions[i];
            const row = Math.floor(pos / 9);
            const col = pos % 9;
            board[row][col] = 0;
        }
        return board;
    }

    copyBoard(board) {
        return board.map(row => [...row]);
    }
}

self.addEventListener('message', function (e) {
    if (e.data === 'generate') {
        const model = new SudokuModel();
        model.generateNewGame();
        self.postMessage({ board: model.board, solution: model.solution });
    }
});