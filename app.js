

let currentQuestion = {};
let isRapidFireMode = false;
let rapidFireScore = 0;
let highScores = [];
let currentLevel = 1;
let enemies = [];
let lives = 3;
let gameTimer;
let achievements = [];



function changeLevel() {
    currentLevel = parseInt(document.getElementById('level-select').value);
    generateQuestion();
}

function generateQuestion(isRapidFire = false) {
    const operation = getSelectedOperation();
    let num1, num2;

    if (currentLevel > 3) { // For levels above Captain (Level 3)
        num1 = Math.floor(Math.random() * 50) + 1; // Random number between 1 and 50
        num2 = Math.floor(Math.random() * 50) + 1; // Random number between 1 and 50
    } else if (operation === '/') {
        // Ensure num2 is always a factor of num1 and not zero
        num2 = Math.floor(Math.random() * 5) + 1; // Random factor between 1 and 5
        num1 = num2 * (Math.floor(Math.random() * 10) + 1); // num1 is a multiple of num2
    } else {
        num1 = Math.floor(Math.random() * 9) + 1; // Ensure num1 is between 1 and 9
        num2 = Math.floor(Math.random() * 9) + 1; // Ensure num2 is between 1 and 9
    }

    currentQuestion = {
        num1,
        num2,
        operation,
        answer: calculateAnswer(num1, num2, operation)
    };

    const questionElement = isRapidFire ? 'rapid-fire-question' : 'question';
    document.getElementById(questionElement).innerText = `${num1} ${operation} ${num2} = ?`;
}

function calculateAnswer(num1, num2, operation) {
    switch (operation) {
        case '+':
            return num1 + num2;
        case '-':
            return num1 - num2;
        case '*':
            return num1 * num2;
        case '/':
            return num2 !== 0 ? (num1 / num2).toFixed(2) : 'undefined'; // Avoid division by zero
        default:
            return 0;
    }
}

function checkAnswer() {
    const userAnswer = parseFloat(document.getElementById('answer').value);
    const feedback = document.getElementById('feedback');
    if (isNaN(userAnswer)) {
        feedback.innerText = 'Please enter a valid number.';
        feedback.className = 'incorrect';
    } else if (userAnswer === parseFloat(currentQuestion.answer)) {
        feedback.innerText = 'Correct!';
        feedback.className = 'correct';
        updateAchievements();
    } else {
        feedback.innerText = 'Incorrect. Try again.';
        feedback.className = 'incorrect';
    }
    document.getElementById('answer').value = '';
    generateQuestion();
}


window.onload = function() {
    generateQuestion();
    document.getElementById('rapid-fire-mode').addEventListener('click', showTimerSelection);
    
    document.getElementById('answer').addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            checkAnswer();
        }
    });
    
    document.getElementById('rapid-fire-answer').addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            checkRapidFireAnswer();
        }
    });
    
    // Initialize highScores if it's not already done
    if (!highScores || !Array.isArray(highScores)) {
        highScores = [];
    }
};

function showTimerSelection() {
    document.getElementById('normal-mode').style.display = 'none';
    document.getElementById('rapid-fire-mode').style.display = 'none';
    document.getElementById('timer-selection').style.display = 'block';
}

function startRapidFireMode() {
    isRapidFireMode = true;
    document.getElementById('timer-selection').style.display = 'none';
    document.getElementById('rapid-fire-area').style.display = 'block';
    rapidFireScore = 0;
    lives = 3;
    updateScore();
    updateLives();
    startTimer();
    generateQuestion(true);
    spawnEnemies();
}

function startTimer() {
    const selectedTime = parseInt(document.getElementById('timer-select').value);
    let timeLeft = selectedTime;
    const timerElement = document.getElementById('timer');
    timerElement.textContent = timeLeft;
    gameTimer = setInterval(() => {
        timeLeft--;
        timerElement.textContent = timeLeft;
        if (timeLeft <= 0) {
            endRapidFireMode();
        }
    }, 1000);
}

function getSelectedOperation() {
    const operationSelect = document.getElementById('operation-select');
    const selectedValue = operationSelect.value;

    if (selectedValue === 'mixed') {
        const operations = ['+', '-', '*', '/'];
        return operations[Math.floor(Math.random() * operations.length)];
    } else if (selectedValue === 'addition') {
        return '+';
    } else if (selectedValue === 'subtraction') {
        return '-';
    } else if (selectedValue === 'multiplication') {
        return '*';
    } else if (selectedValue === 'division') {
        return '/';
    }
}

function checkRapidFireAnswer() {
    const userAnswer = parseFloat(document.getElementById('rapid-fire-answer').value);
    if (isNaN(userAnswer)) {
        // Optionally provide feedback for invalid input
    } else if (userAnswer === parseFloat(currentQuestion.answer)) {
        rapidFireScore++;
        updateScore();
        shootLaser();
    }
    document.getElementById('rapid-fire-answer').value = '';
    generateQuestion(true);
}

function updateScore() {
    document.getElementById('score').textContent = `Score: ${rapidFireScore}`;
}

