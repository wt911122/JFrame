// import Messager from '../message/messager';
import JFrameEvent from '../event/event';
import { distToSegmentSquared } from '../utils/functions';
function getMapObject(block, element) {
    return {
        block,
        element,
    }
}

class sourceBlockElememtMap {
    constructor() {
        this._map = new WeakMap();
    }

    get(source) {
        return this._map.get(source);
    }

    has(source) {
        return this._map.has(source);
    }

    clear() {
        this._map.clear();
    }

    getBlockBySource(source) {
        const mapping = this._map.get(source);
        if(mapping) {
            return mapping.block;
        }
        return undefined;
    }

    getElementBySource(source) {
        const mapping = this._map.get(source);
        if(mapping) {
            return mapping.element;
        }
        return undefined;
    }

    setBlockBySource(source, block) {
        if(!this.has(source)) {
            const obj = getMapObject(block);
            this._map.set(source, obj);
        } else {
            const obj = this._map.get(source);
            obj.block = block;
        }
    }
    setElementBySource(source, element) {
        if(!this.has(source)) {
            const obj = getMapObject(undefined, element);
            this._map.set(source, obj);
        } else {
            const obj = this._map.get(source);
            obj.element = element;
        }
    }
}

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

        this.elem = targetDoc.createElement('div');
        this.elem.setAttribute('draggable', true)
        this.elem.setAttribute('class', 'jframe-block')
        this.bindListeners();
    }

    get isFocus() {
        return this.jframe.state.focusTarget === this;
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
        this.elem.addEventListener('dragstart', e => {
            this.setDragging(true)
            this.jframe.setMovingTarget(this);
        })
        // this.elem.addEventListener('mouseleave', e => {
        //     console.log(e);
        // });
        // this.elem.addEventListener('click', e => {
        //     this.dispatchEvent(e);
        // });
    }

    setDragging(val) {
        if(val) {
            this.elem.setAttribute('dragging', val);
        } else {
            this.elem.removeAttribute('dragging');
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
        console.log(bounding)
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
            [{
                x,
                y
            }, {
                x: cx,
                y
            }],
            [{
                x,
                y: cy,
            }, {
                x: cx,
                y: cy,
            }],
        ]
    }

    getVerticalSegments() {
        const cx = this.x + this.width;
        const cy = this.y + this.height;
        const { x, y } = this;
        return [
            [{
                x,
                y
            }, {
                x,
                y: cy,
            }],
            [{
                x: cx,
                y,
            }, {
                x: cx,
                y: cy,
            }],
        ]
    }

    observe(elem, callback) {
        const observer = new MutationObserver(callback);
        observer.observe(elem, {
            childList: true,
            attributes: true,
            subtree: true,
        });
        this._observer = observer
    }

    destroy() {
        this._observer.disconnect();
        this.source = null;
        this.elem.remove();
    }
}


class JFrame extends EventTarget {
    constructor(configs){
        super();
        this.frameURL = configs.frameURL;
        this.initialZoom = configs.initialZoom;
        this.padding = configs.padding || 20;
        this.maxZoom = configs.maxZoom || 2;
        this.minZoom = configs.minZoom || 1;
        this.dataElemDescription = configs.dataElemDescription;
        this.hoverIndicator = configs.hoverIndicator;
        this.focusIndicator = configs.focusIndicator;
        // this.source = configs.source;

        this.frameBoundingRect = { width: 0, height: 0 };
        this.position = { x: 0, y: 0, offsetX: 0, offsetY: 0 };
        this.scale = 1;
        this.domMeta = { x: 0, y: 0 }; 

        this.source_block_element_map = new sourceBlockElememtMap();

        this.state = {
            hoverTarget: null,
            focusTarget: null,
            dragoverTarget: null,
            dragoverTargetWrapper: null,
            
            fenceTarget: null,

            movingTarget: null,
        }

        this.blockList = {
            old: [],
            current: [],
        }

        this.__clock__ = undefined;
    }

