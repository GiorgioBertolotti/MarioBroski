import Tile from './tiles.js';
import Sprite from './sprites.js';
import { Colors } from './colors.js';
import World from './world.js';

// consts
const TILESET_FILE_NAME = './assets/tileset.png';
const MARIO_SPRITESHEET_FILE_NAME = './assets/sprites_mario.png';
const LUIGI_SPRITESHEET_FILE_NAME = './assets/sprites_luigi.png';
const BG_FILE_NAME = './assets/bg.png';
let SCREEN_WIDTH = window.innerWidth;
let SCREEN_HEIGHT = window.innerHeight;
// const BLACK_BAND_HEIGHT = Math.floor(SCREEN_HEIGHT * 0.2);
export const BLACK_BAND_HEIGHT = 0;
export const TILES_PER_COLUMN = 26;
export const TILE_SIZE = 64;
const SPRITE_PER_COLUMN = 3;
export const SPRITE_HEIGHT = 128;
export const SPRITE_WIDTH = 64;
export let playgroundWidth = SCREEN_WIDTH;
export let playgroundHeight = SCREEN_HEIGHT - (BLACK_BAND_HEIGHT * 2);

// canvas
const canvas = document.getElementById("canvas");
canvas.width = SCREEN_WIDTH;
canvas.height = SCREEN_HEIGHT;
const context = canvas.getContext("2d");
context.strokeStyle = Colors.WHITE;

loadImages().then((loaded) => {
  // worlds definition
  const world = new World(loaded);
  // start rendering
  const renderer = createRenderer(world);
  addListeners(world);
  renderer();
});

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
  const MARIO_OPTION = {
    height: 108,
    characterSpriteSheet: MARIO_SPRITESHEET_FILE_NAME,
  }
  
  const LUIGI_OPTION = {
    height: 124,
    characterSpriteSheet: LUIGI_SPRITESHEET_FILE_NAME,
  }
  
  const { characterSpriteSheet, height} = LUIGI_OPTION;
  const loader = Promise.all([
    loadImage(characterSpriteSheet).then(spriteSheet => loadSprites(spriteSheet, height)),
    loadImage(TILESET_FILE_NAME).then(loadTiles),
    loadImage(BG_FILE_NAME)
  ]);
  const [marioSprite, tiles, background] = await loader;
  return { marioSprite, tiles, background };
}

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

function loadSprites(spriteSheet, height) {
  const spritesContainer = [];
  const w = spriteSheet.width;
  const h = spriteSheet.height;
  for (let x = 0; x < w - 4; x += 4) {
    for (let y = 0; y < h - 4; y += 4) {
      const sprite = new Sprite(spriteSheet, x + 4, y + 4);
      sprite.height = height;
      spritesContainer.push(sprite);
      y += SPRITE_HEIGHT;
    }
    x += SPRITE_WIDTH;
  }
  return spritesContainer;
}

function createRenderer(world) {
  function renderFrame() {
    context.clearRect(0, BLACK_BAND_HEIGHT, playgroundWidth, playgroundHeight);
    world.render(context);

    requestAnimationFrame(renderFrame);
  }
  return renderFrame;
}

function addListeners(world) {
  const { character, clouds } = world;

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
      if (cloud.y + TILE_SIZE > playgroundHeight - (TILE_SIZE * 2) - SPRITE_HEIGHT) {
        cloud.disabled = true;
      } else {
        cloud.disabled = false;
      }
    });
  });
}