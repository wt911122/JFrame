import JFrameEvent from './event/event';
class Splitter {
    constructor(targetBlock) {
        this.elem = document.createElement('div');
        this.targetBlock = targetBlock;
        this.bindSplitLineEventListener();
    }

    setProps(dir, reduce, idx, siblingBlocks) {
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
        this.idx = idx;
        this.siblingBlocks = siblingBlocks;
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
                idx, targetBlock, dir,
                siblingBlocks,
            } = this;
            // siblingBlocks[idx].toggleHoverEnable(false);
            // siblingBlocks[idx + 1].toggleHoverEnable(false);
            const targetElem = jframe.source_block_element_map.getElementBySource(targetBlock.source);
            const wholeWidth = targetBlock.width;
            const wholeHeight = targetBlock.height;
            const space = targetBlock.splitsSpaces[idx] + targetBlock.splitsSpaces[idx + 1];
            function minmax(num) {
                return Math.max(0, Math.min(space, num));
            }
            this.toggleActive(true)
            return [targetElem, wholeWidth, wholeHeight, minmax, space]
        }, (deltaX, deltaY, point, targetElem, wholeWidth, wholeHeight, minmax, space) => {
            const {
                dir, siblingBlocks, idx
            } = this;
            if(dir === 'row') {
                // const w = preElem.getBoundingClientRect().width;
                const columns = targetElem.style['grid-template-columns'].split(/\s+/);
                const percent = parseFloat(columns[idx])/100;
                const w = percent * wholeWidth;
                const calW = minmax(w + deltaX);
                const r1 = calW / wholeWidth * 100 + '%';
                const r2 = (space - calW) / wholeWidth * 100 + '%';
                columns.splice(idx, 2, r1, r2);
                targetElem.style['grid-template-columns'] = columns.join(' ');
                
                siblingBlocks.forEach(b => {
                    // if(b === preblock) {
                    //     preblock.toggleIndicator(true, dir, point, wholeWidth, calW / space);
                    // } else if(b === afterblock) {
                    //     afterblock.toggleIndicator(true, dir, point, wholeWidth, 1 - calW / space);
                    // } else {
                        b.toggleIndicator(true, dir, point, wholeWidth);
                    // }
                })
            }

            if(dir === 'column') {
                const rows = targetElem.style['grid-template-rows'].split(/\s+/);
                const percent = parseFloat(rows[idx])/100;
                const w = percent * wholeHeight;
                const calW = minmax(w + deltaY);
                const r1 = calW / wholeHeight * 100 + '%';;
                const r2 = (space - calW) / wholeHeight * 100 + '%';;
                rows.splice(idx, 2, r1, r2);
                targetElem.style['grid-template-rows'] = rows.join(' ');
                
                siblingBlocks.forEach(b => {
                    // if(b === preblock) {
                    //     preblock.toggleIndicator(true, dir, point, wholeHeight, callH / space);
                    // } else if(b === afterblock) {
                    //     afterblock.toggleIndicator(true, dir, point, wholeHeight, 1-callH / space);
                    // } else {
                        b.toggleIndicator(true, dir, point, wholeHeight);
                    // }
                })
            }

            return [targetElem];
        }, (event, targetElem) => {
            const {
                siblingBlocks, targetBlock
            } = this;
            jframe.IFM.toggleBlockHoverStyle(false);
            this.toggleActive(false)
            siblingBlocks.forEach(b => { b.toggleIndicator(false) });
            jframe.dispatchEvent(new JFrameEvent('elementResplit', {
                elements: [
                    {
                        targetBlock: targetBlock,
                        source: targetBlock.source,
                        gridColumns: targetElem.style['grid-template-columns'],
                        gridRows: targetElem.style['grid-template-rows'],
                    },
                ]
            }))
        });
    }
    destroy() {
        this.elem.remove();
    }
}
export default Splitter;