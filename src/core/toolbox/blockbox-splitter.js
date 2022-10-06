import Tool from './tool'
import JFrameEvent from '../event/event';
const ELEMENT_KEYS = ['vline', 'splitterV', 'hline', 'splitterH', 'indicatorPre', 'indicatorAfter'];
class BlockBoxSplitter extends Tool {
    constructor(configs) {
        super();
        this.accept = configs.accept;
        this.getDirection = configs.getDirection;
        this.resizeMeta =  {
            lastX: undefined,
            lastY: undefined,
            min: undefined,
            max: undefined
        };
    }

    renderSplitterV(targetBlock) {
        const { width, height, jframe } = targetBlock;
        const vline = document.createElement('div');
        vline.setAttribute('class', 'jframe-block-splitter-line jframe-line-vertical');
        vline.style.height = height + 'px';
        vline.style.left = width/2 +'px'
        const splitterV = document.createElement('div');
        splitterV.setAttribute('class', 'jframe-block-splitter jframe-block-splitter-vertial')
        splitterV.style.left = width/2 +'px';
        splitterV.style.top = '8px';
        splitterV.addEventListener('mouseenter', () => {
            vline.style.display = 'block';
        })
        splitterV.addEventListener('mouseleave', () => {
            vline.style.display = 'none';
        })
        splitterV.addEventListener('click', (e) => {
            e.stopPropagation();
            jframe.dispatchEvent(new JFrameEvent('elementSplit', {
                block: targetBlock,
                source: targetBlock?.source,
                dir: 'row',
            }))
            this._toggleSplitter(false);
        })
        return {
            vline,
            splitterV,
        };
    }

    renderSplitterH(targetBlock) {
        const { width, height, jframe } = targetBlock;
        const hline = document.createElement('div');
        hline.setAttribute('class', 'jframe-block-splitter-line jframe-line-horizontal');
        hline.style.width = width + 'px';
        hline.style.top = height/2 +'px'
        const splitterH = document.createElement('div');
        splitterH.setAttribute('class', 'jframe-block-splitter jframe-block-splitter-horizontal')
        splitterH.style.left = (width - 48) +'px';
        splitterH.style.top = height/2 +'px'
        splitterH.addEventListener('mouseenter', () => {
            hline.style.display = 'block';
        })
        splitterH.addEventListener('mouseleave', () => {
            hline.style.display = 'none';
        })
        splitterH.addEventListener('click', (e) => {
            e.stopPropagation();
            jframe.dispatchEvent(new JFrameEvent('elementSplit', {
                block: targetBlock,
                source: targetBlock?.source,
                dir: 'column',
            }))
            this._toggleSplitter(false);
        });
        return {
            hline, 
            splitterH
        };
    }

    refreshSplitter(targetBlock) {
        const { width, height } = targetBlock;
        Object.assign(this.splitterV.style, {
            left: width/2 +'px',
            top: '8px',
        });
        Object.assign(this.vline.style, {
            height: height + 'px',
            left: width/2 +'px'
        })
        Object.assign(this.splitterH.style, {
            left: (width - 48) + 'px',
            top: height/2 +'px'
        });
        Object.assign(this.hline.style, {
            width: width +'px',
            top: height/2 +'px'
        });
    }


    renderBlockTool(targetBlock, appendChild) {
        if(this.accept(targetBlock.source)) {
            const { jframe, source } = targetBlock
            const children = jframe.dataElemDescription.getSourceChildren(source);
            const { 
                vline, splitterV
            } = this.renderSplitterV(targetBlock)
            const { 
                hline, splitterH
            } = this.renderSplitterH(targetBlock)
            appendChild(vline)
            appendChild(hline)
            appendChild(splitterV)
            appendChild(splitterH)

            Object.assign(this, {
                vline, splitterV, hline, splitterH,
            })
            if(children.length > 0 && this.accept(children[0])) {
                this._toggleSplitter(false)
            }
            Object.assign(this, {
                appendChild
            })
        }
    } 

    refresh(targetBlock) {
        if(this.accept(targetBlock.source)) {
            const { jframe, source } = targetBlock;
            const children = jframe.dataElemDescription.getSourceChildren(source);
            if(children.length > 0 && this.accept(children[0])) {
                this._toggleSplitter(false);
            } else {
                this.refreshSplitter(targetBlock);
            }
        }
    }

    _toggleSplitter(val) {
        ['splitterV', 'splitterH'].forEach(k => {
            if(this[k]){
                this[k].style.display = val ? 'block' : 'none';
            }
        })
    }

    destroy() {
        ELEMENT_KEYS.forEach(k => {
            if(this[k]){
                this[k].remove();
            }
        })
        if(this.splitterLines){
            this.splitterLines.forEach(l => l.remove());
        }
    }
}

export default BlockBoxSplitter;