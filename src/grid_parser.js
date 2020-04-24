import { BLOCKS } from "./world.js";

export default async function parseGrid(jsonPath) {
    const json = await fetch(jsonPath)
        .then(result => result.json());
    const structsMap = {};
    for(const struct of json.structures) {
        structsMap[struct.id] = struct;
    }
    return json.grid.map(specs => {
        let line = [];
        for(const spec of specs) {
            if("reference" in spec) {
                const reference = structsMap[spec.reference];
                
                // offseting the all structure
                const offset = spec.offset || 0;
                for(let i = 0; i < offset; i += 1)
                    line.push(null);
                
                // create custom alias for this group of block
                const aliases = {...reference, ...spec};
                for(const block of reference.grid)
                    addBlockGroup({...block}, line, aliases);
            } else {
                addBlockGroup(spec, line);
            }
        }
        return line;
    });
}

function addBlockGroup(spec, line, aliases = {}) {
    // resolve aliases
    for(const param in spec) {
        const value = spec[param];
        if (typeof(value) === "string" && value.startsWith("$")) {
            const varName = value.substr(1);
            if (!(varName in aliases))
                continue;
            spec[param] = aliases[varName]
        }
    }
    // add block
    const {block, quantity = 1, offset = 0} = spec;
    for(let i = 0; i < offset; i += 1)
        line.push(null);
    if(block in BLOCKS) {
        for(let i = 0; i < quantity; i += 1)
            line.push(BLOCKS[block]);
    }

}