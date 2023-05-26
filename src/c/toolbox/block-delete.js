import Tool from './tool'
import JFrameEvent from '../event';
class BlockDelete extends Tool {
    constructor(configs) {
        super(configs);
    }
    renderToolbox(targetBlock, appendChild) {
        const el = document.createElement('span');
        el.setAttribute('class', 'jframe-toolbtn jframe-deleteBtn');
        this.el = el;
        el.addEventListener('click', () => {
            targetBlock.jframe.dispatchEvent(new JFrameEvent('delete', {
                target: targetBlock,
            }))
        });
        appendChild(el);
        
    }
}

export default BlockDelete;