import { Directions } from './character.js';
import { Tiles } from './tiles.js';
import BlockHandlerMap from './block_handler_map.js';

export const defaultHandlers = new BlockHandlerMap();

defaultHandlers.add(Directions.TOP, Tiles.MISTERY, (world, { x, y }) => {
    delete world.grid[y][x];
})