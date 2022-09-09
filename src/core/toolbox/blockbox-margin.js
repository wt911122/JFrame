import Tool from './tool'
import JFrameEvent from '../event/event';
const ELEMENT_KEYS = [
    'marginBarLeft',
    'marginBarRight',
    'marginBarTop',
    'marginBarBottom',
    'marginBarRectLeft',
    'marginBarRectRight',
    'marginBarRectTop',
    'marginBarRectBottom',
]
class BlockBoxMargin extends Tool {
    constructor(configs) {
        super();
        this.accept = configs.accept;
        // this.targetBlock = undefined;
        this.resizeMeta =  {
            lastX: undefined,
            lastY: undefined
        };
    }

    renderMarginBar(targetBlock) {
        const { width, height, jframe, source: targetSource } = targetBlock;
        const elem = jframe.source_block_element_map.getElementBySource(targetSource);
        const styleSheet = window.getComputedStyle(elem);

        const marginBarLeft = document.createElement('div');
        marginBarLeft.setAttribute('class', 'jframe-block-margin jframe-block-margin-horizontal');
        jframe.dragdropListener(marginBar, () => {
            this.resizeMeta.marginLeft = parseFloat(styleSheet.marginLeft);
        }, (deltaX, deltaY) => {
            const elbounds = elem.getBoundingClientRect();
            const marginLeft = this.resizeMeta.marginLeft;
            marginLeft += deltaX;
            elem.style.width = `${elbounds.width - deltaX}px`;
            elem.style.marginLeft = `${marginLeft}px`;
            this.resizeMeta.marginLeft = marginLeft;
        }, () => {
            jframe.dispatchEvent(new JFrameEvent('elementsResized', {
                elements: [
                    {
                        targetBlock: targetBlock,
                        source: targetBlock?.source,
                        width: elem.style.width,
                        height: elem.style.height,
                        marginLeft: elem.style.marginLeft
                    }
                ]
            }))
        })
       
       
    }

    renderMarginBarRect() {
        const marginBarRect = document.createElement('div');
        marginBarRect.setAttribute('class', 'jframe-block-margin-rect');
        const marginBarContent = document.createElement('div');
        marginBarContent.setAttribute('class', 'jframe-block-margin-rect-content');
        marginBarRect.appendChild(marginBarContent);
        return {
            marginBarRect,
            marginBarContent
        }
    }

