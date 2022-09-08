import Tool from './tool'
class BlockSize extends Tool {
    renderToolbox(targetBlock, appendChild) {
        const el = document.createElement('span');
        el.setAttribute('class', 'jframe-toolbtn');
        el.innerText = `${Math.round(targetBlock.width)}x${Math.round(targetBlock.height)}`;
        this.el = el;
        appendChild(el);
    }
    refresh(targetBlock) {
        this.el.innerText = `${Math.round(targetBlock.width)}x${Math.round(targetBlock.height)}`;
    }
}

export default BlockSize;