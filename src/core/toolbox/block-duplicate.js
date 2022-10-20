import Tool from './tool'
class BlockDuplicate extends Tool {
    constructor(configs) {
        super(configs);
        this.onClick = configs.onClick;
        this.accept = configs.accept;
    }
    renderToolbox(targetBlock, appendChild) {
        if(this.accept(targetBlock)) {
            const el = document.createElement('span');
            el.setAttribute('class', 'jframe-toolbtn jframe-duplicateBtn');
            this.el = el;
            el.addEventListener('click', () => {
                this.onClick(targetBlock);
            });
            appendChild(el);
        }
    }
}

export default BlockDuplicate;