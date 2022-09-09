import Tool from './tool'
import JFrameEvent from '../event/event';
class BlockBoxContentEditor extends Tool {
    constructor(configs) {
        super();
        this.accept = configs.accept;
        this.getContent = configs.getContent;
        this.onContentChange = configs.onContentChange;
    }

    renderBlockTool(targetBlock, appendChild) {
        if(this.accept(targetBlock)) {
            const { width, height } = targetBlock;
            const inputElemWrapper = document.createElement('div');
            inputElemWrapper.setAttribute('class', 'jframe-block-content-editor');
            const inputElem = document.createElement('input');
            inputElem.setAttribute('class', 'jframe-block-content-editor-input');
            inputElem.setAttribute('type', 'text');
            inputElemWrapper.appendChild(inputElem);
            inputElem.value = this.getContent(targetBlock.source);
            inputElem.addEventListener('blur', () => {
                this.onContentChange(targetBlock.source, inputElem.value);
                this.el.style.display = 'none';
            })
            inputElem.addEventListener('keydown', (e) => {
                if(e.key === 'Enter') {
                    this.onContentChange(targetBlock.source, inputElem.value);
                    this.el.style.display = 'none';
                }
            })
            inputElemWrapper.style.width = width + 'px';
            inputElemWrapper.style.height = height + 'px';
            const f = (() => {
                inputElemWrapper.style.display = 'flex';
                inputElemWrapper.style.width = width + 'px';
                inputElemWrapper.style.height = height + 'px';
                inputElem.value = this.getContent(targetBlock.source);
                inputElem.focus();
            }).bind(this);

            targetBlock.elem.addEventListener('dblclick', f);
            this.abortListener = () => {
                targetBlock.elem.removeEventListener('dblclick', f);
            }
            appendChild(inputElemWrapper);
            this.el = inputElemWrapper;
            this.inputElem = inputElem;
        }
    } 

    refresh(targetBlock) {
        if(this.accept(targetBlock)) {
            this.el.style.display = 'none';
        }
    }

    destroy() {
        if(this.el) {
            this.abortListener();
            this.el.remove();
        }
    }
}

export default BlockBoxContentEditor;