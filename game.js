"use strict";

const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const message = document.querySelector("#game-message");
const restartButton = document.querySelector("#restart-button");
const status = document.querySelector("#status");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const WORLD_WIDTH = 3200;
const GRAVITY = 1900;
const MOVE_SPEED = 300;
const JUMP_SPEED = 620;
const JUMP_HOLD_ACCELERATION = 2300;
const MAX_JUMP_HOLD_TIME = 0.12;

const platforms = [
  { x: 0, y: 480, width: 650, height: 100 },
  { x: 760, y: 480, width: 540, height: 100 },
  { x: 1400, y: 480, width: 680, height: 100 },
  { x: 2200, y: 480, width: 1000, height: 100 },
  { x: 270, y: 390, width: 150, height: 20 },
  { x: 860, y: 390, width: 150, height: 20 },
  { x: 1090, y: 330, width: 150, height: 20 },
  { x: 1570, y: 390, width: 150, height: 20 },
  { x: 1850, y: 340, width: 150, height: 20 },
  { x: 2350, y: 390, width: 150, height: 20 },
  { x: 2610, y: 330, width: 150, height: 20 },
];

const hazards = [
  { x: 500, y: 448, width: 52, height: 32 },
  { x: 970, y: 448, width: 52, height: 32 },
  { x: 1690, y: 448, width: 52, height: 32 },
  { x: 2460, y: 448, width: 52, height: 32 },
];

const player = {
  x: 70,
  y: 420,
  width: 34,
  height: 48,
  velocityX: 0,
  velocityY: 0,
  grounded: false,
  jumpHoldTime: 0,
};

const keys = new Set();
let cameraX = 0;
let previousTime = 0;
let gameOver = false;

function resetGame() {
  player.x = 70;
  player.y = 420;
  player.velocityX = 0;
  player.velocityY = 0;
  player.grounded = false;
  player.jumpHoldTime = 0;
  cameraX = 0;
  gameOver = false;
  message.hidden = true;
  status.textContent = "足場を渡って、旗まで進もう。";
}

function jump() {
  if (player.grounded && !gameOver) {
    player.velocityY = -JUMP_SPEED;
    player.grounded = false;
    player.jumpHoldTime = 0;
  }
}

function overlaps(a, b) {
  return a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y;
}

function update(delta) {
  if (gameOver) return;

  const movingLeft = keys.has("ArrowLeft") || keys.has("KeyA");
  const movingRight = keys.has("ArrowRight") || keys.has("KeyD");
  player.velocityX = (Number(movingRight) - Number(movingLeft)) * MOVE_SPEED;

  const oldBottom = player.y + player.height;
  player.x = Math.max(0, Math.min(WORLD_WIDTH - player.width, player.x + player.velocityX * delta));
  player.velocityY += GRAVITY * delta;
  if (keys.has("Space") && player.velocityY < 0 && player.jumpHoldTime < MAX_JUMP_HOLD_TIME) {
    const holdDelta = Math.min(delta, MAX_JUMP_HOLD_TIME - player.jumpHoldTime);
    player.velocityY -= JUMP_HOLD_ACCELERATION * holdDelta;
    player.jumpHoldTime += holdDelta;
  }
  player.y += player.velocityY * delta;
  player.grounded = false;

  for (const platform of platforms) {
    const newBottom = player.y + player.height;
    const horizontallyOverlapping =
      player.x + player.width > platform.x && player.x < platform.x + platform.width;
    if (horizontallyOverlapping && oldBottom <= platform.y && newBottom >= platform.y && player.velocityY >= 0) {
      player.y = platform.y - player.height;
      player.velocityY = 0;
      player.grounded = true;
      player.jumpHoldTime = 0;
    }
  }

  if (hazards.some((hazard) => overlaps(player, hazard)) || player.y > HEIGHT + 120) {
    resetGame();
    status.textContent = "あっ！もう一度チャレンジしよう。";
    return;
  }

  if (player.x + player.width >= 3060) {
    gameOver = true;
    message.hidden = false;
    restartButton.focus();
  }

  cameraX = Math.max(0, Math.min(WORLD_WIDTH - WIDTH, player.x - WIDTH * 0.35));
  const progress = Math.min(100, Math.floor((player.x / 3060) * 100));
  status.textContent = `ゴールまで ${progress}%`;
}

