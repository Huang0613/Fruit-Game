const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const scoreElement = document.getElementById("score");
const livesElement = document.getElementById("lives");

// 遊戲設定
let basket = { x: 160, y: 550, width: 80, height: 20 };
let objects = [];
let score = 0;
let lives = 3;
let gameOver = false;
let gameStarted = false;
let spawnTimer;

// --- 難度與等級變數 ---
let lastTime = 0;
const INITIAL_SPEED = 0.3;
let currentLevel = 1; // 追蹤目前等級
let levelUpTimer = 0; // 用來控制特效顯示的時間

function updateLivesDisplay() {
    livesElement.innerText = "❤️".repeat(lives);
}

function drawBasket() {
    ctx.fillStyle = "brown";
    ctx.fillRect(basket.x, basket.y, basket.width, basket.height);
}

function drawObject(o) {
    ctx.beginPath();
    ctx.arc(o.x, o.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = o.type === "bomb" ? "black" : "red";
    ctx.fill();
    ctx.closePath();
}

function spawnObject() {
    let x = Math.random() * (canvas.width - 20) + 10;
    let type = Math.random() < 0.4 ? "bomb" : "fruit";
    objects.push({ x: x, y: 0, type: type });
}

function endGame() {
    gameOver = true;
    clearInterval(spawnTimer);
}

// 更新遊戲畫面
function update(timestamp) {
    if (gameOver) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.font = "bold 36px Arial";
        ctx.fillText("遊戲結束", canvas.width / 2, 220); 
        ctx.fillStyle = "#FFD700";
        ctx.font = "bold 28px Arial";
        ctx.fillText("最終得分：" + score, canvas.width / 2, 380);
        restartBtn.style.display = "block";
        return;
    }

    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    // 1. ✨ 計算等級與速度
    let newLevel = Math.floor(score / 10) + 1;
    if (newLevel > currentLevel) {
        currentLevel = newLevel;
        levelUpTimer = 60; // 特效顯示約 1 秒 (60 幀)
    }
    let currentSpeed = INITIAL_SPEED + ( (currentLevel - 1) * 0.05);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 2. ✨ 繪製等級文字 (固定在最上方)
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "left";
    ctx.fillText("LEVEL: " + currentLevel, 10, 25);

    drawBasket();

    for (let i = objects.length - 1; i >= 0; i--) {
        let o = objects[i];
        o.y += currentSpeed * deltaTime;

        if (o.y + 10 > basket.y && o.x > basket.x && o.x < basket.x + basket.width) {
            if (o.type === "fruit") {
                score++;
                scoreElement.innerText = score;
            } else {
                lives--;
                updateLivesDisplay();
                if (lives <= 0) endGame();
            }
            objects.splice(i, 1);
            continue;
        }

        if (o.y > canvas.height) {
            if (o.type === "fruit") {
                lives--;
                updateLivesDisplay();
                if (lives <= 0) endGame();
            }
            objects.splice(i, 1);
            continue;
        }
        drawObject(o);
    }

    // 3. ✨ 繪製 Level Up! 閃爍特效
    if (levelUpTimer > 0) {
        ctx.save();
        ctx.textAlign = "center";
        ctx.font = "bold 40px Arial";
        // 讓文字有閃爍感 (利用 timer 的奇偶數)
        ctx.fillStyle = levelUpTimer % 10 < 5 ? "#FF4500" : "#FFD700"; 
        ctx.fillText("SPEED UP!!", canvas.width / 2, 150);
        ctx.restore();
        levelUpTimer--;
    }

    requestAnimationFrame(update);
}

// 控制邏輯
const handleMove = (clientX) => {
    const rect = canvas.getBoundingClientRect();
    let x = clientX - rect.left;
    let newX = x - basket.width / 2;
    if (newX < 0) newX = 0;
    if (newX > canvas.width - basket.width) newX = canvas.width - basket.width;
    basket.x = newX;
};

canvas.addEventListener("mousemove", (e) => handleMove(e.clientX));
canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    handleMove(e.touches[0].clientX);
}, { passive: false });

startBtn.addEventListener('click', () => {
    if (gameStarted) return;
    gameStarted = true;
    startBtn.style.display = "none";
    updateLivesDisplay();
    lastTime = performance.now();
    requestAnimationFrame(update);
    spawnTimer = setInterval(spawnObject, 800);
});

restartBtn.addEventListener('click', () => {
    location.reload();
});