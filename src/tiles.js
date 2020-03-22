export default class Tile {
  constructor(image, x, y) {
    this.image = image;
    this.x = x;
    this.y = y;
    this.size = 64;
  }

  draw(context, x, y) {
    context.drawImage(this.image, this.x, this.y, this.size, this.size, x, y, this.size, this.size);
  }
}

export const Tiles = {
  MISTERY: 17,
  BRICK: 89,
  GRASS_START: 3,
  GRASS: 29,
  GRASS_END: 55,
  GROUND: 30,
  HILL_TOP_START: 1,
  HILL_TOP: 27,
  HILL_TOP_END: 53,
  HILL_START: 2,
  HILL: 28,
  HILL_END: 54,
  CLOUD_START: 231,
  CLOUD_MIDDLE: 232,
  CLOUD_END: 233
}