function drawBackground() {
  const sky = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  sky.addColorStop(0, "#8bd5e5");
  sky.addColorStop(1, "#d7f1df");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.fillStyle = "rgba(255, 245, 190, 0.9)";
  ctx.beginPath();
  ctx.arc(790 - cameraX * 0.08, 100, 38, 0, Math.PI * 2);
  ctx.fill();

  drawHillLayer("#a9d9c8", 0.16, 370, 110);
  drawHillLayer("#83c3b5", 0.3, 420, 80);
}

function drawHillLayer(color, speed, baseY, height) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, HEIGHT);
  for (let x = -100; x <= WIDTH + 100; x += 100) {
    const worldX = x + cameraX * speed;
    const y = baseY - (Math.sin(worldX * 0.004) * 0.5 + 0.5) * height;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(WIDTH, HEIGHT);
  ctx.closePath();
  ctx.fill();
}

function drawPlatform(platform) {
  const x = platform.x - cameraX;
  if (x + platform.width < -10 || x > WIDTH + 10) return;

  ctx.fillStyle = platform.height > 30 ? "#966747" : "#bd885b";
  ctx.fillRect(x, platform.y, platform.width, platform.height);
  ctx.fillStyle = "#6fc18a";
  ctx.fillRect(x, platform.y, platform.width, 10);
  ctx.fillStyle = "rgba(255, 255, 255, 0.14)";
  ctx.fillRect(x, platform.y + 11, platform.width, 3);
}

function drawHazard(hazard) {
  const x = hazard.x - cameraX;
  if (x + hazard.width < 0 || x > WIDTH) return;
  ctx.fillStyle = "#e87970";
  const spikes = 3;
  for (let i = 0; i < spikes; i += 1) {
    const spikeX = x + (hazard.width / spikes) * i;
    ctx.beginPath();
    ctx.moveTo(spikeX, hazard.y + hazard.height);
    ctx.lineTo(spikeX + hazard.width / spikes / 2, hazard.y);
    ctx.lineTo(spikeX + hazard.width / spikes, hazard.y + hazard.height);
    ctx.closePath();
    ctx.fill();
  }
}

function drawGoal() {
  const x = 3060 - cameraX;
  ctx.fillStyle = "#5c664f";
  ctx.fillRect(x, 350, 8, 130);
  ctx.fillStyle = "#f5a75b";
  ctx.beginPath();
  ctx.moveTo(x + 8, 352);
  ctx.lineTo(x + 72, 372);
  ctx.lineTo(x + 8, 392);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#f8e9ba";
  ctx.beginPath();
  ctx.arc(x + 4, 346, 8, 0, Math.PI * 2);
  ctx.fill();
}

function drawPlayer() {
  const x = player.x - cameraX;
  const y = player.y;
  ctx.fillStyle = "#31496c";
  ctx.fillRect(x + 3, y + 12, player.width - 6, player.height - 12);
  ctx.fillStyle = "#f1b58b";
  ctx.fillRect(x + 5, y + 2, player.width - 10, 22);
  ctx.fillStyle = "#f5f3ec";
  ctx.fillRect(x + 20, y + 9, 5, 6);
  ctx.fillStyle = "#263950";
  ctx.fillRect(x + 22, y + 11, 2, 3);
  ctx.fillStyle = "#f39c73";
  ctx.fillRect(x + 7, y + 39, 8, 9);
  ctx.fillRect(x + 21, y + 39, 8, 9);
  ctx.fillStyle = "#f5f3ec";
  ctx.fillRect(x + 1, y + 19, 6, 13);
}

function render() {
  drawBackground();
  for (const platform of platforms) drawPlatform(platform);
  for (const hazard of hazards) drawHazard(hazard);
  drawGoal();
  drawPlayer();
}

function frame(time) {
  const delta = Math.min((time - previousTime) / 1000 || 0, 1 / 30);
  previousTime = time;
  update(delta);
  render();
  requestAnimationFrame(frame);
}

window.addEventListener("keydown", (event) => {
  const key = event.code;
  if (["ArrowLeft", "ArrowRight", "Space"].includes(key)) event.preventDefault();
  const isNewPress = !keys.has(key);
  keys.add(key);
  if (isNewPress && (key === "Space" || key === "ArrowUp" || key === "KeyW")) jump();
  if (key === "KeyR") resetGame();
});

window.addEventListener("keyup", (event) => keys.delete(event.code));
window.addEventListener("blur", () => keys.clear());
restartButton.addEventListener("click", resetGame);

requestAnimationFrame(frame);
