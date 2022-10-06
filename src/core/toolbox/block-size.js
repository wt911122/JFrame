import Tool from './tool'
import JFrameEvent from '../event/event';
function renderContent(targetBlock) {
    return `${Math.round(targetBlock.width)}x${Math.round(targetBlock.height)}`;
}

class BlockSize extends Tool {
    constructor(configs) {
        super();
        this.status = {
            leftedit: false,
            rightedit: false,
        }
        this.onSizeChange = configs.onSizeChange
        this.editable = configs.editable;
    }
    renderToolbox(targetBlock, appendChild) {
        const el = document.createElement('span');
        el.setAttribute('class', 'jframe-toolbtn');
        el.innerText = renderContent(targetBlock);
        if(this.editable(targetBlock)) {
            const inputLeft = document.createElement('input');
            inputLeft.setAttribute('class', 'jframe-toolbtn-input');
            inputLeft.setAttribute('type', 'number');
            const inputRight = document.createElement('input');
            inputRight.setAttribute('class', 'jframe-toolbtn-input');
            inputRight.setAttribute('type', 'number');
            const _change = ((e) => {
                targetBlock.jframe.dispatchEvent(new JFrameEvent('elementsResized', {
                    elements: [
                        {
                            targetBlock,
                            source: targetBlock.source,
                            width: `${inputLeft.value}px`,
                            height:`${inputRight.value}px`,
                        },
                    ]
                }))
                el.addEventListener('click', () => {
                    el.innerText = '';     
                    inputLeft.value = targetBlock.width;
                    inputRight.value = targetBlock.height
                    el.appendChild(wrapper);
                }, {
                    once: true
                })
            }).bind(this);
            inputLeft.addEventListener('change', _change)
            inputRight.addEventListener('change', _change)
            const op = document.createElement('span');
            op.innerText = 'x';
            const wrapper = document.createElement('span');
            wrapper.style.display = 'inline-block';
            wrapper.appendChild(inputLeft);
            wrapper.appendChild(op)
            wrapper.appendChild(inputRight);
        
            el.addEventListener('click', () => {
                el.innerText = '';     
                inputLeft.value = targetBlock.width;
                inputRight.value = targetBlock.height
                el.appendChild(wrapper);
            }, {
                once: true
            })
        }
        
        this.el = el;
        appendChild(el);
    }
    refresh(targetBlock) {
        this.el.innerText = renderContent(targetBlock);
    }
}

export default BlockSize;