    $mount(dom) {
        const wrapper = document.createElement('div');
        wrapper.setAttribute('style', 'position: relative;width: 100%;height: 100%;background-color: #fff;left:0;top:0');
        const iframe = document.createElement('iframe');
        iframe.setAttribute('style', "position: absolute;top:0;left: 0;transform-origin: top left;width: 100%;overflow: hidden;border-color: blue");
        iframe.setAttribute('scrolling', "no");
        const overLayer = document.createElement('div');
        overLayer.setAttribute('style', "transform-origin: top left;position: absolute;top:0;left: 0;box-sizing: border-box;user-select: none;");
        dom.setAttribute("style", "position: relative;background-color: #fff;overflow: hidden");
        const mask = document.createElement('div');
        mask.setAttribute('style', 'position: absolute;top: -10px;bottom:-10px;left:-10px;right:-10px;');
        const fence = document.createElement('div');
        fence.setAttribute('class', 'jframe-fence');
        overLayer.appendChild(fence);
        overLayer.appendChild(mask);
        wrapper.appendChild(iframe);
        wrapper.appendChild(overLayer); 
        if(this.hoverIndicator) {
            this.hoverIndicator.style.display = 'none';
            overLayer.appendChild(this.hoverIndicator);
        }

        if(this.focusIndicator) {
            this.focusIndicator.style.display = 'none';
            overLayer.appendChild(this.focusIndicator);
        }
        dom.appendChild(wrapper);

        this.iframe = iframe;
        this.overLayer = overLayer;
        this.dom = dom;
        this.fence = fence;

        // const messager = new Messager(iframe)
        // resize的时候需要重算
        this.calculateDomMeta();
        // const { x, y } = dom.getBoundingClientRect();
        wrapper.addEventListener('wheel', (event) => {
            event.preventDefault();
            let { deltaX, deltaY } = event
            const { offsetX, offsetY } = this.resolveEventOffset(event);
            if(event.ctrlKey) { 
                deltaY = -deltaY;
                this.zoomHandler(offsetX, offsetY, deltaX, deltaY, event);
            } else {
                this.panHandler(-deltaX, -deltaY, event);
            }
        })

        // wrapper.addEventListener('mousemove', (event) => {
        //     this.blockList.current.
        // })

        this.dom.addEventListener('click', e => {
            // e.stopPropagation();
            console.log(e);
            this.setFocusTarget(null);
        });
        /* let dragging;
        this.dom.addEventListener('mousemove', e => {
            const { offsetX, offsetY } = this.resolveEventOffset(e);
            // console.log(offsetX, offsetY);
            const point = this.calculateToIframeCoordinate(offsetX, offsetY);
            let blockMax = null;
            let clevel = 0;
            console.log(point)
            this.blockList.current.forEach(b => {
                const hit = b.isHit(point);
                if(hit && clevel <= b._level ) {
                    blockMax = b;
                    clevel = b._level;
                }
            });
            if(dragging) {
                dragging.setDragging(false);
            }
            if(blockMax) {
                const isInnerHitted = blockMax.isHitInner(point);
                const hasslot = this.dataElemDescription.hasSlot(blockMax.source);
                const wrapperSource = this.dataElemDescription.getSourceParent(blockMax.source);
                if(hasslot && isInnerHitted || !wrapperSource) {
                    blockMax.setDragging(true);
                    dragging = blockMax;
                } else {             
                    const wrapperBlock = this.source_block_element_map.getBlockBySource(wrapperSource);
                    wrapperBlock.setDragging(true);
                    dragging = wrapperBlock;
                }
            }
        }) */

        this.dom.addEventListener('dragover', e => {
            e.preventDefault();
            const { offsetX, offsetY } = this.resolveEventOffset(e);
            const point = this.calculateToIframeCoordinate(offsetX, offsetY);
            let blockMax = null;
            let clevel = 0;
            this.blockList.current.forEach(b => {
                const hit = b.isHit(point);
                if(hit && clevel <= b._level ) {
                    blockMax = b;
                    clevel = b._level;
                }
            });
            if(blockMax) {
                const isInnerHitted = blockMax.isHitInner(point);
                // console.log(point, blockMax.x, blockMax.y, blockMax.width)
                console.log(blockMax.id);
                const hasslot = this.dataElemDescription.hasSlot(blockMax.source);
                const wrapperSource = this.dataElemDescription.getSourceParent(blockMax.source);
                if(hasslot && isInnerHitted || !wrapperSource) {
                    // console.log(blockMax)
                    this.setDragoverWrapperTarget(blockMax);
                    this.renderChildClosestFence(point, blockMax);
                } else {
                    const wrapperBlock = this.source_block_element_map.getBlockBySource(wrapperSource);
                    this.setDragoverWrapperTarget(wrapperBlock);
                    this.renderClosestFence(point, blockMax, wrapperSource);
                } 
            } else {
                this.setDragoverWrapperTarget(null);
                this.hideClosestFence();
            }
        });

        this.dom.addEventListener('drop' , event => {
            // const payload = this.consumeMessage();
            // const instance = payload.instance;
            if(this.fenceTarget) {
                const {
                    source,
                    childIdx
                } = this.fenceTarget;
                console.log(this.getMovingTarget());
                const target = this.getMovingTarget();

                if(target) {
                    target.setDragging(false);
                }
                this.dispatchEvent(new JFrameEvent('elementdrop', {
                    event,
                    // instance,
                    target: target?.source,
                    jframe: this,
                    source,
                    childIdx
                }));
            }

            this.fenceTarget = null;
            this.setDragoverWrapperTarget(null);
            this.hideClosestFence();
            this.setMovingTarget(null);
          
        })


        // dom.addEventListener('click', (event) => {
        //     event.preventDefault();
        //     const { offsetX, offsetY } = this.resolveEventOffset(event);
        //     const point = this.calculateToIframeCoordinate(offsetX, offsetY);
        //     const message = JSON.stringify({
        //         event: 'click',
        //         point,
        //     })
        //     this.iframe.contentWindow.postMessage(message, this.frameURL);
        // })

        iframe.onload = (event) => {
            this.resizeObserver();
            const resetFrameBounding = new ResizeObserver(this.scheduleObserver.bind(this));
            resetFrameBounding.observe(this.iframe.contentWindow.document.body)
            
            this.dispatchEvent(new JFrameEvent('frameloaded', {
                event,
                target: this.iframe,
            }))
        }
        iframe.setAttribute("src", this.frameURL);
    }

