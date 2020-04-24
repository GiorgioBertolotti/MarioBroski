import { createLayersStack } from './layer.js';
import { Tiles } from './tiles.js';
import Character, { Directions } from './character.js';
import { Colors } from './colors.js';
import { TILE_SIZE, TILES_PER_COLUMN, BLACK_BAND_HEIGHT, playgroundHeight, playgroundWidth } from './index.js';
import Camera from './camera.js';
import { defaultHandlers } from './block_handlers.js';
import DebugGrid from './debug_grid.js';
import parseGrid from './grid_parser.js';

class World {
  constructor(resources) {
    this.length = 100;
    const self = this;
    (async () => {
      self.grid = await parseGrid('../assets/world.json');
    })()

    /*this.grid = [
      new Array(this.length).fill(BLOCKS.GROUND),
      new Array(this.length).fill(BLOCKS.GRASS),
      [BLOCKS.HILL_START, BLOCKS.HILL, BLOCKS.HILL, BLOCKS.HILL_TOP_END].concat(new Array(3).fill(null).concat([BLOCKS.HILL_TOP_START, BLOCKS.HILL, BLOCKS.HILL, BLOCKS.HILL, BLOCKS.HILL_END])),
      [BLOCKS.HILL_TOP_START, BLOCKS.HILL_TOP, BLOCKS.HILL_TOP_END].concat(new Array(5).fill(null).concat([BLOCKS.HILL_TOP_START, BLOCKS.HILL_TOP, BLOCKS.HILL_TOP, BLOCKS.HILL_TOP_END])),
      new Array(this.length).fill(null),
      new Array(this.length).fill(null),
      new Array(1).fill(null).concat(new Array(1).fill(BLOCKS.MISTERY).concat(new Array(99).fill(null))),
      new Array(8).fill(null).concat(new Array(1).fill(BLOCKS.MISTERY).concat(new Array(93).fill(null))),
    ];*/
    // character
    this.character = new Character(resources.sprites, this);
    // cloud generation
    this.clouds = initClouds(this.length * TILE_SIZE);
    this.camera = new Camera(0, this, playgroundWidth);
    // debug grid
    this.debugGrid = new DebugGrid(this.camera, Colors.WHITE);
    //blocks event handler
    this.blockHandler = defaultHandlers;
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
      {
        render: (context) => this.debugGrid.draw(context),
        depth: 110,
      },
    ])
  }

  onCollision(direction, collidingBlocks) {
    //console.log(direction, collidingBlocks);
    this.debugGrid.setCollisionBlocks(collidingBlocks);

    for(const data  of collidingBlocks) {
      const handler = this.blockHandler.get(direction, data.block.tile);
      if(handler) {
        handler(this, data);
      }
    }
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
        const x = c * TILE_SIZE - this.camera.offsetX;
        if (cell)
          tiles[cell.tile].draw(context, x, y - ((r + 1) * TILE_SIZE));
      }
    }
  }

  drawClouds(context, tiles) {
    this.clouds.forEach((cloud) => {
      if (!cloud.disabled) {
        const cloudX = cloud.x - this.camera.offsetX;
        const now = new Date().getTime();
        tiles[Tiles.CLOUD_START + (cloud.type * TILES_PER_COLUMN)].draw(context, cloudX, cloud.y);
        if (cloud.size > 2)
          tiles[Tiles.CLOUD_MIDDLE + (cloud.type * TILES_PER_COLUMN)].draw(context, cloudX + TILE_SIZE, cloud.y);
        if (cloud.size > 2)
          tiles[Tiles.CLOUD_END + (cloud.type * TILES_PER_COLUMN)].draw(context, cloudX + (TILE_SIZE * 2), cloud.y);
        else
          tiles[Tiles.CLOUD_END + (cloud.type * TILES_PER_COLUMN)].draw(context, cloudX + TILE_SIZE, cloud.y);
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

export const BLOCKS = {};
Object.keys(Tiles).forEach((key) => {
  BLOCKS[key] = { tile: Tiles[key] };
});

export default World;