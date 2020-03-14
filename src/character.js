import { Sprites, rightSprites } from "./sprites.js";
import { TILE_SIZE, playgroundWidth, playgroundHeight } from "./index.js";

export default class Character {
  constructor(spriteSheet, world) {
    this.spriteSheet = spriteSheet;
    this.spriteWidth = this.spriteSheet[0].width;
    this.spriteHeight = this.spriteSheet[0].height;
    this.spriteSpace = this.spriteSheet[0].defaultHeight - this.spriteHeight;
    this.world = world;
    this.x = 20;
    this.y = 100;
    this.startX = this.x;
    this.startY = this.y;
    this.screenX = this.x;
    this.speed = 0;
    this.acceleration = 0;
    this.verticalSpeed = 0;
    this.isJumping = false;
    this.prevSprite = Sprites.IDLE_R;
  }

  setSpriteSheet(spriteSheet) {
    this.spriteSheet = spriteSheet;
  }

  draw(context) {
    const prevX = this.x, prevY = this.y;

    // speed recalculation
    if (this.acceleration !== 0) {
      this.speed += this.acceleration;
      if (this.speed > 5) {
        this.speed = 5
      } if (this.speed < -5) {
        this.speed = -5;
      }
    } else {
      this.speed -= 0.1 * this.speed
    }
    if (Math.abs(this.speed) < 0.1) {
      this.speed = 0;
    }

    this.calculatePosition();

    // new sprite recalculation
    const sprite = this.getCurrentSprite(prevX, prevY);

    this.world.camera.update(this);
    // update the screen position
    this.screenX = this.x - this.world.camera.offsetX;

    // draw new position
    if (this.spriteSheet[sprite]) {
      this.prevSprite = sprite;
      this.spriteSheet[sprite].draw(context, this.screenX, this.y);
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
    this.acceleration = 0;
  }

  jump() {
    if (this.isJumping)
      return;
    if (this.verticalSpeed <= 0 && this.verticalSpeed >= -0.2) {
      this.verticalSpeed = 6;
      this.isJumping = true;
    }
  }

  calculatePosition() {
    // position recalculation
    let futureX = this.x, futureY = this.y;
    // horizontal axis
    if (this.speed !== 0) {
      futureX += this.speed;
      if (futureX < 0)
        futureX = 0;
      if (futureX + this.spriteWidth > (this.world.length * TILE_SIZE))
        futureX = (this.world.length * TILE_SIZE) - this.spriteWidth;
    }
    // vertical axis
    if (this.verticalSpeed !== 0) {
      futureY -= this.verticalSpeed;
    }
    this.verticalSpeed -= 0.2;

    const gridPos = {
      x: Math.floor(this.x / TILE_SIZE),
      y: Math.floor((playgroundHeight - this.y) / TILE_SIZE),
    };
    const futureGridPos = {
      x: Math.floor(futureX / TILE_SIZE),
      y: Math.floor((playgroundHeight - futureY) / TILE_SIZE),
    };

    // collision detection
    const verticalDirection = Math.sign(this.verticalSpeed);
    const spriteHeightInBlocks = Math.floor(this.spriteHeight / TILE_SIZE) + (this.spriteHeight % TILE_SIZE > 0 ? 1 : 0);
    const occupiedBlocksHorizontally = this.x % TILE_SIZE === 0 ? Math.floor(this.spriteWidth / TILE_SIZE) : Math.floor(this.spriteWidth / TILE_SIZE) + 1;
    const direction = Math.sign(this.speed);
    const spriteWidthInBlocks = Math.floor(this.spriteWidth / TILE_SIZE) + (this.spriteWidth % TILE_SIZE > 0 ? 1 : 0);
    const occupiedBlocksVertically = (playgroundHeight - this.y - this.spriteHeight) % TILE_SIZE <= this.spriteSpace ? spriteHeightInBlocks : spriteHeightInBlocks + 1
    
    // vertical collision detection
    if (verticalDirection > 0) {
      // jumping
      const alreadyCollidingHead = new Array(occupiedBlocksHorizontally).fill(0).some((_, index) => !!this.world.getCell(gridPos.x + index, gridPos.y));
      if (alreadyCollidingHead) {
        this.y = playgroundHeight - ((gridPos.y) * TILE_SIZE);
        this.verticalSpeed = 0;
      } else {
        const yStart = futureGridPos.y;
        const collidesHead = new Array(occupiedBlocksHorizontally).fill(0).some((_, index) => !!this.world.getCell(gridPos.x + index, yStart));
        if (collidesHead) {
          this.y = playgroundHeight - ((gridPos.y + 1) * TILE_SIZE) + 1;
          this.verticalSpeed = 0;
        } else {
          this.y = futureY;
        }
      }
    } else if (verticalDirection < 0) {
      // falling
      const yEnd = futureGridPos.y - spriteHeightInBlocks;
      const collidesFeet = new Array(occupiedBlocksHorizontally).fill(0).some((_, index) => !!this.world.getCell(gridPos.x + index, yEnd));
      if (collidesFeet) {
        this.y = playgroundHeight - ((yEnd + 1) * TILE_SIZE) - this.spriteHeight;
        this.verticalSpeed = 0;
        this.isJumping = false;
      } else {
        this.y = futureY;
      }
    }
    
    futureGridPos.y = Math.floor((playgroundHeight - this.y) / TILE_SIZE);
    // horizontal collision detection
    if(direction !== 0 ){
      // moving in direction
      const isRight = direction > 0;
      const xEnd = futureGridPos.x + (isRight ? spriteWidthInBlocks : 0);
      const collides = new Array(occupiedBlocksVertically).fill(0).some((_, index) => !!this.world.getCell(xEnd, gridPos.y - index));
      if (collides) {
        this.x = ((xEnd - direction) * TILE_SIZE) - direction;
        this.speed = 0;
      } else {
        this.x = futureX;
      }
    }
  }

  getCurrentSprite(prevX, prevY) {
    let sprite = this.prevSprite;
    const now = new Date().getTime();
    if (this.isJumping) {
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
  return sprite;
  }

}

const Directions = {
  RIGHT: 1,
  LEFT: -1,
}