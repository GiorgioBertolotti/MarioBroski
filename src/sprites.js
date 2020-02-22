export default class Sprite {
  constructor(image, x, y) {
    this.image = image;
    this.x = x;
    this.y = y;
    this.height = 32;
    this.width = 16;
  }

  draw(context, x, y) {
    context.drawImage(this.image, this.x, this.y, this.width, this.height, Math.floor(x), Math.floor(y), this.width, this.height);
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