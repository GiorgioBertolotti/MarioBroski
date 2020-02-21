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

let testicoloPosition = { x: 100, y: 75 }
function renderFrame() {
  context.clearRect(0, BLACK_BAND_HEIGHT, playgroundWidth, playgroundHeight);
  drawBackground();
  drawGround();
  context.beginPath();
  context.arc(testicoloPosition.x, testicoloPosition.y + BLACK_BAND_HEIGHT, 50, 0, 2 * Math.PI);
  context.stroke();
  testicoloPosition.x += Math.random() * 20 - 10;
  testicoloPosition.y += Math.random() * 20 - 10;

  requestAnimationFrame(renderFrame);
}

function drawBackground() {
  context.fillStyle = "#6b8cff";
  context.fillRect(0, BLACK_BAND_HEIGHT, playgroundWidth, playgroundHeight);
}

function drawGround() {
  const y = BLACK_BAND_HEIGHT + playgroundHeight - 16;
  const numTiles = Math.floor(SCREEN_HEIGHT / 16);
  for (let i = 0; i < numTiles; i++) {
    tiles[29].draw(context, i * 16, y);
  }
}