    calculateDomMeta() {
        const meta = this.dom.getBoundingClientRect();
        this.domMeta = { x: meta.x, y: meta.y };
    }

    scheduleObserver(callback) {
        requestAnimationFrame((timestamp) => {
            const isFirstTime = this.__clock__ !== timestamp
            if(isFirstTime) {
                this.resizeObserver();
            }
            if(callback) {
                callback(timestamp);
            }
            this.__clock__ = timestamp;
        })
    }

    resizeObserver(){
        const innerDoc = this.iframe.contentWindow.document;
        const body = innerDoc.body;
        const html = innerDoc.documentElement;
        const height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
        const width = Math.max(body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth);

        this.iframe.style.height = height + 'px';
        this.iframe.style.width = width + 'px';
        this.overLayer.style.height = height + 'px';
        this.overLayer.style.width = width +'px';
        this.frameBoundingRect = { width, height }
        
        // this.resolve(this.blockList)
        this.blockList.old = this.blockList.current;
        this.blockList.current = []
        this.reflowBlocks(this);
        this.resortBlock()
       
        console.log('resizeObserver');
    }

    reflowBlocks() {
        const { 
            getRoot,
            bindElement,
            getSourceChildren,
        } = this.dataElemDescription;
        const root = getRoot();
        // 广度优先？
        const render = (e, level = 0) => {
            const elem = bindElement(this, e);
            let nextLevel = level + 1;
            if(elem) {
                this.renderBlock(e, elem, nextLevel);
            }
            const children = getSourceChildren(e);
            if(children && children.length) {
                children.forEach(c => {               
                    render(c, nextLevel);
                })
            }
        }
        
        render(root)
    }

    
    renderBlock(source, elem, level) {   
        this.source_block_element_map.setElementBySource(source, elem);
        let block = this.source_block_element_map.getBlockBySource(source);
        if(!block) {
            block = new Block(source, this, document, this.overLayer);
            this.source_block_element_map.setBlockBySource(source, block);
            block.observe(elem, this.scheduleObserver.bind(this));
        }
        block.setLevel(level);
        block.setBounding(elem.getBoundingClientRect());
        this.blockList.current.push(block);
        // block.render();
    }

