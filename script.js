const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const scoreElement = document.getElementById("score");
const livesElement = document.getElementById("lives"); // 取得生命值顯示元素

let basket = { x: 160, y: 550, width: 80, height: 20 };
let objects = []; // 將名稱改為 objects，因為裡面會有水果和炸彈
let score = 0;
let lives = 3; // 設定初始生命
let gameOver = false;
let gameStarted = false;
let spawnTimer;

// 更新生命值顯示 (❤️)
function updateLivesDisplay() {
    livesElement.innerText = "❤️".repeat(lives);
}

// 畫籃子
function drawBasket() {
    ctx.fillStyle = "#8B4513"; // 棕色
    ctx.fillRect(basket.x, basket.y, basket.width, basket.height);
}

// 畫物體 (水果或炸彈)
function drawObject(obj) {
    ctx.beginPath();
    ctx.arc(obj.x, obj.y, 12, 0, Math.PI * 2);
    ctx.fillStyle = obj.type === "bomb" ? "black" : "red"; // 炸彈黑色，水果紅色
    ctx.fill();
    ctx.closePath();
}

// 生成物體 (隨機水果或炸彈)
function spawnObject() {
    let x = Math.random() * (canvas.width - 30) + 15;
    let type = Math.random() < 0.2 ? "bomb" : "fruit"; // 20% 機率生成炸彈
    objects.push({ x: x, y: 0, type: type });
}

// 結束遊戲處理
function endGame() {
    gameOver = true;
    clearInterval(spawnTimer);
}

// 更新遊戲畫面
// 更新遊戲畫面
// 更新遊戲畫面
function update() {
    if (gameOver) {
        // 1. 畫出半透明遮罩
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 2. 設定文字基本樣式
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        // 3. 繪製「遊戲結束」（位於按鈕上方）
        ctx.font = "bold 36px Arial";
        ctx.fillText("遊戲結束", canvas.width / 2, 220); 
        
        // 4. 繪製「最終得分」（位於按鈕下方）
        // 將 Y 座標設為 380，避開中間約 300 位置的按鈕
        ctx.font = "bold 28px Arial";
        ctx.fillStyle = "#FFD700"; // 改成金色，讓分數更顯眼
        ctx.fillText("總分：" + score, canvas.width / 2, 380);
        
        restartBtn.style.display = "block"; 
        return;
    }
  
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBasket();

    for (let i = objects.length - 1; i >= 0; i--) {
        let o = objects[i];
        o.y += 5; // 下落速度

        // 碰撞檢查 (籃子接到物體)
        if (o.y + 10 > basket.y && o.x > basket.x && o.x < basket.x + basket.width) {
            if (o.type === "fruit") {
                score++;
                scoreElement.innerText = score;
            } else {
                // 接到炸彈
                lives--;
                updateLivesDisplay();
                if (lives <= 0) endGame();
            }
            objects.splice(i, 1);
            continue;
        }

        // 沒接到物體 (掉出底部)
        if (o.y > canvas.height) {
            if (o.type === "fruit") {
                lives--; // 漏掉水果也要扣命
                updateLivesDisplay();
                if (lives <= 0) endGame();
            }
            objects.splice(i, 1);
            continue;
        }

        drawObject(o);
    }

    requestAnimationFrame(update);
}

// --- 控制邏輯 ---
canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    let mouseX = e.clientX - rect.left;
    let newX = mouseX - basket.width / 2;
    if (newX < 0) newX = 0;
    if (newX > canvas.width - basket.width) newX = canvas.width - basket.width;
    basket.x = newX;
});

canvas.addEventListener("touchmove", (e) => {
    e.preventDefault(); 
    const rect = canvas.getBoundingClientRect();
    let touchX = e.touches[0].clientX - rect.left;
    let newX = touchX - basket.width / 2;
    if (newX < 0) newX = 0;
    if (newX > canvas.width - basket.width) newX = canvas.width - basket.width;
    basket.x = newX;
}, { passive: false });

startBtn.addEventListener('click', () => {
    if (gameStarted) return;
    gameStarted = true;
    startBtn.style.display = "none";
    updateLivesDisplay();
    update();
    spawnTimer = setInterval(spawnObject, 800);
});

restartBtn.addEventListener('click', () => {
    location.reload();
});