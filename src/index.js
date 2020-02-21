import Tile from './tiles.js';

const TILESET_FILE_NAME = './assets/tileset.png';
const SCREEN_WIDTH = window.innerWidth;
const SCREEN_HEIGHT = window.innerHeight;
const BLACK_BAND_HEIGHT = SCREEN_HEIGHT * 0.2;
const playgroundWidth = SCREEN_WIDTH;
const playgroundHeight = SCREEN_HEIGHT - (BLACK_BAND_HEIGHT * 2);

const canvas = document.getElementById("canvas");
canvas.width = SCREEN_WIDTH;
canvas.height = SCREEN_HEIGHT;
const context = canvas.getContext("2d");
context.strokeStyle = "#fff";

const tileset = new Image();
tileset.src = TILESET_FILE_NAME;
tileset.onload = loadTiles;
const tiles = [];

function loadTiles(img, ev) {
  const w = tileset.width;
  const h = tileset.height;
  for (let x = 0; x < w - 1; x++) {
    for (let y = 0; y < h - 1; y++) {
      const tile = new Tile(tileset, x + 1, y + 1)
      tiles.push(tile);
      y += 16;
    }
    x += 16;
  }
  renderFrame();
}

const ball = { x: 100, y: 75 }
const maxClouds = 4;
const cloudsNumber = Math.floor(Math.random() * maxClouds) + 1;
const chunkWidth = (SCREEN_WIDTH / cloudsNumber);
const clouds = new Array(cloudsNumber).fill(0)
  .map((_, index) => ({
    x: (Math.floor(Math.random() * chunkWidth)) + (chunkWidth * index),
    y: (Math.floor(Math.random() * (playgroundHeight / 2))) + BLACK_BAND_HEIGHT,
    type: Math.floor(Math.random() * 4),
    size: Math.floor(Math.random() * 2) + 2
  }));
function renderFrame() {
  context.clearRect(0, BLACK_BAND_HEIGHT, playgroundWidth, playgroundHeight);
  drawBackground();
  drawGround();
  drawClouds();
  context.beginPath();
  context.arc(ball.x, ball.y + BLACK_BAND_HEIGHT, 50, 0, 2 * Math.PI);
  context.stroke();
  ball.x += Math.random() * 20 - 10;
  ball.y += Math.random() * 20 - 10;

  requestAnimationFrame(renderFrame);
}

function drawBackground() {
  context.fillStyle = "#6b8cff";
  context.fillRect(0, BLACK_BAND_HEIGHT, playgroundWidth, playgroundHeight);
}

function drawGround() {
  const y = BLACK_BAND_HEIGHT + playgroundHeight - 16;
  const numTiles = Math.floor(SCREEN_WIDTH / 16);
  for (let i = 0; i < numTiles; i++) {
    tiles[29].draw(context, i * 16, y);
  }
}

function drawClouds() {
  clouds.forEach((cloudPos) => {
    tiles[231 + (cloudPos.type * 26)].draw(context, cloudPos.x, cloudPos.y);
    if (cloudPos.size > 2)
      tiles[232 + (cloudPos.type * 26)].draw(context, cloudPos.x + 16, cloudPos.y);
    if (cloudPos.size > 2)
      tiles[233 + (cloudPos.type * 26)].draw(context, cloudPos.x + 32, cloudPos.y);
    else
      tiles[233 + (cloudPos.type * 26)].draw(context, cloudPos.x + 16, cloudPos.y);
  })
}