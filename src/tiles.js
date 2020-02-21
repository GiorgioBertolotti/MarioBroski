export default class Tile {
  constructor(image, x, y) {
    this.image = image;
    this.x = x;
    this.y = y;
    this.size = 16;
  }

  draw(context, x, y) {
    context.drawImage(this.image, this.x, this.y, this.size, this.size, x, y, this.size, this.size);
  }
}