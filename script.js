const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const scoreElement = document.getElementById("score");
const livesElement = document.getElementById("lives");

// 遊戲設定
let basket = { x: 160, y: 550, width: 80, height: 20 };
let objects = []; // 包含水果與炸彈
let score = 0;
let lives = 3;
let gameOver = false;
let gameStarted = false;
let spawnTimer;

// --- 難度與時間控制變數 ---
let lastTime = 0;
const INITIAL_SPEED = 0.3; // 初始基礎速度 (像素/毫秒)
let currentLevel = 1;      // 追蹤目前等級
let levelUpTimer = 0;      // 控制 "SPEED UP!!" 特效顯示時間

// 更新生命值 UI (❤️)
function updateLivesDisplay() {
    livesElement.innerText = "❤️".repeat(lives);
}

// 畫籃子
function drawBasket() {
    ctx.fillStyle = "brown";
    ctx.fillRect(basket.x, basket.y, basket.width, basket.height);
}

// 畫物體 (紅色水果或黑色炸彈)
function drawObject(o) {
    ctx.beginPath();
    ctx.arc(o.x, o.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = o.type === "bomb" ? "black" : "red";
    ctx.fill();
    ctx.closePath();
}

// 生成物體 (40% 機率是炸彈)
function spawnObject() {
    let x = Math.random() * (canvas.width - 20) + 10;
    let type = Math.random() < 0.4 ? "bomb" : "fruit";
    objects.push({ x: x, y: 0, type: type });
}

// 結束遊戲處理
function endGame() {
    gameOver = true;
    clearInterval(spawnTimer);
}

// 更新遊戲畫面
function update(timestamp) {
    if (gameOver) {
        // 畫出半透明遮罩
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.font = "bold 36px Arial";
        ctx.fillText("遊戲結束", canvas.width / 2, 220); 
        
        ctx.fillStyle = "#FFD700"; // 金色得分
        ctx.font = "bold 28px Arial";
        ctx.fillText("總分：" + score, canvas.width / 2, 380);
        
        restartBtn.style.display = "block";
        return;
    }

    // 1. 計算時間差 (Delta Time) 解決不同裝置速度問題
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    // 2. 計算等級與速度 (每 10 分升一級)
    let newLevel = Math.floor(score / 10) + 1;
    if (newLevel > currentLevel) {
        currentLevel = newLevel;
        levelUpTimer = 60; // 顯示特效約 1 秒
    }
    let currentSpeed = INITIAL_SPEED + ( (currentLevel - 1) * 0.05);

    // 3. 清除並重畫
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 繪製 LEVEL 文字 (左上角)
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "left";
    ctx.fillText("LEVEL: " + currentLevel, 10, 25);

    drawBasket();

    for (let i = objects.length - 1; i >= 0; i--) {
        let o = objects[i];
        o.y += currentSpeed * deltaTime;

        // 碰撞檢查 (接到物體)
        if (o.y + 10 > basket.y && o.x > basket.x && o.x < basket.x + basket.width) {
            if (o.type === "fruit") {
                score++;
                scoreElement.innerText = score;
            } else {
                lives--; // 接到炸彈
                updateLivesDisplay();
                if (lives <= 0) endGame();
            }
            objects.splice(i, 1);
            continue;
        }

        // 沒接到 (掉出底部)
        if (o.y > canvas.height) {
            if (o.type === "fruit") {
                lives--; // 漏掉水果也扣血
                updateLivesDisplay();
                if (lives <= 0) endGame();
            }
            objects.splice(i, 1);
            continue;
        }

        drawObject(o);
    }

    // 4. 繪製 SPEED UP!! 閃爍特效
    if (levelUpTimer > 0) {
        ctx.save();
        ctx.textAlign = "center";
        ctx.font = "bold 40px Arial";
        ctx.fillStyle = levelUpTimer % 10 < 5 ? "#FF4500" : "#FFD700"; 
        ctx.fillText("SPEED UP!!", canvas.width / 2, 150);
        ctx.restore();
        levelUpTimer--;
    }

    requestAnimationFrame(update);
}

// --- 控制邏輯 ---
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