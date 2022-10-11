import JFrameEvent from './event/event';
class Splitter {
    constructor(targetBlock) {
        this.elem = document.createElement('div');
        this.targetBlock = targetBlock;
        this.bindSplitLineEventListener();
    }

    setProps(dir, reduce, preblock, afterblock) {
        const { width, height, x, y } = this.targetBlock;
        const line = this.elem;
        this.dir = dir;
        if(dir === 'row') {
            line.setAttribute('class', 'jframe-block-line jframe-line-vertical');
            line.style.height = height + 'px';
            line.style.top = y +'px'
            line.style.left = reduce + x +'px'
        }
        if(dir === 'column'){
            line.setAttribute('class', 'jframe-block-line jframe-line-horizontal');
            line.style.width = width + 'px';
            line.style.top = reduce + y +'px'
            line.style.left = x + 'px'
        }
        this.preblock = preblock;
        this.afterblock = afterblock;
    }

    attach(dom) {
        dom.appendChild(this.elem);
    }

    toggleActive(val) {
        if(val) {
            this.elem.setAttribute('active', true)
        } else {
            this.elem.removeAttribute('active')
        }
    }

    bindSplitLineEventListener() {
        const jframe = this.targetBlock.jframe;
        jframe.bindDragdropListener(this.elem, () => {
            jframe.IFM.toggleBlockHoverStyle(true);
            const {
                preblock, afterblock, targetBlock, dir
            } = this;
            preblock.toggleHoverEnable(false);
            afterblock.toggleHoverEnable(false);
            const preSource = preblock.source;
            const afterSource = afterblock.source;
            const preElem = jframe.source_block_element_map.getElementBySource(preSource);
            const afterElem = jframe.source_block_element_map.getElementBySource(afterSource);
            let space;
            const wholeWidth = targetBlock.width;
            const wholeHeight = targetBlock.height;

            let wholeRatio;
            if(dir === 'row') {
                space = preblock.width + afterblock.width;
                wholeRatio = space / wholeWidth; 
            }
            if(dir === 'column') {
                space = preblock.height + afterblock.height;
                wholeRatio = space / wholeHeight;
            }
            function minmax(num) {
                return Math.max(0, Math.min(space, num));
            }
            this.toggleActive(true)
            return [preElem, afterElem, wholeWidth, wholeHeight, wholeRatio, minmax]
        }, (deltaX, deltaY, point, preElem, afterElem, wholeWidth, wholeHeight, wholeRatio, minmax) => {
            const {
                dir, preblock, afterblock, 
            } = this;
            if(dir === 'row') {
                const w = preElem.getBoundingClientRect().width;
                const calW = minmax(w + deltaX);
                const preW = calW / wholeWidth;
                const afterW = wholeRatio - preW;
                preElem.style.width = `${preW * 100}%`;
                afterElem.style.width = `${afterW * 100}%`;
                preblock.toggleIndicator(true, dir, point, wholeWidth);
                afterblock.toggleIndicator(true, dir, point, wholeWidth);
            }

            if(dir === 'column') {
                const h = preElem.getBoundingClientRect().height
                const callH = minmax(h + deltaY);
                const preH = callH / wholeHeight;
                const afterH = wholeRatio - preH;
                preElem.style.height = `${preH*100}%`;
                afterElem.style.height = `${afterH*100}%`;
                preblock.toggleIndicator(true, dir, point, wholeHeight);
                afterblock.toggleIndicator(true, dir, point, wholeHeight);
            }

        }, (event, preElem, afterElem) => {
            const {
                preblock, afterblock
            } = this;
            preblock.toggleIndicator(false);
            afterblock.toggleIndicator(false);
            preblock.toggleHoverEnable(true);
            afterblock.toggleHoverEnable(true);
            jframe.IFM.toggleBlockHoverStyle(false);
            const prestylesheet = window.getComputedStyle(preElem);
            const afterstylesheet = window.getComputedStyle(afterElem);
            this.toggleActive(false)
            jframe.dispatchEvent(new JFrameEvent('elementsResized', {
                elements: [
                    {
                        targetBlock: preblock,
                        source: preblock.source,
                        width: preElem.style.width,
                        height: preElem.style.height,
                        marginLeft: prestylesheet.marginLeft,
                        marginRight: prestylesheet.marginRight,
                        marginTop: prestylesheet.marginTop,
                        marginBottom: prestylesheet.marginBottom,
                    },
                    {
                        targetBlock: afterblock,
                        source: afterblock.source,
                        width: afterElem.style.width,
                        height: afterElem.style.height,
                        marginLeft: afterstylesheet.marginLeft,
                        marginRight: afterstylesheet.marginRight,
                        marginTop: afterstylesheet.marginTop,
                        marginBottom: afterstylesheet.marginBottom,
                    }
                ]
            }))
        });
    }
    destroy() {
        this.elem.remove();
    }
}
export default Splitter;