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
    const prevX = this.x;
    // horizontal axis
    if (this.speed !== 0) {
      this.x += this.speed;
      if (this.x < 0)
        this.x = 0;
      if (this.x > playgroundWidth - SPRITE_WIDTH)
        this.x = playgroundWidth - SPRITE_WIDTH;
    }
    // vertical axis
    if (this.verticalSpeed !== 0) {
      this.y -= this.verticalSpeed;
    } 
    this.verticalSpeed -= 0.2;

    const gridPos = {
      x: Math.floor(this.x / TILE_SIZE),
      y: Math.floor((playgroundHeight - this.y) / TILE_SIZE) - 1,
    };
    const CHARACTER_WIDHT  = 50; // TEMP
    const CHARACTER_HEIGHT = TILE_SIZE * 2; // TEMP

    // collision detection
    const direction = Math.sign(this.speed);
    const verticalDirection = Math.sign(this.verticalSpeed);
    const self = this; // workaround for avoid javascript "this" scoping in internal function

    function checkCollisions(collisionX) {
      // check the collision in the directions of the character (it consider only the block on the collisionX)
      if(self.world.getCell(collisionX, gridPos.y)) {
        self.x = prevX;
        self.acceleration = self.speed = 0;
        return;
      }
      let collisionY = gridPos.y;
      if(self.world.getCell(collisionX, collisionY)) {
        self.y = playgroundHeight - ((collisionY - verticalDirection) * TILE_SIZE - (CHARACTER_HEIGHT * verticalDirection));
        self.verticalSpeed = 0;
        self.isJumping = false;
      } else {
        collisionY += verticalDirection;
        if(self.world.getCell(collisionX, collisionY)) {
          self.y = playgroundHeight - ((collisionY - verticalDirection) * TILE_SIZE - (CHARACTER_HEIGHT * verticalDirection));
          self.verticalSpeed = 0;
          self.isJumping = false;
        }
      }
    }

    checkCollisions(gridPos.x);
    if ((this.x + CHARACTER_WIDHT) / TILE_SIZE !== gridPos.x) {
      // mario invade il prossimo cubo
      checkCollisions(gridPos.x + direction);
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