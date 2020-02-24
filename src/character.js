import { Sprites, rightSprites } from "./sprites.js";
import { TILE_SIZE, playgroundWidth, playgroundHeight, SPRITE_HEIGHT } from "./index.js";

export default class Character {
  constructor(spriteSheet, x, y) {
    this.spriteSheet = spriteSheet;
    this.x = x;
    this.y = y;
    this.startX = x;
    this.startY = y;
    this.speed = 0;
    this.acceleration = 0;
    this.verticalAcceleration = 0;
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
    // horizontal axis
    if (this.speed !== 0) {
      this.x += this.speed;
      this.x = this.x % playgroundWidth;
      if (this.x < 0)
        this.x = playgroundWidth;
    }
    // vertical axis
    if (this.verticalAcceleration !== 0) {
      this.y -= this.verticalAcceleration;
      this.verticalAcceleration -= 0.2;
    } else {
      this.y += 0.2;
    }
    if (this.y > this.startY) {
      this.y = this.startY;
      this.verticalAcceleration = 0;
    }
    // new sprite recalculation
    let sprite = this.prevSprite;
    const now = new Date().getTime();
    if (this.y < this.startY) {
      // jumping
      if (this.direction) {
        if (this.direction === Directions.RIGHT)
          sprite = Sprites.JUMP_R;
        else
          sprite = Sprites.JUMP_L;
      } else if (rightSprites.includes(sprite)) {
        sprite = Sprites.JUMP_R;
      } else {
        sprite = Sprites.JUMP_L;
      }
    } else if (prevX === this.x) {
      // idle
      if (this.direction) {
        if (this.direction === Directions.RIGHT)
          sprite = Sprites.IDLE_R;
        else
          sprite = Sprites.IDLE_L;
      } else if (rightSprites.includes(sprite)) {
        sprite = Sprites.IDLE_R;
      } else {
        sprite = Sprites.IDLE_L;
      }
    } else if (this.direction) {
      if (this.direction === Directions.RIGHT) {
        // walk right
        if (!this.lastWalkRight)
          this.lastWalkRight = now;
        if (now - this.lastWalkRight > 250) {
          if (sprite === Sprites.WALK_R_1)
            sprite = Sprites.WALK_R_2;
          else
            sprite = Sprites.WALK_R_1;
          this.lastWalkRight = now;
        } else {
          if (sprite !== Sprites.WALK_R_1 && sprite !== Sprites.WALK_R_2)
            sprite = Sprites.WALK_R_1;
        }
      } else {
        // walk left
        if (!this.lastWalkLeft)
          this.lastWalkLeft = now;
        if (now - this.lastWalkLeft > 250) {
          if (sprite === Sprites.WALK_L_1)
            sprite = Sprites.WALK_L_2;
          else
            sprite = Sprites.WALK_L_1;
          this.lastWalkLeft = now;
        } else {
          if (sprite !== Sprites.WALK_L_1 && sprite !== Sprites.WALK_L_2)
            sprite = Sprites.WALK_L_1;
        }
      }
    }
    // draw new position
    if (this.spriteSheet[sprite]) {
      this.prevSprite = sprite;
      this.spriteSheet[sprite].draw(context, this.x, this.y);
    }
  }

  right() {
    if (this.acceleration < 0)
      this.acceleration = 0.2;
    else if (this.acceleration < 0.6)
      this.acceleration += 0.2;
    this.direction = Directions.RIGHT;
  }

  left() {
    if (this.acceleration > 0)
      this.acceleration = -0.2;
    else if (this.acceleration > -0.6)
      this.acceleration -= 0.2;
    this.direction = Directions.LEFT;
  }

  slow() {
    if (this.acceleration !== 0) {
      if (Math.abs(this.acceleration) < 0.1) {
        this.acceleration = 0;
      } else {
        if (this.acceleration > 0) {
          this.acceleration -= 0.2;
        } else {
          this.acceleration += 0.2;
        }
      }
    }
  }

  jump() {
    if (this.verticalAcceleration === 0) {
      this.verticalAcceleration = 6;
    }
  }

  recalculateY() {
    const distanceFromGround = this.y - this.startY;
    const newGroundPosition = playgroundHeight - (TILE_SIZE * 2);
    this.y = newGroundPosition - distanceFromGround - SPRITE_HEIGHT;
    this.startY = newGroundPosition - SPRITE_HEIGHT;
  }
}

const Directions = {
  RIGHT: 1,
  LEFT: -1,
}