    renderBlockTool(targetBlock, appendChild) {
        if(this.accept(targetBlock)) {
            const { width, height, jframe, source: targetSource } = targetBlock;
            const elem = jframe.source_block_element_map.getElementBySource(targetSource);
            

            const marginBarLeft = document.createElement('div');
            marginBarLeft.setAttribute('class', 'jframe-block-margin jframe-block-margin-horizontal');
            Object.assign(marginBarLeft.style, {
                left: 0,
                top: height / 2 + 'px',
                cursor: 'e-resize'
            })

            const {
                marginBarRect: marginBarRectLeft,
                marginBarContent: marginBarRectLeftContent,
            } = this.renderMarginBarRect();
            const {
                marginBarRect: marginBarRectRight,
                marginBarContent: marginBarRectRightContent,
            } = this.renderMarginBarRect();
            const {
                marginBarRect: marginBarRectTop,
                marginBarContent: marginBarRectTopContent,
            } = this.renderMarginBarRect();
            const {
                marginBarRect: marginBarRectBottom,
                marginBarContent: marginBarRectBottomContent,
            } = this.renderMarginBarRect();

            const marginBarRight = document.createElement('div');
            marginBarRight.setAttribute('class', 'jframe-block-margin jframe-block-margin-horizontal');
            Object.assign(marginBarRight.style, {
                left: width - 5 + 'px',
                top: height / 2 + 'px',
                cursor: 'w-resize'
            })

            const marginBarTop = document.createElement('div');
            marginBarTop.setAttribute('class', 'jframe-block-margin jframe-block-margin-vertical');
            Object.assign(marginBarTop.style, {
                left: width / 2 + 'px',
                top: 0,
                cursor: 'n-resize'
            })

            const marginBarBottom = document.createElement('div');
            marginBarBottom.setAttribute('class', 'jframe-block-margin jframe-block-margin-vertical');
            Object.assign(marginBarBottom.style, {
                left: width / 2 + 'px',
                top: height - 5 + 'px',
                cursor: 's-resize'
            })
            let processing = false;
            const dispatcher = () => {
                jframe.dispatchEvent(new JFrameEvent('elementsResized', {
                    elements: [
                        {
                            targetBlock: targetBlock,
                            source: targetBlock?.source,
                            width: elem.style.width,
                            height: elem.style.height,
                            marginLeft: elem.style.marginLeft,
                            marginRight: elem.style.marginRight,
                            marginTop: elem.style.marginTop,
                            marginBottom: elem.style.marginBottom
                        }
                    ]
                }))
                marginBarRectLeft.removeAttribute('visible')
                marginBarRectRight.removeAttribute('visible')
                marginBarRectTop.removeAttribute('visible')
                marginBarRectBottom.removeAttribute('visible')
                processing = false;
            }
            const styleSheet = window.getComputedStyle(elem);
            let marginLeft = parseFloat(styleSheet.marginLeft) || 0;
            let marginRight = parseFloat(styleSheet.marginRight) || 0;
            let marginTop = parseFloat(styleSheet.marginTop) || 0;
            let marginBottom = parseFloat(styleSheet.marginBottom) || 0;
            let wholeHeight = marginTop + marginBottom + targetBlock.height;
            let wholeWidth = marginLeft + marginRight + targetBlock.width;
            
            
            jframe.bindDragdropListener(marginBarLeft, () => {
                const styleSheet = window.getComputedStyle(elem);
                marginLeft = parseFloat(styleSheet.marginLeft) || 0;
                marginRight = parseFloat(styleSheet.marginRight) || 0;
                wholeWidth = marginLeft + marginRight + targetBlock.width;

                Object.assign(marginBarRectLeft.style, {
                    left: -marginLeft + 'px',
                    top: -marginTop + 'px',
                    width: marginLeft + 'px',
                    height: wholeHeight + 'px'
                });
                marginBarRectLeft.setAttribute('visible', true)
                marginBarRectLeftContent.innerText = Math.round(marginLeft) + 'px';
            }, (deltaX, deltaY) => {
                processing = true;
                // const elbounds = elem.getBoundingClientRect();
                marginLeft = Math.max(0, Math.min(deltaX + marginLeft, wholeWidth - marginRight));
                elem.style.width = `${wholeWidth - marginLeft - marginRight}px`;
                elem.style.marginLeft = `${marginLeft}px`;

                Object.assign(marginBarRectLeft.style, {
                    left: -marginLeft + 'px',
                    width: marginLeft + 'px',
                })
                marginBarRectLeftContent.innerText = Math.round(marginLeft) + 'px';
            }, dispatcher);

            jframe.bindDragdropListener(marginBarRight, () => {
                const styleSheet = window.getComputedStyle(elem);
                marginLeft = parseFloat(styleSheet.marginLeft) || 0;
                marginRight = parseFloat(styleSheet.marginRight) || 0;
                wholeWidth = marginLeft + marginRight + targetBlock.width;

                Object.assign(marginBarRectRight.style, {
                    left: targetBlock.width + 'px',
                    top: -marginTop + 'px',
                    width: marginRight + 'px',
                    height: wholeHeight + 'px'
                })
                marginBarRectRight.setAttribute('visible', true);
                marginBarRectRightContent.innerText = Math.round(marginRight) + 'px';
            }, (deltaX, deltaY) => {
                processing = true;
                // const elbounds = elem.getBoundingClientRect();
                marginRight = Math.max(0, Math.min(-deltaX + marginRight, wholeWidth - marginLeft));
                elem.style.width = `${wholeWidth - marginLeft - marginRight}px`;
                elem.style.marginRight = `${marginRight}px`;
                Object.assign(marginBarRectRight.style, {
                    left: targetBlock.width + 'px',
                    width: marginRight + 'px',
                })
                marginBarRectRightContent.innerText = Math.round(marginRight) + 'px';
            }, dispatcher);

            jframe.bindDragdropListener(marginBarTop, () => {
                const styleSheet = window.getComputedStyle(elem);
                marginTop = parseFloat(styleSheet.marginTop) || 0;
                marginBottom = parseFloat(styleSheet.marginBottom) || 0;
                wholeHeight = marginTop + marginBottom + targetBlock.height;

                Object.assign(marginBarRectTop.style, {
                    left: -marginLeft + 'px',
                    top: -marginTop + 'px',
                    width: wholeWidth + 'px',
                    height: marginTop + 'px'
                })
                marginBarRectTop.setAttribute('visible', true)
                
                marginBarRectTopContent.innerText = Math.round(marginTop) + 'px';
            }, (deltaX, deltaY) => {
                processing = true;
                marginTop = Math.max(0, Math.min(deltaY + marginTop, wholeHeight - marginBottom));
                elem.style.height = `${wholeHeight - marginTop - marginBottom}px`;
                elem.style.marginTop = `${marginTop}px`;
                Object.assign(marginBarRectTop.style, {
                    top: -marginTop + 'px',
                    height: marginTop + 'px'
                })
                marginBarRectTopContent.innerText = Math.round(marginTop) + 'px';
            }, dispatcher);

            jframe.bindDragdropListener(marginBarBottom, () => {
                const styleSheet = window.getComputedStyle(elem);
                marginTop = parseFloat(styleSheet.marginTop) || 0;
                marginBottom = parseFloat(styleSheet.marginBottom) || 0;
                wholeHeight = marginTop + marginBottom + targetBlock.height;
                Object.assign(marginBarRectBottom.style, {
                    left: -marginLeft + 'px',
                    top: targetBlock.height + 'px',
                    width: wholeWidth + 'px',
                    height: marginBottom + 'px'
                })
                marginBarRectBottom.setAttribute('visible', true)
                marginBarRectBottomContent.innerText = Math.round(marginBottom) + 'px';
            }, (deltaX, deltaY) => {
                processing = true;
                marginBottom = Math.max(0, Math.min(marginBottom - deltaY, wholeHeight - marginTop));
                elem.style.height = `${wholeHeight - marginTop - marginBottom}px`;
                elem.style.marginBottom = `${marginBottom}px`;

                Object.assign(marginBarRectBottom.style, {
                    top: targetBlock.height + 'px',
                    height: marginBottom + 'px'
                })
                marginBarRectBottomContent.innerText = Math.round(marginBottom) + 'px';
            }, dispatcher);
            
            function addHoverToMarginRect(rect, callback) {
                rect.addEventListener('mouseenter', () => {
                    if(processing) return
                    callback();
                });
                rect.addEventListener('mouseleave', () => {
                    if(processing) return
                    marginBarRectLeft.removeAttribute('visible')
                    marginBarRectRight.removeAttribute('visible')
                    marginBarRectTop.removeAttribute('visible')
                    marginBarRectBottom.removeAttribute('visible')
                });
            }
            addHoverToMarginRect(marginBarRectLeft, () => { marginBarRectLeft.setAttribute('visible', true) });
            addHoverToMarginRect(marginBarRectRight, () => { marginBarRectRight.setAttribute('visible', true) });
            addHoverToMarginRect(marginBarRectTop, () => { marginBarRectTop.setAttribute('visible', true) });
            addHoverToMarginRect(marginBarRectBottom, () => { marginBarRectBottom.setAttribute('visible', true) });

            appendChild(marginBarRectLeft)
            appendChild(marginBarRectRight)
            appendChild(marginBarRectTop)
            appendChild(marginBarRectBottom)

            appendChild(marginBarLeft);
            appendChild(marginBarRight);
            appendChild(marginBarTop);
            appendChild(marginBarBottom)
            
            Object.assign(this, {
                marginBarLeft,
                marginBarRight,
                marginBarTop,
                marginBarBottom,
                marginBarRectLeft,
                marginBarRectRight,
                marginBarRectTop,
                marginBarRectBottom,
                marginBarRectLeftContent,
                marginBarRectRightContent,
                marginBarRectTopContent,
                marginBarRectBottomContent
            })
            // this.el = marginLeft;
        }
    } 

