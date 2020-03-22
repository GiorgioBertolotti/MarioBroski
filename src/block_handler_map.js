import { Directions } from './character.js';

export default class BlockHandlerMap {
    constructor() {
        this._map = {};
        for(const k in Directions) {
            const dir = Directions[k];
            this._map[dir] = {};
        }
    }

    add(direction, tileType, handler) {
        if(!(direction in this._map)) {
            /// not allowed
            return;
        }

        if(!(tileType in this._map[direction])) {
            this._map[direction][tileType] = [];
        }

        this._map[direction][tileType].push(handler);
    }

    get(direction, tileType) {
        if(!(direction in this._map)) {
            /// not allowed
            return;
        }
        if(!(tileType in this._map[direction])) {
            return;
        }

        const handlers = this._map[direction][tileType];
        return (world, blockData) => {
            for(const handler of handlers) {
                handler(world, blockData);
            }
        }
    }
}