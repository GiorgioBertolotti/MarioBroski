import { Sprites } from "./sprites.js";
import { SCREEN_WIDTH } from "./index.js";

export default class Character {
  constructor(spriteSheet, x, y) {
    this.spriteSheet = spriteSheet;
    this.x = x;
    this.y = y;
    this.speed = 0;
    this.acceleration = 0;
    this.prevSprite = Sprites.IDLE_R;
  }

  setSpriteSheet(spriteSheet) {
    this.spriteSheet = spriteSheet;
  }

  draw(context) {
    // speed recalculation
    if (this.acceleration !== 0)
      this.speed += this.acceleration;
    else {
      if (this.speed > 0)
        this.speed -= 0.1 * this.speed
      else if (this.speed < 0)
        this.speed += 0.1 * -this.speed
    }
    if (Math.abs(this.speed) < 0.1) {
      this.speed = 0;
    }
    if (this.speed > 5)
      this.speed = 5
    if (this.speed < -5)
      this.speed = -5;
    // position recalculation
    const prevX = this.x;
    if (this.speed !== 0) {
      this.x += this.speed;
      this.x = this.x % SCREEN_WIDTH;
      if (this.x < 0)
        this.x = SCREEN_WIDTH;
    }
    // new sprite recalculation
    let sprite = this.prevSprite;
    if (prevX < this.x) {
      if (sprite === Sprites.WALK_R_1)
        sprite = Sprites.WALK_R_2;
      else
        sprite = Sprites.WALK_R_1;
    } else {
      if (prevX > this.x) {
        if (sprite === Sprites.WALK_L_1)
          sprite = Sprites.WALK_L_2;
        else
          sprite = Sprites.WALK_L_1;
      } else {
        if (sprite === Sprites.WALK_R_1 || sprite === Sprites.WALK_R_2 || sprite === Sprites.IDLE_R) {
          sprite = Sprites.IDLE_R;
        } else
          sprite = Sprites.IDLE_L;
      }
    }
    // draw new position
    if (this.spriteSheet[sprite]) {
      this.prevSprite = sprite;
      this.spriteSheet[sprite].draw(context, this.x, this.y);
    }
  }

  right() {
    if (this.acceleration < 0.6)
      this.acceleration += 0.2;
  }

  left() {
    if (this.acceleration > -0.6)
      this.acceleration -= 0.2;
  }

  slow() {
    if (this.acceleration !== 0) {
      if (Math.abs(this.acceleration) < 0.1) {
        this.acceleration = 0;
      } else {
        if (this.acceleration > 0) {
          this.acceleration -= 0.1;
        } else {
          this.acceleration += 0.1;
        }
      }
    }
  }
}
