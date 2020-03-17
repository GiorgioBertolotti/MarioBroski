import { playgroundHeight, playgroundWidth, TILE_SIZE } from './index.js';
import { Colors } from './colors.js';

export default class DebugGrid {
  constructor(camera, lineColor) {
    this.camera = camera;
    this.lineColor = lineColor;
    this.collisionBlocks = [];
  }

  draw(context) {
    context.beginPath();
    // grid
    for (var y = playgroundHeight; y >= 0; y -= TILE_SIZE) {
      context.moveTo(0, y);
      context.lineTo(playgroundWidth, y);
    }
    for (var x = 0; x <= playgroundWidth; x += TILE_SIZE) {
      const screenX = x - (this.camera.offsetX % TILE_SIZE);
      context.moveTo(screenX, 0);
      context.lineTo(screenX, playgroundHeight);
    }
    context.strokeStyle = this.lineColor;
    // collision blocks
    this.collisionBlocks?.forEach(block => {
      const drawX = block.x * TILE_SIZE - this.camera.offsetX;
      const drawY = playgroundHeight - (block.y + 1) * TILE_SIZE;
      context.fillStyle = Colors.COLLISION_RED;
      context.fillRect(drawX, drawY, TILE_SIZE, TILE_SIZE);
    });
    this.collisionBlocks = [];
    context.stroke();
  }

  setCollisionBlocks(blocks) {
    this.collisionBlocks = this.collisionBlocks.concat(blocks);
  }
}