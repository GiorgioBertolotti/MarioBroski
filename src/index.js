import Tile, { Tiles } from './tiles.js';
import Sprite, { Sprites } from './sprites.js';

const TILESET_FILE_NAME = './assets/tileset.png';
const MARIO_SPRITESHEET_FILE_NAME = './assets/sprites_mario.png';
const LUIGI_SPRITESHEET_FILE_NAME = './assets/sprites_luigi.png';
const SCREEN_WIDTH = window.innerWidth;
const SCREEN_HEIGHT = window.innerHeight;
const BLACK_BAND_HEIGHT = Math.floor(SCREEN_HEIGHT * 0.2);
const TILES_PER_COLUMN = 26;
const TILE_SIZE = 16;
const SPRITE_PER_COLUMN = 3;
const SPRITE_HEIGHT = 32;
const SPRITE_WIDTH = 16;
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
const spriteSheet = new Image();
spriteSheet.src = MARIO_SPRITESHEET_FILE_NAME;
spriteSheet.onload = loadSprites;
const sprites = [];
const clouds = initClouds();

function loadTiles(ev) {
  const w = tileset.width;
  const h = tileset.height;
  for (let x = 0; x < w - 1; x++) {
    for (let y = 0; y < h - 1; y++) {
      const tile = new Tile(tileset, x + 1, y + 1)
      tiles.push(tile);
      y += TILE_SIZE;
    }
    x += TILE_SIZE;
  }
  renderFrame();
}

function loadSprites(ev) {
  const w = spriteSheet.width;
  const h = spriteSheet.height;
  for (let x = 0; x < w - 1; x++) {
    for (let y = 0; y < h - 1; y++) {
      const sprite = new Sprite(spriteSheet, x + 1, y + 1)
      sprites.push(sprite);
      y += SPRITE_HEIGHT;
    }
    x += SPRITE_WIDTH;
  }
}

function initClouds() {
  const maxClouds = 3;
  const cloudsNumber = Math.floor(Math.random() * maxClouds) + 2;
  const chunkWidth = (playgroundWidth / cloudsNumber);
  return new Array(cloudsNumber).fill(0)
    .map((_, index) => ({
      x: (Math.floor(Math.random() * chunkWidth)) + (chunkWidth * index),
      y: (Math.floor(Math.random() * (playgroundHeight / 2))) + BLACK_BAND_HEIGHT,
      type: Math.floor(Math.random() * 4),
      size: Math.floor(Math.random() * 2) + 2
    }));
}

const ball = { x: 100, y: 75 }

function renderFrame() {
  context.clearRect(0, BLACK_BAND_HEIGHT, playgroundWidth, playgroundHeight);
  drawBackground();
  drawGround();
  drawClouds();
  drawCharacter();
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
  const y = BLACK_BAND_HEIGHT + playgroundHeight - (TILE_SIZE * 2);
  const numTiles = Math.floor(playgroundWidth / TILE_SIZE);
  for (let i = 0; i < numTiles; i++) {
    tiles[Tiles.GRASS_TILE].draw(context, i * TILE_SIZE, y);
    tiles[Tiles.GROUND_TILE].draw(context, i * TILE_SIZE, y + TILE_SIZE);
  }
}

function drawClouds() {
  clouds.forEach((cloudPos) => {
    tiles[Tiles.CLOUD_START_TILE + (cloudPos.type * TILES_PER_COLUMN)].draw(context, cloudPos.x, cloudPos.y);
    if (cloudPos.size > 2)
      tiles[Tiles.CLOUD_MIDDLE_TILE + (cloudPos.type * TILES_PER_COLUMN)].draw(context, cloudPos.x + TILE_SIZE, cloudPos.y);
    if (cloudPos.size > 2)
      tiles[Tiles.CLOUD_END_TILE + (cloudPos.type * TILES_PER_COLUMN)].draw(context, cloudPos.x + (TILE_SIZE * 2), cloudPos.y);
    else
      tiles[Tiles.CLOUD_END_TILE + (cloudPos.type * TILES_PER_COLUMN)].draw(context, cloudPos.x + TILE_SIZE, cloudPos.y);
  })
}

const character = {
  x: 20,
  y: BLACK_BAND_HEIGHT + playgroundHeight - (TILE_SIZE * 2) - SPRITE_HEIGHT,
}

function drawCharacter() {
  if (sprites && sprites[Sprites.IDLE_R])
    sprites[Sprites.IDLE_R].draw(context, character.x, character.y);
}