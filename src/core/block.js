import Splitter from './splitter';
let uuid = 0;
class Block extends EventTarget{ 
    constructor(source, jframe, targetDoc, targetWapper, bounding = {}) {
        super();
        this.id = uuid ++;
        this.source = source;
        this.x = bounding.x;
        this.y = bounding.y;
        this.width = bounding.width;
        this.height = bounding.height;
        this.targetDoc = targetDoc;
        this.targetWapper = targetWapper;
        this.jframe = jframe;

        this._level = 0; // 当前块的深度
        const elem = targetDoc.createElement('div');
        elem.setAttribute('draggable', this.jframe.dataElemDescription.draggable(this.source));
        elem.setAttribute('class', 'jframe-block');
        this.elem = elem;
  
        this.splitLines = [];
        this._hoverEnable = true;

        this.tools = [];

        const {
            indicator,
            indicatorNumber,
        } = this.renderBoundsIndicator();
        
        Object.assign(this, {
            indicator,
            indicatorNumber
        })

        this.elem.appendChild(indicator);
        
        this.bindListeners();
    }

    get isFocus() {
        return this.jframe.state.focusTarget === this;
    }

    // toggleMarginBarRectVisible(val, dir) {
    //     if(val) {
    //         this.lockVisible(true);
    //         this[`marginBarRect${dir}`].setAttribute('visible', true);
    //     } else {
    //         this.lockVisible(false);
    //         this[`marginBarRect${dir}`].removeAttribute('visible');
    //     }
    // }

    lockVisible(val) {
        this.processingMarginRectVisible = val;
    }

    registTool(tool) {
        this.tools.push(tool);
    }


    toggleTools(val) {
        if(val) {

        } else {
            this.tools.forEach(t => {
                t.destroy();
            })
        }
    }

    toggleHoverEnable(val) {
        this._hoverEnable = val;
    }

    bindListeners() {
        this.elem.addEventListener('mouseenter', e => {
            if(this._hoverEnable) {
                this.jframe.setHoverTarget(this);
            }
        });
        this.elem.addEventListener('mouseleave', e => {
            if(this._hoverEnable) {
                this.jframe.resetHoverTarget(this);
            }
        });
        // this.elem.addEventListener('mousemove', e => {
        //     e.stopPropagation();
        //     console.log(e.offsetX, e.offsetY);

        //     this.jframe.getActiveFence([e.offsetX, e.offsetY], this);
        // })
        this.elem.addEventListener('click', e => {
            e.stopPropagation();
            console.log(this);
            this.jframe.setFocusTarget(this);
        });
        this.elem.addEventListener('dragstart', (e) => {
            this.setDragging(true)
            console.log('dragstart')
            this.jframe.setMovingTarget(this);
        })
        this.elem.addEventListener('dragend', () => {
            this.setDragging(false)
        })
    }

    setDragging(val) {
        if(val) {
            this.elem.setAttribute('dragging', val);
        } else {
            this.elem.removeAttribute('dragging');
        }
    }

    setHover(val) {
        if(val) {
            this.elem.setAttribute('hover', val);
        } else {
            this.elem.removeAttribute('hover');
        }
    }

    setFocus(val) {
        if(val) {
            this.elem.setAttribute('focus', val);
        } else {
            this.elem.removeAttribute('focus');
        }
    }

    setAcceptElem(val) {
        if(val) {
            this.elem.setAttribute('accept', val);
        } else {
            this.elem.removeAttribute('accept');
        }
    }

    setBounding(bounding = {}) {
        Object.assign(this, {
            x: bounding.left,
            y: bounding.top,
            width: bounding.width,
            height: bounding.height
        });
    }
    setStyle(styleSheet) {
        Object.assign(this, {
            marginLeft: parseFloat(styleSheet.marginLeft),
            marginRight: parseFloat(styleSheet.marginRight),
            marginTop: parseFloat(styleSheet.marginTop),
            marginBottom: parseFloat(styleSheet.marginBottom),
        })
    }
    setLevel(level) {
        this._level = level;
        this.elem.style['z-index'] = level;
    }

    render() {
        if(!this.elem.parentElement) {
            this.targetWapper.appendChild(this.elem);
        }
        this.elem.style.left = `${this.x}px`;
        this.elem.style.top = `${this.y}px`;
        this.elem.style.width = `${this.width}px`;
        this.elem.style.height = `${this.height}px`;
        // this.renderMargin();
        this.tools.forEach(tool => {
            tool.render(this);
        })
        this.renderSplitLines();
    }

