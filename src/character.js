import { Sprites, rightSprites } from "./sprites.js";
import { TILE_SIZE, playgroundWidth, playgroundHeight, SPRITE_HEIGHT, SPRITE_WIDTH } from "./index.js";

export default class Character {
  constructor(spriteSheet, world) {
    this.spriteSheet = spriteSheet;
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

    // position recalculation
    let futureX = this.x, futureY = this.y;
    // horizontal axis
    if (this.speed !== 0) {
      futureX += this.speed;
      if (futureX < 0)
        futureX = 0;
      if (futureX > this.world.camera.worldLen)
        futureX = this.world.camera.worldLen;
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
    const direction = Math.sign(this.speed);
    const verticalDirection = Math.sign(this.verticalSpeed);
    const spriteWidthInBlocks = Math.floor(SPRITE_WIDTH / TILE_SIZE);

    // vertical collision detection
    if (verticalDirection > 0) {
      // jumping
      const alreadyCollidingHead = !!this.world.getCell(gridPos.x, gridPos.y) || !!this.world.getCell(gridPos.x + spriteWidthInBlocks, gridPos.y);
      if (alreadyCollidingHead) {
        this.y = playgroundHeight - ((gridPos.y) * TILE_SIZE);
        this.verticalSpeed = 0;
      } else {
        const yStart = futureGridPos.y;
        const collidesHead = !!this.world.getCell(gridPos.x, yStart) || !!this.world.getCell(gridPos.x + spriteWidthInBlocks, yStart);
        if (collidesHead) {
          this.y = playgroundHeight - ((gridPos.y + 1) * TILE_SIZE);
          this.verticalSpeed = 0;
        } else {
          this.y = futureY;
        }
      }
    } else if (verticalDirection < 0) {
      // falling
      const yEnd = futureGridPos.y - Math.floor(SPRITE_HEIGHT / TILE_SIZE);
      const collidesFeet = !!this.world.getCell(gridPos.x, yEnd) || !!this.world.getCell(gridPos.x + spriteWidthInBlocks, yEnd);
      if (collidesFeet) {
        this.y = playgroundHeight - ((futureGridPos.y + 1) * TILE_SIZE);
        this.verticalSpeed = 0;
        this.isJumping = false;
      } else {
        this.y = futureY;
      }
    }

    futureGridPos.y = Math.floor((playgroundHeight - this.y) / TILE_SIZE);
    // horizontal collision detection
    if (direction > 0) {
      // moving in right direction
      const xEnd = futureGridPos.x + Math.floor(SPRITE_WIDTH / TILE_SIZE);
      const collidesHead = !!this.world.getCell(xEnd, futureGridPos.y - 1);
      const collidesLegs = !!this.world.getCell(xEnd, futureGridPos.y - 2);
      if (collidesHead || collidesLegs) {
        this.x = (futureGridPos.x * TILE_SIZE) - 1;
        this.acceleration = this.speed = 0;
      } else {
        this.x = futureX;
      }
    } else if (direction < 0) {
      // moving in left direction
      const xStart = futureGridPos.x;
      const collidesHead = !!this.world.getCell(xStart, futureGridPos.y - 1);
      const collidesLegs = !!this.world.getCell(xStart, futureGridPos.y - 2);
      if (collidesHead || collidesLegs) {
        this.x = (gridPos.x * TILE_SIZE) + 1;
        this.acceleration = this.speed = 0;
      } else {
        this.x = futureX;
      }
    }

    // new sprite recalculation
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