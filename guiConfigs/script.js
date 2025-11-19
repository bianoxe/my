class TicTacToe {
    constructor() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.scores = { player: 0, bot: 0, draws: 0 };
        this.difficulty = 'medium';
        
        this.initializeGame();
        this.bindEvents();
    }

    initializeGame() {
        this.createBoard();
        this.updateScores();
        this.updateStatus('Ваш ход (X)');
    }

    createBoard() {
        const board = document.getElementById('board');
        board.innerHTML = '';
        
        this.board.forEach((cell, index) => {
            const cellElement = document.createElement('button');
            cellElement.className = 'cell';
            cellElement.dataset.index = index;
            cellElement.textContent = cell;
            cellElement.disabled = !this.gameActive || cell !== '';
            
            if (cell === 'X') cellElement.classList.add('x');
            if (cell === 'O') cellElement.classList.add('o');
            
            cellElement.addEventListener('click', () => this.handlePlayerMove(index));
            board.appendChild(cellElement);
        });
    }

    bindEvents() {
        document.getElementById('restart').addEventListener('click', () => this.restartGame());
        document.getElementById('change-difficulty').addEventListener('click', () => this.toggleDifficultySelector());
        
        document.querySelectorAll('#difficulty-selector button').forEach(button => {
            button.addEventListener('click', (e) => {
                this.setDifficulty(e.target.dataset.difficulty);
            });
        });
    }

    handlePlayerMove(index) {
        if (!this.gameActive || this.board[index] !== '' || this.currentPlayer !== 'X') {
            return;
        }

        this.makeMove(index, 'X');
        
        if (this.checkGameOver()) return;
        
        this.currentPlayer = 'O';
        this.updateStatus('Ход бота...');
        
        // Задержка для "думающего" бота
        setTimeout(() => this.botMove(), 500);
    }

    makeMove(index, player) {
        this.board[index] = player;
        this.createBoard();
    }

    botMove() {
        if (!this.gameActive || this.currentPlayer !== 'O') return;

        let move;
        
        switch (this.difficulty) {
            case 'easy':
                move = this.getRandomMove();
                break;
            case 'medium':
                move = Math.random() > 0.5 ? this.getSmartMove() : this.getRandomMove();
                break;
            case 'hard':
                move = this.getSmartMove();
                break;
            default:
                move = this.getSmartMove();
        }

        if (move !== -1) {
            this.makeMove(move, 'O');
            
            if (!this.checkGameOver()) {
                this.currentPlayer = 'X';
                this.updateStatus('Ваш ход (X)');
            }
        }
    }

    getRandomMove() {
        const emptyCells = this.board
            .map((cell, index) => cell === '' ? index : -1)
            .filter(index => index !== -1);
        
        return emptyCells.length > 0 ? 
            emptyCells[Math.floor(Math.random() * emptyCells.length)] : -1;
    }

    getSmartMove() {
        // Пытаемся выиграть
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = 'O';
                if (this.checkWinner('O')) {
                    this.board[i] = '';
                    return i;
                }
                this.board[i] = '';
            }
        }

        // Блокируем игрока
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = 'X';
                if (this.checkWinner('X')) {
                    this.board[i] = '';
                    return i;
                }
                this.board[i] = '';
            }
        }

        // Центр
        if (this.board[4] === '') return 4;

        // Углы
        const corners = [0, 2, 6, 8];
        const emptyCorners = corners.filter(index => this.board[index] === '');
        if (emptyCorners.length > 0) {
            return emptyCorners[Math.floor(Math.random() * emptyCorners.length)];
        }

        // Стороны
        const sides = [1, 3, 5, 7];
        const emptySides = sides.filter(index => this.board[index] === '');
        if (emptySides.length > 0) {
            return emptySides[Math.floor(Math.random() * emptySides.length)];
        }

        return -1;
    }

    checkWinner(player) {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Горизонтальные
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Вертикальные
            [0, 4, 8], [2, 4, 6] // Диагональные
        ];

        return winPatterns.some(pattern => 
            pattern.every(index => this.board[index] === player)
        );
    }

    checkGameOver() {
        if (this.checkWinner('X')) {
            this.endGame('player');
            return true;
        }

        if (this.checkWinner('O')) {
            this.endGame('bot');
            return true;
        }

        if (!this.board.includes('')) {
            this.endGame('draw');
            return true;
        }

        return false;
    }

    endGame(winner) {
        this.gameActive = false;
        
        if (winner === 'player') {
            this.scores.player++;
            this.updateStatus('🎉 Вы выиграли!');
            this.highlightWinningCells('X');
        } else if (winner === 'bot') {
            this.scores.bot++;
            this.updateStatus('🤖 Бот выиграл!');
            this.highlightWinningCells('O');
        } else {
            this.scores.draws++;
            this.updateStatus('🤝 Ничья!');
        }

        this.updateScores();
        this.disableAllCells();
    }

    highlightWinningCells(player) {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        const winningPattern = winPatterns.find(pattern =>
            pattern.every(index => this.board[index] === player)
        );

        if (winningPattern) {
            winningPattern.forEach(index => {
                const cell = document.querySelector(`.cell[data-index="${index}"]`);
                cell.classList.add('winning-cell');
            });
        }
    }

    disableAllCells() {
        document.querySelectorAll('.cell').forEach(cell => {
            cell.disabled = true;
        });
    }

    updateStatus(message) {
        document.getElementById('status').textContent = message;
    }

    updateScores() {
        document.getElementById('player-score').textContent = this.scores.player;
        document.getElementById('bot-score').textContent = this.scores.bot;
        document.getElementById('draw-score').textContent = this.scores.draws;
    }

    restartGame() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.createBoard();
        this.updateStatus('Ваш ход (X)');
    }

    toggleDifficultySelector() {
        const selector = document.getElementById('difficulty-selector');
        selector.classList.toggle('hidden');
    }

    setDifficulty(level) {
        this.difficulty = level;
        
        // Обновляем активную кнопку
        document.querySelectorAll('#difficulty-selector button').forEach(button => {
            button.classList.toggle('active', button.dataset.difficulty === level);
        });
        
        this.updateStatus(`Сложность: ${this.getDifficultyName(level)}`);
        setTimeout(() => this.restartGame(), 1000);
    }

    getDifficultyName(level) {
        const names = {
            'easy': 'Легкая',
            'medium': 'Средняя', 
            'hard': 'Сложная'
        };
        return names[level] || 'Средняя';
    }
}

// Запуск игры при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new TicTacToe();
});