    resortBlock() {
        const { old, current } = this.blockList;
        const removed = old.filter(ob => !current.find(cb => ob.id === cb.id));
        removed.forEach(b => { b.destroy(); });
        this.blockList.current.forEach(b => { b.render(); });
    }

    resolveEventOffset(event) {
        const { clientX, clientY } = event
        const { x, y } = this.domMeta;
        const offsetX = clientX - x;
        const offsetY = clientY - y;
        return { offsetX, offsetY };
    }

    zoomHandler(offsetX, offsetY, deltaX, deltaY, event) {
        if(this._zooming) return;
        this._zooming = true;
        const oldscale = this.scale;
        let newScale = this.scale;
        const amount = deltaY > 0 ? 1.1 : 1 / 1.1;
        newScale *= amount;
        newScale = Math.min(this.maxZoom, Math.max(this.minZoom, newScale))
        const { x, y } = this.position;
        const r = newScale / oldscale;
        const px = offsetX - (offsetX - x) * r
        const py = offsetY - (offsetY - y) * r
        this.position.x = px;
        this.position.y = py;  
        this.scale = newScale;
        this._resetTransform();
        this._zooming = false;
    }
    panHandler(deltaX, deltaY) {
        if(this._panning) return;
        this._panning = true;
        this.position.x += deltaX;
        this.position.y += deltaY; 
        this._resetTransform();
        this._panning = false;
    }

    
    _resetTransform() {
        const { x, y } = this.position;
        const scale = this.scale;
        const transformCss = `matrix(${scale}, 0, 0, ${scale}, ${x}, ${y})`;
        this.iframe.style.transform = transformCss
        this.overLayer.style.transform = transformCss
    }

    calculateToIframeCoordinate(offsetX, offsetY) {
        const { x, y } = this.position;
        const scale = this.scale;
        return [(offsetX - x) / scale, (offsetY - y) / scale];
    }

    getRenderElement(selector) {
        return this.iframe.contentDocument.querySelector(selector);
    }

    postMessage(message) {
        this.iframe.contentWindow.postMessage(message, this.frameURL);
    }

    setHoverTarget(block) {
        console.log('setHoverTarget')
        this.state.hoverTarget = block;
        if(this.hoverIndicator) {
            this.hoverIndicator.style.display = 'block';
        }
        this.dispatchEvent(new JFrameEvent('elementHover', {
            target: block,
        }))
    }

    resetHoverTarget(block) {
        if(this.state.hoverTarget === block){
            this.state.hoverTarget = null;
            if(this.hoverIndicator) {
                this.hoverIndicator.style.display = 'none';
            }
            this.dispatchEvent(new JFrameEvent('elementHover', {
                target: null,
            }))
        }   
    }

    setFocusTarget(block) {
        if(this.state.focusTarget) {
            this.state.focusTarget.setFocus(false);
        }
        this.state.focusTarget = block;
        if(this.state.focusTarget) {
            this.state.focusTarget.setFocus(true);
        }
        if(this.focusIndicator) {
            this.focusIndicator.style.display = block ? 'block' : 'none';
        }
        this.dispatchEvent(new JFrameEvent('elementFocus', {
            target: block,
        }))
    }

    setDragoverWrapperTarget(block) {
        if(block === this.state.dragoverTargetWrapper) {
            return;
        }
        if(this.state.dragoverTargetWrapper) {
            this.state.dragoverTargetWrapper.setAcceptElem(false);
        }
        this.state.dragoverTargetWrapper = block;
        if(this.state.dragoverTargetWrapper) {
            this.state.dragoverTargetWrapper.setAcceptElem(true);
        }
    }

