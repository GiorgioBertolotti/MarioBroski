import { TILE_SIZE } from "./index.js";

export default class Camera {
    constructor(x, world, size) {
        this.offsetX = x;
        this.size = size; // the width of the camera
        this.world = world;
    }

    update(character) {
        const clamp = (a, min, max) => Math.min(Math.max(a, min), max);
        // mario sta in centro allo schermo tranne se si trova nella prima metà inferiore
        this.offsetX = clamp(character.x - this.size / 2, 0, (this.world.length * TILE_SIZE) - this.size);
    }
}