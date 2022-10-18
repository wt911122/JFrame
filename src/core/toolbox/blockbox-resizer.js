import Tool from './tool'
import JFrameEvent from '../event/event';
class BlockBoxResizer extends Tool {
    constructor(configs) {
        super();
        this.accept = configs.accept;
        // this.targetBlock = undefined;
        this.resizeMeta =  {
            lastX: undefined,
            lastY: undefined
        };
    }

    renderBlockTool(targetBlock, appendChild) {
        if(this.accept(targetBlock)) {
            const resizer = document.createElement('div');
            const { width, height, jframe, source } = targetBlock;
            const parentSource = jframe.dataElemDescription.getSourceParent(source);
            const parentBlock = jframe.source_block_element_map.getBlockBySource(parentSource);
            resizer.setAttribute('class', 'jframe-block-resizer');
            resizer.style.transform = `translate(${width - 5}px, ${height-5}px)`;
            resizer.addEventListener('pointerdown', e => {
                e.preventDefault();
                e.stopPropagation();
                const { clientX, clientY } = e;
                

                const jframe = targetBlock.jframe;
                const targetSource = targetBlock.source;
                const elem = jframe.source_block_element_map.getElementBySource(targetSource);
                const elbounds = elem.getBoundingClientRect();
                Object.assign(this.resizeMeta, {
                    lastX: clientX, 
                    lastY: clientY,
                    currWidth: elbounds.width,
                    currHeight: elbounds.height,
                });
                let processing = false;
                const minmaxWidth = (num) => {
                    return Math.max(Math.min(num, parentBlock.width), 0)
                }
                const minmaxHeight = (num) => {
                    return Math.max(Math.min(num, parentBlock.height), 0)
                }
                jframe.IFM.toggleBlockHoverStyle(true);
                const f = (e => {
                    if(processing){
                        return;
                    }
                    processing = true;
                    const { clientX, clientY } = e;
                    let {
                        lastX, lastY,
                        currWidth, currHeight,
                    } = this.resizeMeta;
                    const deltaX = (clientX - lastX) / jframe.scale;
                    const deltaY = (clientY - lastY) / jframe.scale;
                    jframe.dispatchEvent(new JFrameEvent('elementResizing', {
                        block: targetBlock,
                        source: targetBlock?.source,
                        deltaX,
                        deltaY
                    }))
                    
                    currWidth += deltaX;
                    currHeight += deltaY;
                    console.log(currWidth, currHeight)
                    elem.style.width = `${minmaxWidth(currWidth)}px`;
                    elem.style.height = `${minmaxHeight(currHeight)}px`;
                    Object.assign(this.resizeMeta, {
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
                    // const { currWidth, currHeight } = this.resizeMeta;
                    Object.assign(this.resizeMeta, {
                        lastX: undefined,
                        lastY: undefined
                    })
                    jframe.IFM.toggleBlockHoverStyle(false);
                    document.removeEventListener('pointermove', f);
                    jframe.dispatchEvent(new JFrameEvent('elementsResized', {
                        elements: [
                            {
                                targetBlock: targetBlock,
                                source: targetBlock?.source,
                                width: elem.style.width,
                                height: elem.style.height,
                            }
                        ]
                    }))
                }, {
                    once: true
                })
            });

            appendChild(resizer);
            this.el = resizer;
        }
    } 

    refresh(targetBlock) {
        if(this.accept(targetBlock)) {
            const { width, height } = targetBlock;
            this.el.style.transform = `translate(${width - 5}px, ${height-5}px)`;
        }
    }
}

export default BlockBoxResizer;