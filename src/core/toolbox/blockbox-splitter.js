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
    renderBoundsIndicator() {
        const indicator = document.createElement('div');
        indicator.setAttribute('class', 'jframe-block-indicator');
        indicator.style.display = 'none';
        const indicatorNumber = document.createElement('div');
        indicatorNumber.setAttribute('class', 'jframe-block-indicator-number');
        indicator.appendChild(indicatorNumber)
        return {
            indicator,
            indicatorNumber,
        }
    }

    renderSplitterV(targetBlock) {
        const { width, height, jframe, source, elem, y } = targetBlock;
        const vline = document.createElement('div');
        vline.setAttribute('class', 'jframe-block-splitter-line jframe-line-vertical');
        vline.style.height = height + 'px';
        vline.style.left = width/2 +'px'
        const splitterV = document.createElement('div');
        splitterV.setAttribute('class', 'jframe-block-splitter jframe-block-splitter-vertial')
        splitterV.style.left = width/2 +'px';
        splitterV.style.top = '24px';
        splitterV.addEventListener('mouseenter', () => {
            vline.style.display = 'block';
        })
        const f = () => {
            vline.style.left = width/2 +'px'
            vline.style.display = 'none';
        }
        splitterV.addEventListener('mouseleave', f);
        const {
            indicator: indicatorPre,
            indicatorNumber: indicatorNumberPre,
        } = this.renderBoundsIndicator();
        
        const {
            indicator: indicatorAfter,
            indicatorNumber: indicatorNumberAfter,
        } = this.renderBoundsIndicator();

        Object.assign(indicatorNumberPre.style, {
            top: 0,
            left: '50%'
        })
        Object.assign(indicatorNumberAfter.style, {
            top: 0,
            left: '50%'
        })
        function minmax(num) {
            return Math.max(0, Math.min(width, num));
        }
        let startLeft 
        jframe.bindDragdropListener(splitterV, () => {
            startLeft = width/2;
            splitterV.removeEventListener('mouseleave', f);
            this._toggleSplitter(false);
            elem.appendChild(indicatorPre);
            elem.appendChild(indicatorAfter);
            indicatorPre.classList.add('jframe-block-indicator-horizontal');
            indicatorAfter.classList.add('jframe-block-indicator-horizontal');
        }, (deltaX, deltaY, point) => {
            startLeft = minmax(startLeft + deltaX);
            vline.style.left = `${startLeft}px`;
            Object.assign(indicatorPre.style, {
                width: startLeft - 4 + 'px',
                height: 0,
                left: 0,
                display: 'block',
                transform: `translate(0px, ${point[1] - y}px)`,
            });
            Object.assign(indicatorAfter.style, {
                width: width - startLeft - 4 + 'px',
                left: startLeft + 'px',
                height: 0,
                display: 'block',
                transform: `translate(0px, ${point[1] - y}px)`,
            });

            indicatorNumberPre.innerText = `${Math.round(startLeft/width*100)}%(${Math.round(startLeft)}px)`
            indicatorNumberAfter.innerText = `${Math.round((width - startLeft)/width*100)}%(${Math.round(width - startLeft)}px)`
        }, () => {
            indicatorPre.style.display = 'none';
            indicatorAfter.style.display = 'none';
            indicatorPre.remove();
            indicatorAfter.remove();
            indicatorPre.classList.remove('jframe-block-indicator-horizontal');
            indicatorAfter.classList.remove('jframe-block-indicator-horizontal');
            if(startLeft > 2 && startLeft < width - 2 ){
                jframe.dispatchEvent(new JFrameEvent('elementSplit', {
                    block: targetBlock,
                    source: targetBlock?.source,
                    dir: 'row',
                    splitRatio: startLeft / width,
                }))
            }  else {
                this._toggleSplitter(true);
            }
            f();
        });

        return {
            vline,
            splitterV,
        };
    }

    renderSplitterH(targetBlock) {
        const { width, height, jframe, elem, x } = targetBlock;
        const hline = document.createElement('div');
        hline.setAttribute('class', 'jframe-block-splitter-line jframe-line-horizontal');
        hline.style.width = width + 'px';
        hline.style.top = height/2 +'px'
        const splitterH = document.createElement('div');
        splitterH.setAttribute('class', 'jframe-block-splitter jframe-block-splitter-horizontal')
        splitterH.style.left = (width - 64) +'px';
        splitterH.style.top = height/2 +'px'
        splitterH.addEventListener('mouseenter', () => {
            hline.style.display = 'block';
        })
        const f = () => {
            hline.style.top = height/2 +'px'
            hline.style.display = 'none';
        }
        splitterH.addEventListener('mouseleave', f);
        splitterH.addEventListener('click', (e) => {
            e.stopPropagation();
            jframe.dispatchEvent(new JFrameEvent('elementSplit', {
                block: targetBlock,
                source: targetBlock?.source,
                dir: 'column',
            }))
            this._toggleSplitter(false);
        });
        const {
            indicator: indicatorPre,
            indicatorNumber: indicatorNumberPre,
        } = this.renderBoundsIndicator();
        
        const {
            indicator: indicatorAfter,
            indicatorNumber: indicatorNumberAfter,
        } = this.renderBoundsIndicator();

        Object.assign(indicatorNumberPre.style, {
            top: '50%',
            left: 0
        })
        Object.assign(indicatorNumberAfter.style, {
            top: '50%',
            left: 0
        })
        function minmax(num) {
            return Math.max(0, Math.min(height, num));
        }
        let start;
        jframe.bindDragdropListener(splitterH, () => {
            start = height/2;
            splitterH.removeEventListener('mouseleave', f);
            this._toggleSplitter(false);
            elem.appendChild(indicatorPre);
            elem.appendChild(indicatorAfter);
            indicatorPre.classList.add('jframe-block-indicator-vertical');
            indicatorAfter.classList.add('jframe-block-indicator-vertical');
        }, (deltaX, deltaY, point) => {
            start = minmax(start + deltaY);
            hline.style.top = `${start}px`;
            Object.assign(indicatorPre.style, {
                width: 0,
                top: 0,
                left: 0,
                height: start - 4 + 'px',
                display: 'block',
                transform: `translate(${point[0] - x}px, 0px)`,
            });
            Object.assign(indicatorAfter.style, {
                width: 0,
                top: start + 'px',
                left: 0,
                height: height - start - 4 + 'px',
                display: 'block',
                transform: `translate(${point[0] - x}px, 0px)`,
            });

            indicatorNumberPre.innerText = `${Math.round(start/height*100)}%(${Math.round(start)}px)`
            indicatorNumberAfter.innerText = `${Math.round((height - start)/height*100)}%(${Math.round(height - start)}px)`
        }, () => {
            indicatorPre.style.display = 'none';
            indicatorAfter.style.display = 'none';
            indicatorPre.remove();
            indicatorAfter.remove();
            indicatorPre.classList.remove('jframe-block-indicator-vertical');
            indicatorAfter.classList.remove('jframe-block-indicator-vertical');
            if(start > 2 && start < height - 2 ){
                jframe.dispatchEvent(new JFrameEvent('elementSplit', {
                    block: targetBlock,
                    source: targetBlock?.source,
                    dir: 'column',
                    splitRatio: start / height,
                }))
            } else {
                this._toggleSplitter(true);
            }
            f();
        });

        // jframe.bindDragdropListener(splitterH, () => {
        //     splitterH.removeEventListener('mouseleave', f);
        //     this._toggleSplitter(false);
        // }, (deltaX, deltaY) => {
        //     start = minmax(start + deltaY);
        //     hline.style.top = `${start}px`;
        // }, () => {
        //     jframe.dispatchEvent(new JFrameEvent('elementSplit', {
        //         block: targetBlock,
        //         source: targetBlock?.source,
        //         dir: 'column',
        //         splitRatio: start / height,
        //     }))
        //     f();
        // });
        return {
            hline, 
            splitterH
        };
    }

    refreshSplitter(targetBlock) {
        const { width, height } = targetBlock;
        Object.assign(this.splitterV.style, {
            left: width/2 +'px',
            top: '24px',
        });
        Object.assign(this.vline.style, {
            height: height + 'px',
            left: width/2 +'px'
        })
        Object.assign(this.splitterH.style, {
            left: (width - 64) + 'px',
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
        } else {
            this._toggleSplitter(false);
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