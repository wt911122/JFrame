class Tool {
    constructor() {
        this.el = undefined;
    }

    renderToolbox(targetBlock, appendChild) {

    }

    renderBlockTool(targetBlock) {

    }

    renderFrame(targetBlock, appendChild) {
        
    }

    refresh(targetBlock) {
        
    }
    destroy() {
        if(this.el) {
            this.el.remove();
        }
    }
}

export default Tool;