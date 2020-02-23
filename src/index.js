import Tile, { Tiles } from './tiles.js';
import Sprite from './sprites.js';
import Character from './character.js';

// consts
const TILESET_FILE_NAME = './assets/tileset.png';
const MARIO_SPRITESHEET_FILE_NAME = './assets/sprites_mario.png';
const LUIGI_SPRITESHEET_FILE_NAME = './assets/sprites_luigi.png';
const BG_FILE_NAME = './assets/bg.png';
export const SCREEN_WIDTH = window.innerWidth;
const SCREEN_HEIGHT = window.innerHeight;
// const BLACK_BAND_HEIGHT = Math.floor(SCREEN_HEIGHT * 0.2);
const BLACK_BAND_HEIGHT = 0;
const TILES_PER_COLUMN = 26;
const TILE_SIZE = 64;
const SPRITE_PER_COLUMN = 3;
export const SPRITE_HEIGHT = 128;
const SPRITE_WIDTH = 64;
const playgroundWidth = SCREEN_WIDTH;
const playgroundHeight = SCREEN_HEIGHT - (BLACK_BAND_HEIGHT * 2);

// canvas
const canvas = document.getElementById("canvas");
canvas.width = SCREEN_WIDTH;
canvas.height = SCREEN_HEIGHT;
const context = canvas.getContext("2d");
context.strokeStyle = "#fff";

// tileset
const tileset = new Image();
tileset.src = TILESET_FILE_NAME;
tileset.onload = loadTiles;
const tiles = [];
// sprite sheet
const marioSpriteSheet = new Image();
const marioSprites = [];
marioSpriteSheet.src = MARIO_SPRITESHEET_FILE_NAME;
marioSpriteSheet.onload = () => loadSprites(marioSpriteSheet, marioSprites);
const luigiSpriteSheet = new Image();
const luigiSprites = [];
luigiSpriteSheet.src = LUIGI_SPRITESHEET_FILE_NAME;
luigiSpriteSheet.onload = () => loadSprites(luigiSpriteSheet, luigiSprites);
// character
const character = new Character(marioSprites, 20, BLACK_BAND_HEIGHT + playgroundHeight - (TILE_SIZE * 2) - SPRITE_HEIGHT);
// background
const background = new Image();
background.src = BG_FILE_NAME;
// cloud generation
const clouds = initClouds();

function loadTiles(ev) {
  const w = tileset.width;
  const h = tileset.height;
  for (let x = 0; x < w - 4; x += 4) {
    for (let y = 0; y < h - 4; y += 4) {
      const tile = new Tile(tileset, x + 3, y + 3)
      tiles.push(tile);
      y += TILE_SIZE;
    }
    x += TILE_SIZE;
  }
  renderFrame();
}

function loadSprites(spriteSheet, spritesContainer) {
  const w = spriteSheet.width;
  const h = spriteSheet.height;
  for (let x = 0; x < w - 4; x += 4) {
    for (let y = 0; y < h - 4; y += 4) {
      const sprite = new Sprite(spriteSheet, x + 4, y + 4)
      spritesContainer.push(sprite);
      y += SPRITE_HEIGHT;
    }
    x += SPRITE_WIDTH;
  }
}

function initClouds() {
  const maxClouds = 3;
  const cloudsNumber = Math.floor(Math.random() * maxClouds) + 2;
  const chunkWidth = Math.floor((playgroundWidth / cloudsNumber));
  return new Array(cloudsNumber).fill(0)
    .map((_, index) => ({
      x: (Math.floor(Math.random() * chunkWidth)) + (chunkWidth * index),
      y: (Math.floor(Math.random() * (playgroundHeight / 4))) + BLACK_BAND_HEIGHT,
      type: 0,
      size: Math.floor(Math.random() * 2) + 2
    }));
}

function renderFrame() {
  context.clearRect(0, BLACK_BAND_HEIGHT, playgroundWidth, playgroundHeight);
  drawBackground();
  drawGround();
  drawClouds();
  if (!isKeyDown)
    character.slow();
  drawCharacter();

  requestAnimationFrame(renderFrame);
}

function drawBackground() {
  // sky
  context.fillStyle = "#6b8cff";
  context.fillRect(0, BLACK_BAND_HEIGHT, playgroundWidth, playgroundHeight);
  // background
  const y = BLACK_BAND_HEIGHT + playgroundHeight - (TILE_SIZE * 2) - background.height;
  const numBGRepeat = Math.floor(playgroundWidth / background.width) + 1;
  for (let i = 0; i < numBGRepeat; i++) {
    context.drawImage(background, i * background.width, y);
  }
}

function drawGround() {
  const y = BLACK_BAND_HEIGHT + playgroundHeight - (TILE_SIZE * 2);
  const numTiles = Math.floor(playgroundWidth / TILE_SIZE) + 1;
  for (let i = 0; i < numTiles; i++) {
    tiles[Tiles.GRASS_TILE].draw(context, i * TILE_SIZE, y);
    tiles[Tiles.GROUND_TILE].draw(context, i * TILE_SIZE, y + TILE_SIZE);
  }
}

function drawClouds() {
  clouds.forEach((cloud) => {
    const now = new Date().getTime();
    tiles[Tiles.CLOUD_START_TILE + (cloud.type * TILES_PER_COLUMN)].draw(context, cloud.x, cloud.y);
    if (cloud.size > 2)
      tiles[Tiles.CLOUD_MIDDLE_TILE + (cloud.type * TILES_PER_COLUMN)].draw(context, cloud.x + TILE_SIZE, cloud.y);
    if (cloud.size > 2)
      tiles[Tiles.CLOUD_END_TILE + (cloud.type * TILES_PER_COLUMN)].draw(context, cloud.x + (TILE_SIZE * 2), cloud.y);
    else
      tiles[Tiles.CLOUD_END_TILE + (cloud.type * TILES_PER_COLUMN)].draw(context, cloud.x + TILE_SIZE, cloud.y);
    if (!cloud.lastTypeChange)
      cloud.lastTypeChange = now;
    if (now - cloud.lastTypeChange > 400) {
      cloud.type++;
      cloud.type = cloud.type % 3;
      cloud.lastTypeChange = now;
    }
  })
}

function drawCharacter() {
  character.draw(context);
}

let isKeyDown = false;

document.addEventListener('keydown', (e) => {
  switch (e.code) {
    case "ArrowRight":
      character.right();
      isKeyDown = true;
      break;
    case "ArrowLeft":
      character.left();
      isKeyDown = true;
      break;
    case "ArrowUp":
    case "Space":
      character.jump();
      break;
    default: break;
  }
});

document.addEventListener('keyup', (e) => {
  switch (e.code) {
    case "ArrowRight":
    case "ArrowLeft":
      isKeyDown = false;
      break;
    default: break;
  }
});