// import Messager from '../message/messager';
import JFrameEvent from './event';
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
        this.simulatorWidth = configs.simulatorWidth;
        this.simulatorHeight = configs.simulatorHeight;
        this.worldMargin = configs.worldMargin || 10000;
        this.dataElemDescription = configs.dataElemDescription;
        this.toolbox = configs.toolbox;
        // this.source = configs.source;

        // this.frameBoundingRect = { width: 0, height: 0 };
        this.position = { x: 0, y: 0 };
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
        this.IFM.resetFrameHorizontalBoundrary(this.simulatorWidth);
        this.IFM.resetFrameVerticalBoundrary(this.simulatorHeight);
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
            
            if(!overLayer.contains(e.target)) {
                this.setFocusTarget(null);
            }
            
        });
       
        this.IFM.iframe.onload = (event) => {
            
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
                const s2 = (height - 60) / h;
                if(s1 < s2) {
                    this.scale = s1;
                    this.position.x = 30;
                    this.position.y = (height - h * s1 + 60) / 2;
                } else {
                    this.scale = s2;
                    this.position.y = 30;
                    this.position.x = (width - w * s2 + 60) / 2;
                }
                
                this._resetTransform();
            }, {
                once: true,
            })
            
        }
        this.IFM.iframe.setAttribute("src", this.frameURL);
        this.IFM.dom.addEventListener("dragover", (event) => {
            // prevent default to allow drop
            event.preventDefault();
          });
        this.IFM.dom.addEventListener('drop' , e => {
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
                this.dispatchEvent(new JFrameEvent('drop', {
                    target: blockMax,
                    point,
                }))
            } else {
                // this.setDragoverWrapperTarget(null);
            }
        });
    }

    calculateDomMeta() {
        const meta = this.IFM.domClientRect;
        this.domMeta = { x: meta.x, y: meta.y };
    }

    scheduleObserver() {
        console.log('scheduleObserver')
        requestAnimationFrame((timestamp) => {
            const isFirstTime = this.__clock__ !== timestamp
            if(isFirstTime) {
                this.resizeObserver();
            }
            this.__clock__ = timestamp;
        })
    }

    resizeObserver(){

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
            // if(rootElem) {
                // this.IFM.observe(rootElem)
            // }
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
        this.calculateDomMeta();
        const { x, y } = this.domMeta;
        const offsetX = clientX - x;
        const offsetY = clientY - y;
        return { offsetX, offsetY };
    }

    zoomHandler(offsetX, offsetY, deltaX, deltaY, event) {
        if(this._zooming) return;
        this._zooming = true;
        const oldscale = this.scale;
        let minZoom = this.minZoom
        if(this.worldMargin) {
            const m = this.worldMargin;
            const { rootWidth, rootHeight, frameWidth, frameHeight } = this.IFM;
            const maxWidth = rootWidth + m * 2;
            const maxHeight = rootHeight + m * 2;
            minZoom = Math.max(minZoom, Math.max(frameWidth / maxWidth, frameHeight / maxHeight));
        }
        let newScale = this.scale;
        const amount = deltaY > 0 ? 1.1 : 1 / 1.1;
        newScale *= amount;
        newScale = Math.min(this.maxZoom, Math.max(minZoom, newScale))
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
        if(this.worldMargin) {
            // console.log(scale)
            const { rootWidth, rootHeight, frameWidth, frameHeight } = this.IFM;
            // console.log(this.position.offsetX)
            const m = this.worldMargin
            const s = this.scale

            let maxX;
            let maxY;
            let minX;
            let minY;

            maxX = m * s;
            minX = frameWidth - (rootWidth + m)*s;

            minY = frameHeight - (rootHeight + m)*s;
            maxY = m * s;
      
            this.position.x = Math.max(Math.min(this.position.x + deltaX, maxX), minX);
            this.position.y = Math.max(Math.min(this.position.y + deltaY, maxY), minY); 
        } else {
            this.position.x += deltaX;
            this.position.y += deltaY; 
        }
        this._resetTransform();
        this._panning = false;
    }

    
    _resetTransform() {
        const { x, y } = this.position;
        const scale = this.scale;
        const transformCss = `matrix(${scale}, 0, 0, ${scale}, ${x}, ${y})`;
        this.IFM.iframe.style.transform = transformCss
        this.IFM.overLayer.style.transform = transformCss

        const r = document.querySelector(':root');
        r.style.setProperty('--jframeGlobalScale', scale);
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
    setHoverTarget(block) {
        console.log('setHoverTarget')
        this.state.hoverTarget = block;
        this.dispatchEvent(new JFrameEvent('elementHover', {
            target: block,
        }))
    }

    resetHoverTarget(block) {
        if(this.state.hoverTarget === block){
            this.state.hoverTarget = null;
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

    setMovingTarget(block) {
        console.log('setMovingTarget', block)
        this.state.movingTarget = block;
    }

    getMovingTarget() {
        return this.state.movingTarget
    }

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