    renderChildClosestFence(point, block) {
        console.log('renderChildClosestFence');
        const children = this.dataElemDescription.getSourceChildren(block.source);
        const p = {x: point[0], y: point[1]};
        let dist = Infinity;
        let closestFence = null;
        let closestBlock = null;
        let direction = undefined;
        let childIdx = undefined;
        children.forEach((c, idx) => {
            const isBlock = this.dataElemDescription.blockElement(c);
            const childBlock = this.source_block_element_map.getBlockBySource(c);
            
            if(isBlock) {
                const [s1, s2] = childBlock.getHorizontalSegments();
                const d1 = distToSegmentSquared(p, s1[0], s1[1]);
                if(d1 < dist) {
                    dist = d1;
                    closestFence = s1[0];
                    direction = 'horizontal';
                    closestBlock = childBlock
                    childIdx = idx;
                }
                const d2 = distToSegmentSquared(p, s2[0], s2[1]);
                if(d2 < dist) {
                    dist = d2;
                    closestFence = s2[0];
                    direction = 'horizontal';
                    closestBlock = childBlock
                    childIdx = idx + 1
                }
            } else {
                const [s1, s2] = childBlock.getVerticalSegments();
                const d1 = distToSegmentSquared(p, s1[0], s1[1]);
                if(d1 < dist) {
                    dist = d1;
                    closestFence = s1[0];
                    direction = 'vertical';
                    closestBlock = childBlock
                    childIdx = idx
                }
                const d2 = distToSegmentSquared(p, s2[0], s2[1]);
                if(d2 < dist) {
                    dist = d2;
                    closestFence = s2[0];
                    direction = 'vertical';
                    closestBlock = childBlock
                    childIdx = idx + 1
                }
            }
        });
        // console.log(closestFence)
        if(!closestFence) {
            const isBlock = this.dataElemDescription.blockElement(block.source);
            const { x, y, width, height } = block;
            if(isBlock) {
                const yfence =  y + height/2
                this.renderHorizontalFence(x, yfence, width);
            } else {
                const xfence = x + width /2
                this.renderVerticalFence(xfence, y, height);
            }
            this.fenceTarget = {
                source: block.source,
                childIdx: 0,
            }
            return;
        }
        this.fenceTarget = {
            source: block.source,
            childIdx,
        }
        if(direction === 'horizontal') {
            const v = closestFence;
            this.renderHorizontalFence(v.x, v.y, closestBlock.width)
        } else {
            const v = closestFence;
            this.renderVerticalFence(v.x, v.y, closestBlock.height);
        }
    }

    renderClosestFence(point, block, wrapperSource) {
        console.log(block, wrapperSource);
        const children = this.dataElemDescription.getSourceChildren(wrapperSource);
        const source = block.source;
        const [px, py] = point;
        const isBlock = this.dataElemDescription.blockElement(source);
        const { x, y, width, height } = block;
        let offset = 0;
        if(isBlock) {
            const upper = Math.abs(py - y) < Math.abs(py - y - height);
            const yfence = upper ? y : (y+height);
            offset = upper ? 0 : 1
            console.log(x, yfence);
            this.renderHorizontalFence(x, yfence, width);
        } else {
            const left = Math.abs(px - x) < Math.abs(px - x - width);
            const xfence = left ? x : (x + width);
            offset = left ? 0 : 1
            this.renderVerticalFence(xfence, y, height);
        }
        this.fenceTarget = {
            source: wrapperSource,
            childIdx: children.findIndex(c => c === source) + offset,
        }
    }

    renderHorizontalFence(tx, ty, width) {
        this.fence.style.display = 'block';
        this.fence.style.transition = `width .3s, transform .3s`;
        this.fence.style.transform = `translate(${tx}px, ${ty}px)`;
        this.fence.style.height = '0px';
        this.fence.style.width = `${width}px`;
    }

    renderVerticalFence(tx, ty, height) {
        this.fence.style.display = 'block';
        this.fence.style.transition = `height .3s, transform .3s`;
        this.fence.style.transform = `translate(${tx}px, ${ty}px)`;
        this.fence.style.height = `${height}px`;
        this.fence.style.width = `0px`;
    }
    hideClosestFence() {
        this.fence.style.display = 'none';
    }

    setMovingTarget(block) {
        console.log('setMovingTarget', block)
        this.state.movingTarget = block;
    }

    getMovingTarget() {
        return this.state.movingTarget
    }
    
}

export default JFrame;