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

    renderSplitLine(dir, reduce, targetBlock, preblock, afterBlock) {
        const { width, height } = targetBlock;
        if(dir === 'row') {
            const vline = document.createElement('div');
            vline.setAttribute('class', 'jframe-block-line jframe-line-vertical');
            vline.style.height = height + 'px';
            vline.style.left = reduce +'px'
            this.bindSplitLineEventListener(vline, dir, targetBlock, preblock, afterBlock)
            return vline;
        }
        if(dir === 'column'){
            const hline = document.createElement('div');
            hline.setAttribute('class', 'jframe-block-line jframe-line-horizontal');
            hline.style.width = width + 'px';
            hline.style.top = reduce +'px'
            this.bindSplitLineEventListener(hline, dir, targetBlock, preblock, afterBlock)
            return hline
        }
    }

    renderBLockBoundsLine() {
        const indicatorPre = document.createElement('div');
        indicatorPre.setAttribute('class', 'jframe-block-indicator');
        const indicatorPreNumber = document.createElement('div');
        indicatorPreNumber.setAttribute('class', 'jframe-block-indicator-number');
        indicatorPre.appendChild(indicatorPreNumber)
        const indicatorAfter = document.createElement('div');
        indicatorAfter.setAttribute('class', 'jframe-block-indicator');
        const indicatorAfterNumber = document.createElement('div');
        indicatorAfterNumber.setAttribute('class', 'jframe-block-indicator-number');
        indicatorAfter.appendChild(indicatorAfterNumber)
        return {
            indicatorPre,
            indicatorAfter,
            indicatorPreNumber,
            indicatorAfterNumber,
        }
    }

    bindSplitLineEventListener(splitLine, dir, targetBlock, preblock, afterBlock) { 
        splitLine.addEventListener('pointerdown', e => {
            e.preventDefault();
            const { clientX, clientY } = e;
                
            Object.assign(this.resizeMeta, {
                lastX: clientX, 
                lastY: clientY,
            });

            const {
                indicatorPre, indicatorAfter,
                indicatorPreNumber,
                indicatorAfterNumber
            } = this;

            const jframe = targetBlock.jframe;
            const preSource = preblock.source;
            const afterSource = afterBlock.source;
            const preElem = jframe.source_block_element_map.getElementBySource(preSource);
            const afterElem = jframe.source_block_element_map.getElementBySource(afterSource);
            let space;
            const wholeWidth = targetBlock.width;
            const wholeHeight = targetBlock.height;
            let wholeRatio;
            if(dir === 'row') {
                space = preblock.width + afterBlock.width;
                wholeRatio = space / wholeWidth;
                // Indicator
                const { offsetX, offsetY } = jframe.resolveEventOffset(e);
                const point = jframe.calculateToIframeCoordinate(offsetX, offsetY);
                Object.assign(indicatorPre.style, {
                    width: preblock.width + 'px',
                    height: 0,
                    display: 'block',
                    transform: `translate(${preblock.x - targetBlock.x}px, ${point[1] - targetBlock.y}px)`,
                });
                Object.assign(indicatorPreNumber.style, {
                    top: 0,
                    left: '50%'
                })
                indicatorPreNumber.innerText = `${preblock.width/wholeWidth*100}%(${preblock.width}px)`

                Object.assign(indicatorAfter.style, {
                    width: afterBlock.width + 'px',
                    height: 0,
                    display: 'block',
                    transform: `translate(${afterBlock.x - targetBlock.x}px, ${point[1] - targetBlock.y}px)`,
                })
                Object.assign(indicatorAfterNumber.style, {
                    top: 0,
                    left: '50%'
                })
                indicatorAfterNumber.innerText = `${afterBlock.width/wholeWidth*100}%(${afterBlock.width}px)`
            }
            if(dir === 'column') {
                space = preblock.height + afterBlock.height;
                wholeRatio = space / wholeHeight;
                // Indicator
                const { offsetX, offsetY } = jframe.resolveEventOffset(e);
                const point = jframe.calculateToIframeCoordinate(offsetX, offsetY);
                Object.assign(indicatorPre.style, {
                    width: 0,
                    height: preblock.height + 'px',
                    display: 'block',
                    transform: `translate(${point[0] - targetBlock.x}px, ${preblock.y - targetBlock.y}px)`,
                });
                Object.assign(indicatorPreNumber.style, {
                    top: '50%',
                    left: 0
                })
                indicatorPreNumber.innerText = `${preblock.height/wholeHeight*100}%(${preblock.height}px)`

                Object.assign(indicatorAfter.style, {
                    width: 0,
                    height: afterBlock.height + 'px',
                    display: 'block',
                    transform: `translate(${point[0] - targetBlock.x}px, ${afterBlock.y - targetBlock.y}px)`,
                })
                Object.assign(indicatorAfterNumber.style, {
                    top: '50%',
                    left: 0
                })
                indicatorAfterNumber.innerText = `${afterBlock.height/wholeHeight*100}%(${afterBlock.height}px)`
            }
            let processing = false;
            function minmax(num) {
                console.log(space)
                return Math.max(0, Math.min(space, num));
            }

            const f = (e => {
                if(processing){
                    return;
                }
                processing = true;
                const { clientX, clientY } = e;
                const {
                    lastX, lastY,
                } = this.resizeMeta;
                if(dir === 'row') {
                    const deltaX = (clientX - lastX) / jframe.scale;
                    const w = preElem.getBoundingClientRect().width;
                    const calW = minmax(w + deltaX);
                    const acalW = space - calW;
                    const preW = calW / wholeWidth;
                    const afterW = wholeRatio - preW;
                    preElem.style.width = `${preW * 100}%`;
                    afterElem.style.width = `${afterW * 100}%`;

                    const { offsetX, offsetY } = jframe.resolveEventOffset(e);
                    const point = jframe.calculateToIframeCoordinate(offsetX, offsetY);
                    Object.assign(indicatorPre.style, {
                        width: calW + 'px',
                        transform: `translate(${preblock.x - targetBlock.x}px, ${point[1] - targetBlock.y}px)`,
                    })
                    indicatorPreNumber.innerText = `${Math.round(preW * 100)}%(${Math.round(calW)}px)`
    
                    Object.assign(indicatorAfter.style, {
                        width: acalW + 'px',
                        transform: `translate(${afterBlock.x - targetBlock.x}px, ${point[1] - targetBlock.y}px)`,
                    })
                    indicatorAfterNumber.innerText = `${Math.round(afterW*100)}%(${Math.round(acalW)})px)`
                }
                if(dir === 'column') {
                    const deltaY = (clientY - lastY) / jframe.scale;
                    const callH = minmax(preElem.getBoundingClientRect().height + deltaY);
                    const acalH = space - callH;
                    const preH = callH / wholeHeight;
                    const afterH = wholeRatio - preH;
                    preElem.style.height = `${preH*100}%`;
                    afterElem.style.height = `${afterH*100}%`;

                    const { offsetX, offsetY } = jframe.resolveEventOffset(e);
                    const point = jframe.calculateToIframeCoordinate(offsetX, offsetY);
                    Object.assign(indicatorPre.style, {
                        height: callH + 'px',
                        transform: `translate(${point[0] - targetBlock.x}px, ${preblock.y - targetBlock.y}px)`,
                    })
                    indicatorPreNumber.innerText = `${Math.round(preH * 100)}%(${Math.round(callH)}px)`
    
                    Object.assign(indicatorAfter.style, {
                        height: acalH + 'px',
                        transform: `translate(${point[0] - targetBlock.x}px, ${afterBlock.y - targetBlock.y}px)`,
                    })
                    indicatorAfterNumber.innerText = `${Math.round(afterH*100)}%(${Math.round(acalH)})px)`
                }
                
                Object.assign(this.resizeMeta, {
                    lastX: clientX,
                    lastY: clientY,
                })
                processing = false;
            }).bind(this);
    
            document.addEventListener('pointermove', f);
            document.addEventListener('pointerup', event => {
                console.log('pointerup');
                event.preventDefault();
                event.stopPropagation();
                Object.assign(this.resizeMeta, {
                    lastX: undefined,
                    lastY: undefined
                })
                Object.assign(indicatorPre.style, {
                    display: 'none'
                })

                Object.assign(indicatorAfter.style, {
                    display: 'none'
                })
                
                document.removeEventListener('pointermove', f);
                jframe.dispatchEvent(new JFrameEvent('elementsResized', {
                    elements: [
                        {
                            targetBlock: preblock,
                            source: preSource,
                            width: preElem.style.width,
                            height: preElem.style.height
                        },
                        {
                            targetBlock: afterBlock,
                            source: afterSource,
                            width: afterElem.style.width,
                            height: afterElem.style.height
                        }
                    ]
                }))
            }, {
                once: true
            })
        })
    }

    

    renderSplitLines(targetBlock) {
        const { jframe, source } = targetBlock
        const splitterLines = [];
        const dir = this.getDirection(targetBlock);
        let idx = 0;
        let reduce = 0;
        
        const children = jframe.dataElemDescription.getSourceChildren(source);
        while(idx < children.length) {
            const pre = children[idx];
            if(idx < children.length - 1) {
                const after = children[idx + 1];
                const preblock = jframe.source_block_element_map.getBlockBySource(pre);
                const afterblock = jframe.source_block_element_map.getBlockBySource(after);
                if(dir === 'row') {
                    reduce += preblock.width;
                }
                if(dir === 'column') {
                    reduce += preblock.height;
                }
                const line = this.renderSplitLine(dir, reduce, targetBlock, preblock, afterblock);
                if(line) {
                    splitterLines.push(line)
                }
            }
            this.renderBLockBoundsLine(dir, pre);
            idx ++;
        }
        return splitterLines;
        
    }

    // renderBlockBoundsIndicator(targetBlock) {
    //     const dir = this.getDirection(targetBlock);
    // }

    refreshSplitLines(targetBlock) {
        const { jframe, source } = targetBlock
        const dir = this.getDirection(targetBlock);
        const children = jframe.dataElemDescription.getSourceChildren(source);
        const splitterLines = this.splitterLines;
        let idx = 0, reduce = 0;
        while(idx < children.length - 1) {
            const pre = children[idx];
            const line = splitterLines[idx];
            const preblock = jframe.source_block_element_map.getBlockBySource(pre);
            if(dir === 'row') {
                reduce += preblock.width;
                line.style.left = reduce + 'px';
            }
            if(dir === 'column') {
                reduce += preblock.height;
                line.style.top = reduce + 'px';
            }
            idx ++;
        }
    }

    renderBlockTool(targetBlock, appendChild) {
        if(this.accept(targetBlock)) {
            const { jframe, source } = targetBlock
            const children = jframe.dataElemDescription.getSourceChildren(source);
            const { 
                vline, splitterV
            } = this.renderSplitterV(targetBlock)
            const { 
                hline, splitterH
            } = this.renderSplitterH(targetBlock)
            const {
                indicatorPre, 
                indicatorAfter,
                indicatorPreNumber,
                indicatorAfterNumber
            } = this.renderBLockBoundsLine();
            appendChild(vline)
            appendChild(hline)
            appendChild(splitterV)
            appendChild(splitterH)
            appendChild(indicatorPre);
            appendChild(indicatorAfter);
            Object.assign(this, {
                vline, splitterV, hline, splitterH, indicatorPre, indicatorAfter, 
                indicatorPreNumber,
                indicatorAfterNumber
            })
            let splitterLines = [];
            if(children.length > 1 && children.every((c) => this.accept(jframe.source_block_element_map.getBlockBySource(c)))) {
                splitterLines = this.renderSplitLines(targetBlock);
                splitterLines.forEach(l => {
                    appendChild(l);
                })
                this._toggleSplitter(false)
            } else {
                this._toggleSplitter(true);
            }
            Object.assign(this, {
                splitterLines, appendChild
            })
        }
    } 

    refresh(targetBlock) {
        if(this.accept(targetBlock)) {
            const { jframe, source } = targetBlock;
            const children = jframe.dataElemDescription.getSourceChildren(source);

            if(children.length > 0) {
                if(this.splitterLines.length !== (children.length - 1)) {
                    this.splitterLines.forEach(l => l.remove());
                    const splitterLines = this.renderSplitLines(targetBlock);
                    splitterLines.forEach(l => {
                        this.appendChild(l);
                    });
                    this.splitterLines = splitterLines;
                    this._toggleSplitter(false);
                } else {
                    this.refreshSplitLines(targetBlock);
                }
                
            } else {
                if(this.splitterLines.length !== (children.length - 1) ) {
                    this.splitterLines.forEach(l => l.remove());
                }
                this.refreshSplitter(targetBlock);
                this._toggleSplitter(true);
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