    renderSplitLines() {
        const jframe = this.jframe;
        const source = this.source;
        if(!jframe.dataElemDescription.splitable(source)) {
            return;
        }
        const dir = jframe.dataElemDescription.getSplitableDiretion(source);
        let idx = 0;
        let reduce = 0;
        let lidx = 0;
        const children = jframe.dataElemDescription.getSourceChildren(source);
        while(idx < children.length) {
            const pre = children[idx];
            if(idx < children.length - 1) {
                const after = children[idx + 1];
                const preblock = jframe.source_block_element_map.getBlockBySource(pre);
                const afterblock = jframe.source_block_element_map.getBlockBySource(after);
                if(dir === 'row') {
                    reduce += (preblock.width + preblock.marginLeft + preblock.marginRight);
                }
                if(dir === 'column') {
                    reduce += (preblock.height + preblock.marginTop + preblock.marginBottom);
                }
                let splitter = this.splitLines[idx];
                if(!splitter) {
                    splitter = new Splitter(this);
                    this.splitLines[idx] = splitter;
                    splitter.attach(jframe.IFM.jframeTool);
                }
                lidx++;
                splitter.setProps(dir, reduce, preblock, afterblock);
            }
            idx ++;
        }
        const l = this.splitLines.length;
        while(lidx < l) {
            this.splitLines[lidx].destroy();
            lidx ++;
        }
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

    toggleIndicator(val, dir, point, whole) {
        const {
            indicator,
            indicatorNumber
        } = this;
        if(val) {
            if(dir === 'row') {
                Object.assign(indicator.style, {
                    width: this.width + 'px',
                    height: 0,
                    display: 'block',
                    transform: `translate(0px, ${point[1] - this.y}px)`,
                });
                Object.assign(indicatorNumber.style, {
                    top: 0,
                    left: '50%'
                })
            } 
            if(dir === 'column') {
                Object.assign(indicator.style, {
                    width: 0,
                    height: this.height + 'px',
                    display: 'block',
                    transform: `translate(${point[0] - this.x}px, 0px)`,
                });
                Object.assign(indicatorNumber.style, {
                    top: '50%',
                    left: 0
                })
            }
            indicatorNumber.innerText = `${Math.round(this.width/whole*100)}%(${Math.round(this.width)}px)`
        } else {
            indicator.style.display = 'none';
        }
    }

    isHit(point) {
        const x = this.x;
        const y = this.y;
        const w = this.width
        const h = this.height
        return point[0] >= x
            && point[0] <= x + w
            && point[1] >= y
            && point[1] <= y + h;
    }

    isHitInner(point) {
        const x = this.x + 4;
        const y = this.y + 4;
        const w = this.width - 8
        const h = this.height - 8
        return point[0] > x
            && point[0] < x + w
            && point[1] > y
            && point[1] < y + h;
    }

    getHorizontalSegments() {
        const cx = this.x + this.width;
        const cy = this.y + this.height;
        const { x, y } = this;
        
        return [
            [
                { x, y }, 
                { x: cx, y }
            ],
            [
                { x, y: cy }, 
                { x: cx, y: cy }
            ],
        ]
    }

    getVerticalSegments() {
        const cx = this.x + this.width;
        const cy = this.y + this.height;
        const { x, y } = this;
        return [
            [
                { x, y }, 
                { x, y: cy }],
            [
                { x: cx, y },
                { x: cx, y: cy }
            ],
        ]
    }

    observe(elem, callback) {
        if(this._observer) {
            this._observer.observe(elem, {
                childList: true,
                attributes: true,
                subtree: true,
            });
        } else {
            const observer = this.addObserve(elem, callback);
            this._observer = observer
        }
    }

    stopObserve() {
        this._observer.disconnect();
    }

    addObserve(elem, callback) {
        const observer = new MutationObserver(callback);
        observer.observe(elem, {
            childList: true,
            attributes: true,
            subtree: true,
        });
        return observer;
    }

    destroy() {
        this._observer.disconnect();
        this.source = null;
        this.splitLines.forEach(l => { l.destroy(); })
        this.elem.remove();
    }
}

export default Block;