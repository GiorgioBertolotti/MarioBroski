import { SCREEN_WIDTH } from "./index.js";

export default class Sprite {
  constructor(image, x, y) {
    this.image = image;
    this.x = x;
    this.y = y;
    this.height = 128;
    this.width = 64;
  }

  draw(context, x, y) {
    context.drawImage(this.image, this.x, this.y, this.width, this.height, Math.floor(x), Math.floor(y), this.width, this.height);
    if (x + this.width > SCREEN_WIDTH) {
      const halfSpriteSize = x + this.width - SCREEN_WIDTH;
      context.drawImage(this.image, this.x + this.width - halfSpriteSize, this.y, halfSpriteSize, this.height, 0, Math.floor(y), Math.floor(halfSpriteSize), this.height);
    }
  }
}

export const Sprites = {
  IDLE_L: 1,
  WALK_L_1: 4,
  WALK_L_2: 7,
  IDLE_R: 2,
  WALK_R_1: 5,
  WALK_R_2: 8,
}