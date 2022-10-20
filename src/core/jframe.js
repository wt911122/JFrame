// import Messager from '../message/messager';
import JFrameEvent from './event/event';
import { distToSegmentSquared } from '../utils/functions';
import sourceBlockElememtMap from './sourceBlockElementMap';
import Block from './block';
import IFrameManager from './iframe-manager';
// import ScrollBarMixin from './mixins/scrollbarMixin';

class JFrame extends EventTarget {
    constructor(configs){
        super();
        this.frameURL = configs.frameURL;
        this.initialZoom = configs.initialZoom;
        this.padding = configs.padding || 20;
        this.maxZoom = configs.maxZoom || 2;
        this.minZoom = configs.minZoom || .5;
        this.dataElemDescription = configs.dataElemDescription;
        this.toolbox = configs.toolbox;
        // this.source = configs.source;

        // this.frameBoundingRect = { width: 0, height: 0 };
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

    $mount(dom, configs) {
        this.IFM = new IFrameManager(dom, configs);

        // const messager = new Messager(iframe)
        // resize的时候需要重算
        this.calculateDomMeta();
        // const { x, y } = dom.getBoundingClientRect();
        this.IFM.wrapper.addEventListener('wheel', (event) => {
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

        this.IFM.dom.addEventListener('click', e => {
            console.log(e);
            const overLayer = this.IFM.overLayer
            if(!e.path.includes(overLayer)) {
                this.setFocusTarget(null);
            }
            
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
        let lastBlock
        this.IFM.dom.addEventListener('dragover', e => {
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
            lastBlock && lastBlock.setHover(false);
            if(blockMax) {
                const isInnerHitted = blockMax.isHitInner(point);
                const hasslot = this.dataElemDescription.hasSlot(blockMax.source);
                const wrapperSource = this.dataElemDescription.getSourceParent(blockMax.source);
                if(hasslot && isInnerHitted || !wrapperSource) {
                    this.setDragoverWrapperTarget(blockMax);
                    this.renderChildClosestFence(point, blockMax);
                } else {
                    // const wrapperBlock = this.source_block_element_map.getBlockBySource(wrapperSource);
                    // this.setDragoverWrapperTarget(wrapperBlock);
                    // this.renderClosestFence(point, blockMax, wrapperSource);
                } 
                lastBlock = blockMax;
            } else {
                this.setDragoverWrapperTarget(null);
                this.IFM.hideClosestFence();
            }
        });

        this.IFM.dom.addEventListener('drop' , event => {
            if(this.fenceTarget) {
                const {
                    source,
                    childIdx,
                    accept
                } = this.fenceTarget;
                const target = this.getMovingTarget();

                // if(target) {
                //     target.setDragging(false);
                // }
                if(accept) {
                    this.dispatchEvent(new JFrameEvent('elementdrop', {
                        event,
                        // instance,
                        targetBlock: target,
                        target: target?.source,
                        jframe: this,
                        source,
                        childIdx
                    }));
                }
            }
            lastBlock.setHover(false);
            this.fenceTarget = null;
            this.setDragoverWrapperTarget(null);
            this.IFM.hideClosestFence();
            this.setMovingTarget(null);
        });
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

        this.IFM.iframe.onload = (event) => {
            
            // const resetFrameBounding = new ResizeObserver(this.scheduleObserver.bind(this));
            // resetFrameBounding.observe(rootElem);
            // this.resizeObserver();
            // this.IFM.resetFrameHorizontalBoundrary();
            const resetFrameBounding = new ResizeObserver(this.scheduleObserver.bind(this));
            resetFrameBounding.observe(this.IFM.iframe.contentWindow.document.body)
            
            
            this.dispatchEvent(new JFrameEvent('frameloaded', {
                event,
                target: this.iframe,
            }));

            this.addEventListener('afterResize', () => {
                const { 
                    getRoot,
                } = this.dataElemDescription;
                const root = getRoot();
                const rootBlock = this.source_block_element_map.getBlockBySource(root);
                const w = rootBlock.width;
                const h = rootBlock.height;
                const { width, height } = this.IFM.wrapper.getBoundingClientRect();
                const s1 = (width - 20) / w;
                const s2 = (height - 20) / h;
                if(s1 < s2) {
                    this.scale = s1;
                    this.position.x = 10;
                    this.position.y = (height - h * s1 + 20) / 2;
                } else {
                    this.scale = s2;
                    this.position.y = 10;
                    this.position.x = (width - w * s2 + 20) / 2;
                }
                
                this._resetTransform();
            }, {
                once: true,
            })
            
        }
        this.IFM.iframe.setAttribute("src", this.frameURL);
    }

    calculateDomMeta() {
        const meta = this.IFM.domClientRect;
        this.domMeta = { x: meta.x, y: meta.y };
    }

    scheduleObserver() {
        requestAnimationFrame((timestamp) => {
            const isFirstTime = this.__clock__ !== timestamp
            if(isFirstTime) {
                this.resizeObserver();
            }
            // console.log(callback)
            // if(callback) {
            //     callback(timestamp);
            // }
            this.__clock__ = timestamp;
        })
    }

    resizeObserver(){
        // this.IFM.resetFrameVerticalBoundrary();
        // this.IFM.resetFrameHorizontalBoundrary();
        // this.resolve(this.blockList)
        
        this.reflowIFM();
        this.blockList.old = this.blockList.current;
        this.blockList.current = []
        this.reflowBlocks(this);
        this.resortBlock()
        this.dispatchEvent(new JFrameEvent('afterResize'))

        this.refreshTools();
        console.log('resizeObserver');
    }

    reflowIFM() {
        if(!this.IFM._observer) {
            const { 
                getRoot,
                bindElement,
            } = this.dataElemDescription;
            const root = getRoot();
            const rootElem = bindElement(this, root);
            if(rootElem) {
                this.IFM.observe(rootElem)
            }
        }

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
            block = new Block(source, this, document, this.IFM.overLayer);
            this.source_block_element_map.setBlockBySource(source, block);
            block.observe(elem, this.scheduleObserver.bind(this));
            if(this.toolbox && this.toolbox.tools) {
                this.toolbox.tools.forEach(tool => {
                    const t = tool.blockRenderer && tool.blockRenderer(block);
                    if(t) {
                        block.registTool(t);
                    }
                })
            }
        }
        block.setLevel(level);
        const stylesheet = window.getComputedStyle(elem);
        block.setBounding(elem.getBoundingClientRect());
        block.setStyle(stylesheet);
        this.blockList.current.push(block);
        // block.render();
    }

    resortBlock() {
        const { old, current } = this.blockList;
        const removed = old.filter(ob => !current.find(cb => ob.id === cb.id));
        removed.forEach(b => { b.destroy(); });
        this.blockList.current.forEach(b => { 
            b.render();
        });
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
        this.IFM.iframe.style.transform = transformCss
        this.IFM.overLayer.style.transform = transformCss
    }

    calculateToIframeCoordinate(offsetX, offsetY) {
        const { x, y } = this.position;
        const scale = this.scale;
        return [(offsetX - x) / scale, (offsetY - y) / scale];
    }

    getRenderElement(selector) {
        return this.IFM.querySelector(selector);
    }

    postMessage(message) {
        this.IFM.postMessage(message, this.frameURL);
    }

    toggleOverLayer() {
        this.IFM.toggleOverLayer(this._ovstatus);
        this._ovstatus = !this._ovstatus;
    }
    
   /* setResizingTarget(block, clientX, clientY) {
        Object.assign(this.state.resizeMeta, {
            target: block,
            lastX: clientX, 
            lastY: clientY,
        })
        const elem = this.source_block_element_map.getElementBySource(block.source);
        let processing = false;
        const f = (e => {
            console.log('processing', processing);
            if(processing){
                return;
            }
            processing = true;
            const { clientX, clientY } = e;
            const {
                lastX, lastY, target,
            } = this.state.resizeMeta;
            const deltaX = (clientX - lastX) * this.scale;
            const deltaY = (clientY - lastY) * this.scale;
            this.dispatchEvent(new JFrameEvent('elementResizing', {
                block: target,
                source: target?.source,
                deltaX,
                deltaY
            }))
            const elbounds = elem.getBoundingClientRect();
            console.log(elbounds)
            const currWidth = elbounds.width + deltaX;
            const currHeight = elbounds.height + deltaY;
            elem.style.width = `${elbounds.width + deltaX}px`;
            elem.style.height = `${elbounds.height + deltaY}px`;
            Object.assign(this.state.resizeMeta, {
                lastX: clientX,
                lastY: clientY,
                currWidth,
                currHeight 
            })
            processing = false;
        }).bind(this);

        document.addEventListener('pointermove', f);
        document.addEventListener('pointerup', event => {
            console.log('pointerup');
            const { currWidth, currHeight, target } = this.state.resizeMeta;
            Object.assign(this.state.resizeMeta, {
                target: null,
                lastX: undefined,
                lastY: undefined
            })
            document.removeEventListener('pointermove', f);
            this.dispatchEvent(new JFrameEvent('elementResized', {
                source: target?.source,
                width: currWidth,
                height: currHeight,
            }))
        }, {
            once: true
        })
    }*/

    setHoverTarget(block) {
        console.log('setHoverTarget')
        this.state.hoverTarget = block;
        // if(this.hoverIndicator) {
        //     this.hoverIndicator.style.display = 'block';
        // }
        this.dispatchEvent(new JFrameEvent('elementHover', {
            target: block,
        }))
    }

    resetHoverTarget(block) {
        if(this.state.hoverTarget === block){
            this.state.hoverTarget = null;
            // if(this.hoverIndicator) {
            //     this.hoverIndicator.style.display = 'none';
            // }
            this.dispatchEvent(new JFrameEvent('elementHover', {
                target: null,
            }))
        }   
    }

    setFocusTarget(block) {
        this.toolbox.tools.forEach(tool => {
            tool.destroy();
        })
        if(this.state.focusTarget && this.state.focusTarget !== block) {
            this.state.focusTarget.setFocus(false);
        }
        this.state.focusTarget = block;
        if(this.state.focusTarget) {
            this.state.focusTarget.setFocus(true);
        }
        if(this.toolbox && this.toolbox.tools) {
            if(block) {
                // const { x, y, width, height } = block;
                this.IFM.toggleTools(true, block)
                this.toolbox.tools.forEach(tool => {
                    tool.renderToolbox(block, el => { this.IFM.toolbox.appendChild(el) });
                    tool.renderBlockTool(block, el => { this.IFM.blockTool.appendChild(el)});
                })
            } else {
                this.IFM.toggleTools(false, this.state.focusTarget);
            }
        }
        // if(this.focusIndicator) {
        //     this.focusIndicator.style.display = block ? 'block' : 'none';
        // }
        this.dispatchEvent(new JFrameEvent('elementFocus', {
            target: block,
        }))
    }

    refreshTools() {
        if(this.state.focusTarget) {
            this.IFM.refreshToolWrapper(this.state.focusTarget)
            this.toolbox.tools.forEach(tool => {
                if(tool.refresh) {
                    tool.refresh(this.state.focusTarget);
                }
            })
        }
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
        const isEmpty = children.length === 0;
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
        const accept = this.dataElemDescription.isAcceptElement(this.state.movingTarget?.source, block.source)
        if(accept) { 
            if(isEmpty) {
                block.setHover(true);
                this.fenceTarget = {
                    source: block.source,
                    childIdx: 0,
                    accept,
                }
            } else {
                this.IFM.setFenceAccept(accept);
                if(!closestFence) {
                    const isBlock = this.dataElemDescription.blockElement(block.source);
                    const { x, y, width, height } = block;
                    if(isBlock) {
                        const yfence =  y + height/2
                        this.IFM.renderHorizontalFence(x, yfence, width);
                    } else {
                        const xfence = x + width /2
                        this.IFM.renderVerticalFence(xfence, y, height);
                    }
                    
                    this.fenceTarget = {
                        source: block.source,
                        childIdx: 0,
                        accept,
                    }
                    return;
                }
                this.fenceTarget = {
                    source: block.source,
                    childIdx,
                    accept
                }
                if(direction === 'horizontal') {
                    const v = closestFence;
                    this.IFM.renderHorizontalFence(v.x, v.y, closestBlock.width)
                } else {
                    const v = closestFence;
                    this.IFM.renderVerticalFence(v.x, v.y, closestBlock.height);
                } 
            }
        }
       
    }

    renderClosestFence(point, block, wrapperSource) {
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
            this.IFM.renderHorizontalFence(x, yfence, width);
        } else {
            const left = Math.abs(px - x) < Math.abs(px - x - width);
            const xfence = left ? x : (x + width);
            offset = left ? 0 : 1
            this.IFM.renderVerticalFence(xfence, y, height);
        }
        const accept = this.dataElemDescription.isAcceptElement(this.state.movingTarget?.source, wrapperSource)
        this.IFM.setFenceAccept(accept);
        this.fenceTarget = {
            source: wrapperSource,
            childIdx: children.findIndex(c => c === source) + offset,
            accept,
        }
    }


    setMovingTarget(block) {
        console.log('setMovingTarget', block)
        this.state.movingTarget = block;
    }

    getMovingTarget() {
        return this.state.movingTarget
    }

    // splitElement(target, dir) {
    //     this.dispatchEvent(new JFrameEvent('elementSplit', {
    //         block: target,
    //         source: target?.source,
    //         dir,
    //     }))
    // }

    bindDragdropListener(elem, pointerdown, pointermove, pointerup) {
        const resizeMeta = {
            lastX: undefined,
            lastY: undefined
        };
        elem.addEventListener('pointerdown', e => {
            e.preventDefault();
            e.stopPropagation();
            const { clientX, clientY } = e;
    
            Object.assign(resizeMeta, {
                lastX: clientX, 
                lastY: clientY,
            });
            const _args = pointerdown() || [];
            let processing = false;
            const f = (e => {
                if(processing){
                    return;
                }
                processing = true;
                const { clientX, clientY } = e;
                const {
                    lastX, lastY, 
                } = resizeMeta;
                const deltaX = (clientX - lastX) / this.scale;
                const deltaY = (clientY - lastY) / this.scale;
                const { offsetX, offsetY } = this.resolveEventOffset(e);
                const point = this.calculateToIframeCoordinate(offsetX, offsetY);
                pointermove(deltaX, deltaY, point, ..._args);
                Object.assign(resizeMeta, {
                    lastX: clientX,
                    lastY: clientY,
                })
                processing = false;
            });
            document.addEventListener('pointermove', f);
            document.addEventListener('pointerup', (e) => {
                Object.assign(resizeMeta, {
                    lastX: undefined,
                    lastY: undefined
                })
                document.removeEventListener('pointermove', f);
                pointerup(e, ..._args);
            }, {
                once: true
            })
        })
    }
    
}

// Object.assign(JFrame.prototype, ScrollBarMixin);

export default JFrame;

export * from './toolbox/index';