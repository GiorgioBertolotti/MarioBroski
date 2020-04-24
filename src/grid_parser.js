import { BLOCKS } from "./world.js";

export default async function parseGrid(jsonPath) {
    const json = fetch(jsonPath)
        .then(result => result.json());
    return json.grid.map(specs => {
        let line = [];
        for(const spec of specs) {
            if("reference" in spec) {

            } else {
                const {block, quantity = 1, offset = 0} = spec;
                for(let i = 0; i < offset; i += 1)
                    line.push(null);
                if(block in BLOCKS) {
                    for(let i = 0; i < quantity; i += 1)
                        line.push(BLOCKS[block]);
                }
            }
        }
    });
}