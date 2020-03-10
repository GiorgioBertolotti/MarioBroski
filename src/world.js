import { createLayersStack } from './layer.js';
import { Tiles } from './tiles.js';
import Character from './character.js';
import { Colors } from './colors.js';
import { TILE_SIZE, SPRITE_HEIGHT, TILES_PER_COLUMN, BLACK_BAND_HEIGHT, playgroundHeight, playgroundWidth } from './index.js';

class World {
  constructor(resources) {
    this.length = 100;
    this.grid = [
      new Array(this.length).fill(BLOCKS.DIRT),
      new Array(this.length).fill(BLOCKS.GRASS),
      new Array(3).fill(BLOCKS.DIRT).concat(new Array(3).fill(null).concat(new Array(4).fill(BLOCKS.DIRT).concat(new Array(90).fill(null)))),
      new Array(2).fill(BLOCKS.DIRT).concat(new Array(3).fill(null).concat(new Array(4).fill(BLOCKS.DIRT).concat(new Array(90).fill(null)))),
      new Array(this.length).fill(null),
      new Array(this.length).fill(null),
      new Array(1).fill(BLOCKS.DIRT).concat(new Array(99).fill(null)),
      new Array(6).fill(null).concat(new Array(1).fill(BLOCKS.DIRT).concat(new Array(93).fill(null))),
    ];
    // character
    this.character = new Character(resources.marioSprite, this);
    // cloud generation
    this.clouds = initClouds(this.length * TILE_SIZE);
    // layers definition
    this.layers = createLayersStack([
      {
        render: (context) => this.drawBackground(context, resources.background),
        depth: 0,
      },
      {
        render: (context) => this.drawClouds(context, resources.tiles),
        depth: 70,
      },
      {
        render: (context) => this.drawGrid(context, resources.tiles),
        depth: 100,
      },
      {
        render: (context) => this.character.draw(context),
        depth: 100,
      },
    ])
  }

  render(context) {
    this.layers.render(context);
  }

  getCell(x, y) {
    if (!(y in this.grid))
      return undefined;

    const row = this.grid[y];
    if (x in row) {
      return row[x];
    } else {
      return undefined;
    }

  }

  drawBackground(context, background) {
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

  drawGrid(context, tiles) {
    const y = BLACK_BAND_HEIGHT + playgroundHeight;
    for (let r = 0; r < this.grid.length; r++) {
      const row = this.grid[r];
      for (let c = 0; c < row.length; c++) {
        const cell = row[c];
        if (cell)
          tiles[cell.tile].draw(context, c * TILE_SIZE, y - ((r + 1) * TILE_SIZE));
      }
    }
  }

  drawClouds(context, tiles) {
    this.clouds.forEach((cloud) => {
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
}

function initClouds(worldWidth) {
  const maxClouds = 3;
  const cloudsNumber = Math.floor(Math.random() * maxClouds) + 2;
  const chunkWidth = Math.floor((worldWidth / cloudsNumber));
  return new Array(cloudsNumber).fill(0)
    .map((_, index) => ({
      x: (Math.floor(Math.random() * chunkWidth)) + (chunkWidth * index),
      y: (Math.floor(Math.random() * (playgroundHeight / 4))) + BLACK_BAND_HEIGHT,
      type: 0,
      size: Math.floor(Math.random() * 2) + 2,
      disabled: false
    }));
}

const BLOCKS = {
  GRASS: { tile: Tiles.GRASS_TILE },
  DIRT: { tile: Tiles.GROUND_TILE },
}

export default World;