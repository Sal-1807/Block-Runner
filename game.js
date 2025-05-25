document.addEventListener('DOMContentLoaded', () => {
    const player = document.getElementById('player');
    const gameContainer = document.querySelector('.game-container');
    const scoreDisplay = document.getElementById('score-display');
    const highScoreDisplay = document.getElementById('high-score-display');
    const gameOverDisplay = document.getElementById('game-over');
    const startScreen = document.getElementById('start-screen');
    
    let isJumping = false;
    let isGameOver = false;
    let isGameStarted = false;
    let score = 0;
    let highScore = localStorage.getItem('highScore') || 0;
    let gameSpeed = 3;
    let gravity = 0.9;
    let playerVelocity = 0;
    let obstacles = [];
    let animationId;
    let scoreInterval;
    let lastObstacleTime = 0;
    
    highScoreDisplay.textContent = `High Score: ${highScore}`;
    
    function startGame() {
        isGameOver = false;
        isGameStarted = true;
        score = 0;
        gameSpeed = 3;
        player.style.bottom = '20px';
        startScreen.classList.add('hidden');
        gameOverDisplay.classList.add('hidden');
        lastObstacleTime = Date.now();
        
        obstacles.forEach(obstacle => obstacle.element.remove());
        obstacles = [];
        
        scoreInterval = setInterval(updateScore, 100);
        gameLoop();
    }
    
    function gameLoop() {
        if (isGameOver) {
            cancelAnimationFrame(animationId);
            return;
        }
        
        updatePlayer();
        updateObstacles();
        checkCollisions();
        
        animationId = requestAnimationFrame(gameLoop);
    }
    
    function updatePlayer() {
        if (isJumping) {
            playerVelocity -= gravity;
            const currentBottom = parseInt(player.style.bottom) || 20;
            const newBottom = currentBottom + playerVelocity;
            
            if (newBottom <= 20) {
                player.style.bottom = '20px';
                isJumping = false;
                playerVelocity = 0;
            } else {
                player.style.bottom = `${newBottom}px`;
            }
        }
    }
    
    function jump() {
        if (!isJumping && isGameStarted && !isGameOver) {
            isJumping = true;
            playerVelocity = 14;
        } else if (isGameOver) {
            startGame();
        } else if (!isGameStarted) {
            startGame();
        }
    }
    
    function createObstacle() {
        const now = Date.now();
        // Increased minimum space between obstacles (60px equivalent)
        if (now - lastObstacleTime < (60/gameSpeed)*16) return;
        
        const obstacle = document.createElement('div');
        obstacle.className = 'obstacle';
        obstacle.style.left = '800px';
        gameContainer.appendChild(obstacle);
        
        obstacles.push({
            element: obstacle,
            x: 800,
            y: 20,
            width: 20,
            height: 40
        });
        
        lastObstacleTime = now;
    }
    
    function updateObstacles() {
        obstacles.forEach((obstacle, index) => {
            obstacle.x -= gameSpeed;
            obstacle.element.style.left = `${obstacle.x}px`;
            
            if (obstacle.x < -obstacle.width) {
                obstacle.element.remove();
                obstacles.splice(index, 1);
            }
        });
        
        // Reduced spawn probability slightly
        if (Math.random() < 0.008 && obstacles.length < 2) {
            createObstacle();
        }
    }
    
    function checkCollisions() {
        const playerRect = {
            x: 55,
            y: parseInt(player.style.bottom) + 2 || 22,
            width: 10,
            height: 16
        };
        
        for (const obstacle of obstacles) {
            const obstacleRect = {
                x: obstacle.x + 5,
                y: obstacle.y + 5,
                width: obstacle.width - 10,
                height: obstacle.height - 10
            };
            
            if (
                playerRect.x < obstacleRect.x + obstacleRect.width &&
                playerRect.x + playerRect.width > obstacleRect.x &&
                playerRect.y < obstacleRect.y + obstacleRect.height &&
                playerRect.y + playerRect.height > obstacleRect.y
            ) {
                gameOver();
                return;
            }
        }
    }
    
    function gameOver() {
        isGameOver = true;
        clearInterval(scoreInterval);
        gameOverDisplay.classList.remove('hidden');
        
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('highScore', highScore);
            highScoreDisplay.textContent = `High Score: ${highScore}`;
        }
    }
    
    function updateScore() {
        score++;
        scoreDisplay.textContent = `Score: ${score}`;
        
        if (score % 200 === 0) {
            gameSpeed += 0.25;
        }
    }
    
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            jump();
        }
    });
    
    gameContainer.addEventListener('touchstart', (e) => {
        e.preventDefault();
        jump();
    });
});