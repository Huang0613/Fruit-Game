const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const scoreElement = document.getElementById("score");

let basket = { x: 160, y: 550, width: 80, height: 20 };
let fruits = [];
let score = 0;
let gameOver = false;
let gameStarted = false; // 防重複開關
let fruitInterval; // 用來存儲計時器

// 畫籃子
function drawBasket() {
    ctx.fillStyle = "brown";
    ctx.fillRect(basket.x, basket.y, basket.width, basket.height);
}

// 畫水果
function drawFruit(f) {
    ctx.beginPath();
    ctx.arc(f.x, f.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = "red";
    ctx.fill();
}

// 生成水果
function spawnFruit() {
    let x = Math.random() * (canvas.width - 20) + 10;
    fruits.push({ x: x, y: 0 });
}

// 更新遊戲畫面
function update() {
    if (gameOver) {
        ctx.fillStyle = "black";
        ctx.font = "30px Arial";
        ctx.textAlign = "center";
        ctx.fillText("遊戲結束", canvas.width / 2, 300);
        
        restartBtn.style.display = "block"; // 顯示重新開始按鈕
        clearInterval(fruitInterval); // 停止生成水果
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBasket();

    fruits.forEach((f, index) => {
        f.y += 5; // 水果掉落速度

        // 碰撞檢查 (接到水果)
        if (f.y > basket.y && f.x > basket.x && f.x < basket.x + basket.width) {
            fruits.splice(index, 1);
            score++;
            scoreElement.innerText = score;
        }

        // 沒接到水果
        if (f.y > canvas.height) {
            gameOver = true;
        }

        drawFruit(f);
    });

    requestAnimationFrame(update);
}

// 🖱️ 改為滑鼠控制：籃子跟著游標走
canvas.addEventListener("mousemove", (e) => {
    // 1. 取得畫布在視窗中的位置
    const rect = canvas.getBoundingClientRect();
    
    // 2. 計算滑鼠在畫布內的 X 座標
    let mouseX = e.clientX - rect.left;
    
    // 3. 讓籃子中心對準滑鼠，並限制在畫布內
    let newX = mouseX - basket.width / 2;
    
    // 防止籃子跑出左邊或右邊
    if (newX < 0) newX = 0;
    if (newX > canvas.width - basket.width) newX = canvas.width - basket.width;
    
    basket.x = newX;
});
// 📱 支援手機觸控滑動
canvas.addEventListener("touchmove", (e) => {
    // 1. 防止手機網頁在玩遊戲時上下亂捲動
    e.preventDefault(); 
    
    // 2. 取得畫布在手機螢幕上的位置
    const rect = canvas.getBoundingClientRect();
    
    // 3. 取得手指觸控的第一個點 (e.touches[0])
    let touchX = e.touches[0].clientX - rect.left;
    
    // 4. 計算籃子新位置 (讓中心點對準手指)
    let newX = touchX - basket.width / 2;
    
    // 5. 邊界檢查 (防止籃子滑出螢幕)
    if (newX < 0) newX = 0;
    if (newX > canvas.width - basket.width) newX = canvas.width - basket.width;
    
    basket.x = newX;
}, { passive: false }); // 這個 { passive: false } 是為了讓 e.preventDefault() 生效

// 開始按鈕點擊
startBtn.addEventListener('click', () => {
    if (gameStarted) return;
    gameStarted = true;
    startBtn.style.display = "none";
    
    update(); // 開始畫圖
    fruitInterval = setInterval(spawnFruit, 800); // 開始丟水果
});

// 重新開始點擊
restartBtn.addEventListener('click', () => {
    location.reload();
});