export function createLayersStack(layers) {
    // disegno i layer più profondi prima
    layers.sort(layer => layer.depth || 0);
    return {
        drawOnStart(context) {
            layers.forEach(layer => {
                if(!layer.drawOnStart)
                    return;
                layer.drawOnStart(context)      
            })
        },
        render(context) {
            layers.forEach(layer => {
                layer.render(context)
            });
        },    
    }
}