function updateLives() {
    const lifeElements = document.querySelectorAll('#lives .life');
    lifeElements.forEach((life, index) => {
        if (index < lives) {
            life.style.visibility = 'visible';
        } else {
            life.style.visibility = 'hidden';
        }
    });
}

function spawnEnemies() {
    if (!isRapidFireMode) return;
    const enemy = document.createElement('div');
    enemy.className = 'enemy';
    enemy.style.left = `${Math.random() * (document.getElementById('space-battle').offsetWidth - 40)}px`;
    enemy.style.top = '0px';
    document.getElementById('enemies').appendChild(enemy);
    enemies.push(enemy);
    animateEnemy(enemy);
    setTimeout(spawnEnemies, 2000 / currentLevel);
}

function animateEnemy(enemy) {
    let pos = 0;
    const animation = setInterval(() => {
        pos++;
        enemy.style.top = `${pos}px`;
        if (pos > document.getElementById('space-battle').offsetHeight) {
            clearInterval(animation);
            enemy.remove();
            enemies = enemies.filter(e => e !== enemy);
            lives--;
            updateLives();
            if (lives <= 0) {
                endRapidFireMode();
            }
        }
    }, 50 / currentLevel);
}

function shootLaser() {
    const playerShip = document.getElementById('player-ship');
    const playerRect = playerShip.getBoundingClientRect();
    const battleRect = document.getElementById('space-battle').getBoundingClientRect();
    
    const targetEnemy = findClosestEnemy();
    if (targetEnemy) {
        const enemyRect = targetEnemy.getBoundingClientRect();
        
        const laser = document.createElement('div');
        laser.className = 'laser';
        
        const startX = playerRect.left + playerRect.width / 2 - battleRect.left; // Center of the spaceship
        const startY = battleRect.bottom - playerRect.bottom; // Bottom of the spaceship
        const endX = enemyRect.left + enemyRect.width / 2 - battleRect.left; // Center of the enemy
        const endY = battleRect.bottom - enemyRect.top; // Top of the enemy
        
        const angle = Math.atan2(endY - startY, endX - startX);
        const length = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
        
        const laserLength = length * 100; // Significantly increase this multiplier to make the laser longer
        
        laser.style.width = `${laserLength}px`;
        laser.style.left = `${startX}px`;
        laser.style.bottom = `${startY}px`;
        laser.style.transform = `rotate(${angle}rad)`;
        
        document.getElementById('space-battle').appendChild(laser);
        
        setTimeout(() => {
            laser.remove();
            destroyEnemy(targetEnemy);
        }, 200);
    }
}

function findClosestEnemy() {
    if (enemies.length === 0) return null;
    return enemies.reduce((closest, enemy) => {
        const rect = enemy.getBoundingClientRect();
        const distance = rect.bottom;
        return closest ? (distance < closest.getBoundingClientRect().bottom ? enemy : closest) : enemy;
    }, null);
}

function destroyEnemy(enemy) {
    enemy.remove();
    enemies = enemies.filter(e => e !== enemy);
}

function endRapidFireMode() {
    isRapidFireMode = false;
    clearInterval(gameTimer);
    enemies.forEach(enemy => enemy.remove());
    enemies = [];
    document.getElementById('rapid-fire-area').style.display = 'none';
    updateHighScores();
    showScoreboard();
}

function updateHighScores() {
    if (!highScores.includes(rapidFireScore)) {
        highScores.push(rapidFireScore);
        highScores.sort((a, b) => b - a);
        highScores = highScores.slice(0, 5); // Keep only top 5 unique scores
    }
}

function showScoreboard() {
    let scoreboardHTML = `
        <h2>Rapid Fire Mode Ended!</h2>
        <p>Your score: ${rapidFireScore}</p>
        <h3>Top Scores:</h3>
        <ol>
    `;
    highScores.forEach(score => {
        scoreboardHTML += `<li>${score}</li>`;
    });
    scoreboardHTML += `
        </ol>
        <button id="closeButton">Close</button>
    `;
    
    const scoreboard = document.getElementById('scoreboard');
    scoreboard.innerHTML = scoreboardHTML;
    scoreboard.style.display = 'block';
    
    // Attach event listener for the Close button
    document.getElementById('closeButton').addEventListener('click', closeScoreboard);
}

function closeScoreboard() {
    document.getElementById('scoreboard').style.display = 'none';
    document.getElementById('normal-mode').style.display = 'block';
    document.getElementById('rapid-fire-mode').style.display = 'block';
    generateQuestion();
}

window.onload = function() {
    generateQuestion();
    document.getElementById('rapid-fire-mode').addEventListener('click', showTimerSelection);
    
    document.getElementById('answer').addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            checkAnswer();
        }
    });
    
    document.getElementById('rapid-fire-answer').addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            checkRapidFireAnswer();
        }
    });
    
    // Initialize highScores if it's not already done
    if (!highScores || !Array.isArray(highScores)) {
        highScores = [];
    }
};