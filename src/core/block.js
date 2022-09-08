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
        
        this.bindListeners();
    }

    get isFocus() {
        return this.jframe.state.focusTarget === this;
    }

    toggleTools(val) {
        if(val) {

        } else {
            this.tools.forEach(t => {
                t.destroy();
            })
        }
    }

    bindListeners() {
        this.elem.addEventListener('mouseenter', e => {
            this.jframe.setHoverTarget(this);
        });
        this.elem.addEventListener('mouseleave', e => {
            this.jframe.resetHoverTarget(this);
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

    // setSplit(val) {
    //     if(val) {
    //         const { 
    //             splitterH, splitterV
    //         } = this.splitter;
    //         splitterH.style.display = 'none';
    //         splitterV.style.display = 'none';
    //     } else {
    //         const { 
    //             splitterH, splitterV
    //         } = this.splitter;
    //         splitterH.style.display = 'block';
    //         splitterV.style.display = 'block';
    //     }
    // }

    setBounding(bounding = {}) {
        Object.assign(this, {
            x: bounding.left,
            y: bounding.top,
            width: bounding.width,
            height: bounding.height
        });
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
        this.elem.remove();
    }
}

export default Block;