    onRefreshMargin(targetBlock) {
        const { width, height, marginLeft, marginRight, marginTop, marginBottom } = targetBlock;
        const wholeWidth =  width + marginLeft + marginRight;
        const wholeHeight = height + marginTop + marginBottom;
        const {
            marginBarRectLeft,
            marginBarRectRight,
            marginBarRectTop,
            marginBarRectBottom,
            marginBarRectLeftContent,
            marginBarRectRightContent,
            marginBarRectTopContent,
            marginBarRectBottomContent
        } = this;
        Object.assign(marginBarRectLeft.style, {
            left: -marginLeft + 'px',
            top: -marginTop + 'px',
            width: marginLeft + 'px',
            height: wholeHeight + 'px'
        });
        marginBarRectLeftContent.innerText = Math.round(marginLeft) + 'px';

        Object.assign(marginBarRectRight.style, {
            left: targetBlock.width + 'px',
            top: -marginTop + 'px',
            width: marginRight + 'px',
            height: wholeHeight + 'px'
        })
        marginBarRectRightContent.innerText = Math.round(marginRight) + 'px';
    
        Object.assign(marginBarRectTop.style, {
            left: -marginLeft + 'px',
            top: -marginTop + 'px',
            width: wholeWidth + 'px',
            height: marginTop + 'px'
        })
        marginBarRectTopContent.innerText = Math.round(marginTop) + 'px';
        
        Object.assign(marginBarRectBottom.style, {
            left: -marginLeft + 'px',
            top: targetBlock.height + 'px',
            width: wholeWidth + 'px',
            height: marginBottom + 'px'
        })
        marginBarRectBottomContent.innerText = Math.round(marginBottom) + 'px';
    }

    refresh(targetBlock) {
        if(this.accept(targetBlock)) {
            const {
                marginBarLeft,
                marginBarRight,
                marginBarTop,
                marginBarBottom
            } = this;
            const { width, height } = targetBlock;
            marginBarLeft.style.top = height / 2 + 'px';
            marginBarRight.style.top = height / 2 + 'px';
            marginBarRight.style.left = (width - 5) + 'px';
            marginBarTop.style.left = width / 2 + 'px';
            marginBarBottom.style.left = width / 2 + 'px';
            marginBarBottom.style.top = height - 5 + 'px';

            this.onRefreshMargin(targetBlock)
        }
    }
    

    destroy() {
        ELEMENT_KEYS.forEach(k => {
            if(this[k]){
                this[k].remove();
            }
        })
    }
}

export default BlockBoxMargin;