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
  GRASS_TILE: 29,
  GROUND_TILE: 30,
  CLOUD_START_TILE: 231,
  CLOUD_MIDDLE_TILE: 232,
  CLOUD_END_TILE: 233
}