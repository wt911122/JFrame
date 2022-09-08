import Tool from './tool'
class BlockDelete extends Tool {
    constructor(configs) {
        super(configs);
        this.onClick = configs.onClick
    }
    renderToolbox(targetBlock, appendChild) {
        const el = document.createElement('span');
        el.setAttribute('class', 'jframe-toolbtn jframe-deleteBtn');
        this.el = el;
        el.addEventListener('click', () => {
            this.onClick(targetBlock);
        });
        appendChild(el);
    }
}

export default BlockDelete;