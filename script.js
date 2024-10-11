// Model
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

    isValid(row, col, num) {
        for (let i = 0; i < 9; i++) {
            if (this.board[row][i] === num) return false;
            if (this.board[i][col] === num) return false;
        }

        let boxRow = Math.floor(row / 3) * 3;
        let boxCol = Math.floor(col / 3) * 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (this.board[boxRow + i][boxCol + j] === num) return false;
            }
        }

        return true;
    }

    checkSolution() {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (this.board[i][j] !== this.solution[i][j]) {
                    return false;
                }
            }
        }
        return true;
    }
}

// View
class SudokuView {
    constructor() {
        this.board = document.getElementById('game-board');
    }

    renderBoard(boardData) {
        this.board.innerHTML = '';
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                let cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                if (boardData[i][j] !== 0) {
                    cell.textContent = boardData[i][j];
                    cell.classList.add('initial');
                }
                this.board.appendChild(cell);
            }
        }
    }

    bindCellInput(handler) {
        this.board.addEventListener('click', (e) => {
            if (e.target.classList.contains('cell') && !e.target.classList.contains('initial')) {
                let input = prompt('輸入數字 (1-9)：');
                if (input && !isNaN(input) && input > 0 && input < 10) {
                    handler(e.target.dataset.row, e.target.dataset.col, parseInt(input));
                }
            }
        });
    }

    updateCell(row, col, value) {
        let cell = this.board.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        cell.textContent = value;
    }

    showMessage(message) {
        alert(message);
    }

    showSolution(solution) {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                let cell = this.board.querySelector(`[data-row="${i}"][data-col="${j}"]`);
                cell.textContent = solution[i][j];
                cell.classList.add('solution');
            }
        }
    }
}

// Controller
class SudokuController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.worker = new Worker('sudokuWorker.js');

        this.view.bindCellInput(this.handleCellInput.bind(this));
        document.getElementById('new-game').addEventListener('click', this.newGame.bind(this));
        document.getElementById('check-solution').addEventListener('click', this.checkSolution.bind(this));
        document.getElementById('show-solution').addEventListener('click', this.showSolution.bind(this));

        this.worker.addEventListener('message', (e) => {
            this.model.board = e.data.board;
            this.model.solution = e.data.solution;
            this.view.renderBoard(this.model.board);
            this.view.showMessage('新遊戲已生成！');
        });

        this.newGame();
    }

    newGame() {
        this.view.showMessage('正在生成新遊戲，請稍候...');
        this.worker.postMessage('generate');
    }

    handleCellInput(row, col, value) {
        if (this.model.isValid(row, col, value)) {
            this.model.board[row][col] = value;
            this.view.updateCell(row, col, value);
        } else {
            this.view.showMessage('無效的數字！');
        }
    }

    checkSolution() {
        if (this.model.checkSolution()) {
            this.view.showMessage('恭喜！你解開了數獨！');
        } else {
            this.view.showMessage('還沒有解開，繼續加油！');
        }
    }

    showSolution() {
        this.view.showSolution(this.model.solution);
    }
}

// 初始化應用
const app = new SudokuController(new SudokuModel(), new SudokuView());