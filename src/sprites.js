export default class Sprite {
  constructor(image, x, y) {
    this.image = image;
    this.x = x;
    this.y = y;
    this.height = 128;
    this.width = 64;
    this.defaultHeight = 128;
    this.defaultWidth = 64;
  }

  draw(context, x, y) {
    context.drawImage(this.image, this.x + (this.defaultWidth - this.width), this.y + (this.defaultHeight - this.height), this.width, this.height, Math.floor(x), Math.floor(y), this.width, this.height);
  }
}

export const Sprites = {
  IDLE_L: 1,
  WALK_L_1: 4,
  WALK_L_2: 7,
  JUMP_L: 22,
  IDLE_R: 2,
  WALK_R_1: 5,
  WALK_R_2: 8,
  JUMP_R: 23,
}

export const rightSprites = [Sprites.IDLE_R, Sprites.WALK_R_1, Sprites.WALK_R_2, Sprites.JUMP_R];