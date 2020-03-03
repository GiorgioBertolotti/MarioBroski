import Tile, { Tiles } from './tiles.js';
import Sprite from './sprites.js';
import Character from './character.js';
import { Colors } from './colors.js';
import { createLayersStack } from './layer.js';

// consts
const TILESET_FILE_NAME = './assets/tileset.png';
const MARIO_SPRITESHEET_FILE_NAME = './assets/sprites_mario.png';
const LUIGI_SPRITESHEET_FILE_NAME = './assets/sprites_luigi.png';
const BG_FILE_NAME = './assets/bg.png';
let SCREEN_WIDTH = window.innerWidth;
let SCREEN_HEIGHT = window.innerHeight;
// const BLACK_BAND_HEIGHT = Math.floor(SCREEN_HEIGHT * 0.2);
const BLACK_BAND_HEIGHT = 0;
const TILES_PER_COLUMN = 26;
export const TILE_SIZE = 64;
const SPRITE_PER_COLUMN = 3;
export const SPRITE_HEIGHT = 128;
const SPRITE_WIDTH = 64;
export let playgroundWidth = SCREEN_WIDTH;
export let playgroundHeight = SCREEN_HEIGHT - (BLACK_BAND_HEIGHT * 2);

// canvas
const canvas = document.getElementById("canvas");
canvas.width = SCREEN_WIDTH;
canvas.height = SCREEN_HEIGHT;
const context = canvas.getContext("2d");
context.strokeStyle = Colors.WHITE;

// sprite sheet
function loadImage(imageSrc) {
  const promise = new Promise(resolve => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      resolve(img)
    }
  })
  return promise;
}

async function loadImages() {
  const loader = Promise.all([
    loadImage(MARIO_SPRITESHEET_FILE_NAME).then(loadSprites),
    loadImage(LUIGI_SPRITESHEET_FILE_NAME).then(loadSprites),
    loadImage(TILESET_FILE_NAME).then(loadTiles),
    loadImage(BG_FILE_NAME)
  ]);
  const [marioSprites, luigiSprite, tiles, background] = await loader;
  return { marioSprites, luigiSprite, tiles, background };
}

loadImages().then((loaded) => {
  // character
  const character = new Character(loaded.marioSprites, 20, BLACK_BAND_HEIGHT + playgroundHeight - (TILE_SIZE * 2) - SPRITE_HEIGHT);
  // cloud generation
  const clouds = initClouds();
  // layers definition
  const layers = createLayersStack([
    {
      render: (context) => drawBackground(context, loaded.background),
      depth: 0,
    },
    {
      render: (context) => drawGround(context, loaded.tiles),
      depth: 60,
    },
    {
      render: (context) => drawClouds(context, clouds, loaded.tiles),
      depth: 70,
    },
    {
      render: (context) => character.draw(context),
      depth: 100,
    },
  ])
  // start rendering
  const renderer = createRenderer(layers);
  addListeners(character);
  renderer();
});



function loadTiles(tileset) {
  const tiles = [];
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
  return tiles;
}

function loadSprites(spriteSheet) {
  const spritesContainer = [];
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
  return spritesContainer;
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
      size: Math.floor(Math.random() * 2) + 2,
      disabled: false
    }));
}

function createRenderer(layers) {
  function renderFrame() {
    context.clearRect(0, BLACK_BAND_HEIGHT, playgroundWidth, playgroundHeight);
    layers.render(context);

    requestAnimationFrame(renderFrame);
  }
  return renderFrame;
}

function drawBackground(context, background) {
  // sky
  context.fillStyle = Colors.SKY;
  context.fillRect(0, BLACK_BAND_HEIGHT, playgroundWidth, playgroundHeight);
  // background
  const y = BLACK_BAND_HEIGHT + playgroundHeight - (TILE_SIZE * 2) - background.height;
  const numBGRepeat = Math.floor(playgroundWidth / background.width) + 1;
  for (let i = 0; i < numBGRepeat; i++) {
    context.drawImage(background, i * background.width, y);
  }
}

function drawGround(context, tiles) {
  const y = BLACK_BAND_HEIGHT + playgroundHeight - (TILE_SIZE * 2);
  const numTiles = Math.floor(playgroundWidth / TILE_SIZE) + 1;
  for (let i = 0; i < numTiles; i++) {
    tiles[Tiles.GRASS_TILE].draw(context, i * TILE_SIZE, y);
    tiles[Tiles.GROUND_TILE].draw(context, i * TILE_SIZE, y + TILE_SIZE);
  }
}

function drawClouds(context, clouds, tiles) {
  clouds.forEach((cloud) => {
    if (!cloud.disabled) {
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
    }
  });
}

function addListeners(character) {
  document.addEventListener('keydown', (e) => {
    switch (e.code) {
      case "ArrowRight":
        character.right();
        break;
      case "ArrowLeft":
        character.left();
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
        character.slow();
        break;
      default: break;
    }
  });
}

window.addEventListener("resize", () => {
  const oldScreenWidth = SCREEN_WIDTH;
  const oldScreenHeight = SCREEN_HEIGHT;
  SCREEN_WIDTH = window.innerWidth;
  SCREEN_HEIGHT = window.innerHeight;
  canvas.width = SCREEN_WIDTH;
  canvas.height = SCREEN_HEIGHT;
  playgroundWidth = SCREEN_WIDTH;
  playgroundHeight = SCREEN_HEIGHT - (BLACK_BAND_HEIGHT * 2);
  if (oldScreenHeight !== SCREEN_HEIGHT) {
    character.recalculateY();
  }
  clouds.forEach((cloud) => {
    const oldYPerc = cloud.y / oldScreenHeight;
    const newY = oldYPerc * SCREEN_HEIGHT;
    cloud.y = Math.floor(newY);
    if (cloud.y + TILE_SIZE > playgroundHeight - (TILE_SIZE * 2) - SPRITE_HEIGHT)
      cloud.disabled = true;
    else
      cloud.disabled = false;
  });
});