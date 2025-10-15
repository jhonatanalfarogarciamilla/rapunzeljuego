const mazeContainer = document.getElementById('maze-container');
const winScreen = document.getElementById('win-screen');
const startScreen = document.getElementById('start-screen');
const enunciadoScreen = document.getElementById('enunciado-screen');
const gameWrapper = document.getElementById('game-wrapper');
const finImage = document.getElementById('fin-image');
const princesaImage = document.getElementById('princesa-image');
const bgMusic = document.getElementById('bg-music');

const ROWS = 10;
const COLS = 10;
let maze;
let playerPosition = { x: 0, y: 0 };
let playerPose = 0;
let facingDirection = 1;
let trail = [];

// 🔹 Generación del laberinto
function generateMaze(rows, cols) {
    let newMaze = Array.from({ length: rows }, () => Array(cols).fill(1));
    const stack = [];
    const start = { x: 0, y: 0 };

    newMaze[start.y][start.x] = 0;
    stack.push(start);

    while (stack.length > 0) {
        const current = stack[stack.length - 1];
        const neighbors = [];
        const directions = [[0, -2], [0, 2], [-2, 0], [2, 0]];

        for (const [dx, dy] of directions) {
            const nx = current.x + dx;
            const ny = current.y + dy;
            if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && newMaze[ny][nx] === 1) {
                neighbors.push({ x: nx, y: ny, dx, dy });
            }
        }

        if (neighbors.length > 0) {
            const { x: nx, y: ny, dx, dy } = neighbors[Math.floor(Math.random() * neighbors.length)];
            newMaze[ny][nx] = 0;
            newMaze[current.y + dy / 2][current.x + dx / 2] = 0;
            stack.push({ x: nx, y: ny });
        } else {
            stack.pop();
        }
    }

    newMaze[0][0] = 2;
    newMaze[rows - 1][cols - 1] = 3;
    if (newMaze[rows - 2][cols - 1] === 1 && newMaze[rows - 1][cols - 2] === 1)
        newMaze[rows - 2][cols - 1] = 0;

    return newMaze;
}

// 🔹 Renderizar laberinto
function renderMaze() {
    mazeContainer.innerHTML = '';
    for (let y = 0; y < maze.length; y++) {
        for (let x = 0; x < maze[y].length; x++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            if (maze[y][x] === 1) cell.classList.add('wall');
            if (maze[y][x] === 3) cell.classList.add('goal');
            if (trail.some(pos => pos.x === x && pos.y === y)) cell.classList.add('flower-trail');
            if (y === playerPosition.y && x === playerPosition.x) {
                cell.classList.add('player');
                cell.style.backgroundImage = playerPose % 2 === 0 ? "url('rapunzel1.png')" : "url('rapunzel2.png')";
                cell.style.backgroundSize = "cover";
                cell.style.transform = facingDirection === -1 ? "scaleX(-1)" : "scaleX(1)";
            }
            mazeContainer.appendChild(cell);
        }
    }
}

// 🔹 Movimiento del jugador
function movePlayer(dx, dy) {
    const newX = playerPosition.x + dx;
    const newY = playerPosition.y + dy;
    if (newX >= 0 && newX < COLS && newY >= 0 && newY < ROWS && maze[newY][newX] !== 1) {
        trail.push({ x: playerPosition.x, y: playerPosition.y });
        playerPosition.x = newX;
        playerPosition.y = newY;
        playerPose++;
        if (maze[newY][newX] === 3) {
            gameWrapper.classList.add('hidden');

            // 🔹 Limpiar animaciones previas
            finImage.classList.remove('fade-in', 'fade-out');
            princesaImage.classList.remove('fade-in', 'fade-out');

            // 🔹 Mostrar fin
            winScreen.classList.remove('hidden');
            finImage.classList.remove('hidden');
            princesaImage.classList.add('hidden');
            finImage.classList.add('fade-in');
        }
    }
    renderMaze();
}

// 🔹 Flujo del juego
function startGame() {
    if (bgMusic.paused) bgMusic.play();

    enunciadoScreen.classList.add('disintegrating');
    setTimeout(() => {
        enunciadoScreen.classList.add('hidden');
        enunciadoScreen.classList.remove('disintegrating');
        gameWrapper.classList.remove('hidden');

        maze = generateMaze(ROWS, COLS);
        playerPosition = { x: 0, y: 0 };
        playerPose = 0;
        facingDirection = 1;
        trail = [];
        renderMaze();
    }, 1500);
}

function showEnunciado() {
    startScreen.classList.add('disintegrating');
    setTimeout(() => {
        startScreen.classList.add('hidden');
        startScreen.classList.remove('disintegrating');
        enunciadoScreen.classList.remove('hidden');
    }, 1500);
}

// 🔹 Listeners
startScreen.addEventListener('click', showEnunciado);
enunciadoScreen.addEventListener('click', startGame);

// 🔹 Fin → Princesa
winScreen.addEventListener('click', () => {
    finImage.classList.add('fade-out');
    setTimeout(() => {
        finImage.classList.add('hidden');
        finImage.classList.remove('fade-in', 'fade-out');
        princesaImage.classList.remove('fade-in', 'fade-out');
        princesaImage.classList.remove('hidden');
        princesaImage.classList.add('fade-in');
    }, 1000);
});

// 🔹 Reinicio total (excepto música)
princesaImage.addEventListener('click', () => {
    // Ocultar todo
    winScreen.classList.add('hidden');
    gameWrapper.classList.add('hidden');
    finImage.classList.add('hidden');
    princesaImage.classList.add('hidden');
    startScreen.classList.remove('hidden');
    enunciadoScreen.classList.add('hidden');

    // Limpiar animaciones
    finImage.classList.remove('fade-in', 'fade-out');
    princesaImage.classList.remove('fade-in', 'fade-out');

    // Resetear laberinto y jugador
    maze = generateMaze(ROWS, COLS);
    playerPosition = { x: 0, y: 0 };
    playerPose = 0;
    facingDirection = 1;
    trail = [];
    renderMaze();
});

// 🎮 Controles
document.getElementById('up').addEventListener('click', () => movePlayer(0, -1));
document.getElementById('down').addEventListener('click', () => movePlayer(0, 1));
document.getElementById('left').addEventListener('click', () => { facingDirection = -1; movePlayer(-1, 0); });
document.getElementById('right').addEventListener('click', () => { facingDirection = 1; movePlayer(1, 0); });

document.addEventListener('keydown', (e) => {
    if (!gameWrapper.classList.contains('hidden')) {
        switch (e.key) {
            case 'ArrowUp': movePlayer(0, -1); break;
            case 'ArrowDown': movePlayer(0, 1); break;
            case 'ArrowLeft': facingDirection = -1; movePlayer(-1, 0); break;
            case 'ArrowRight': facingDirection = 1; movePlayer(1, 0); break;
        }
    }
});
