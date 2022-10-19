import Tool from './tool'
import JFrameEvent from '../event/event';
const ELEMENT_KEYS = [
    'marginBarLeft',
    'marginBarRight',
    'marginBarTop',
    'marginBarBottom',
]
class BlockBoxMargin extends Tool {
    constructor(configs) {
        super();
        this.accept = configs.accept;
    }

    _calculateWidthAfterMarginChange({
        jframe,
        elem,
        targetSource,
        marginLeft: ml,
        marginRight: mr,
        marginTop: mt,
        marginBottom: mb,
    }){
        const styleSheet = window.getComputedStyle(elem);
        const parentSource = jframe.dataElemDescription.getSourceParent(targetSource);
        let width = parseFloat(styleSheet.width) || 0;
        let height = parseFloat(styleSheet.height) || 0;
        // let hw = wholeWidth;
        // let hh = wholeHeight;
        let marginLeft = parseFloat(styleSheet.marginLeft) ?? 0;
        let marginRight = parseFloat(styleSheet.marginRight) ?? 0;
        let marginTop = parseFloat(styleSheet.marginTop) ?? 0;
        let marginBottom = parseFloat(styleSheet.marginBottom) ?? 0;
        
        const wholeHeight = marginTop + marginBottom + height;
        const wholeWidth = marginLeft + marginRight + width;
        
        let wratio = 1;
        let hratio = 1;
        const s = jframe.dataElemDescription.getSourceParent(targetSource);
        if(s) {
            const elem = jframe.source_block_element_map.getElementBySource(s);
            const bounding = elem.getBoundingClientRect();
            const hw = bounding.width;
            const hh = bounding.height;
            wratio = wholeWidth / hw;
            hratio = wholeHeight / hh;
        }
        marginLeft = ml ?? marginLeft;
        marginRight = mr ?? marginRight;
        marginTop = mt ?? marginTop;
        marginBottom = mb ?? marginBottom;
        if(parentSource) {
            width = `calc(${wratio * 100}% - ${marginLeft+marginRight}px)`;
            height = `calc(${hratio * 100}% - ${marginTop+marginBottom}px)`;
        } 
        

        return {
            width,
            height,
            marginLeft: `${marginLeft}px`,
            marginRight: `${marginRight}px`,
            marginTop: `${marginTop}px`,
            marginBottom: `${marginBottom}px`,
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
                cursor: 'ew-resize'
            })

            const marginBarRight = document.createElement('div');
            marginBarRight.setAttribute('class', 'jframe-block-margin jframe-block-margin-horizontal');
            Object.assign(marginBarRight.style, {
                left: width - 5 + 'px',
                top: height / 2 + 'px',
                cursor: 'ew-resize'
            })

            const marginBarTop = document.createElement('div');
            marginBarTop.setAttribute('class', 'jframe-block-margin jframe-block-margin-vertical');
            Object.assign(marginBarTop.style, {
                left: width / 2 + 'px',
                top: 0,
                cursor: 'ns-resize'
            })

            const marginBarBottom = document.createElement('div');
            marginBarBottom.setAttribute('class', 'jframe-block-margin jframe-block-margin-vertical');
            Object.assign(marginBarBottom.style, {
                left: width / 2 + 'px',
                top: height - 5 + 'px',
                cursor: 'ns-resize'
            })

            function toggleMarginActive(elem, val) {
                if(val) {
                    elem.setAttribute('active', true)
                } else {
                    elem.removeAttribute('active')
                }
            }
            
            const styleSheet = window.getComputedStyle(elem);
            let marginLeft = parseFloat(styleSheet.marginLeft) || 0;
            let marginRight = parseFloat(styleSheet.marginRight) || 0;
            let marginTop = parseFloat(styleSheet.marginTop) || 0;
            let marginBottom = parseFloat(styleSheet.marginBottom) || 0;
            let wholeHeight = marginTop + marginBottom + targetBlock.height;
            let wholeWidth = marginLeft + marginRight + targetBlock.width;

            const dispatcher = () => {
                /* const styleSheet = window.getComputedStyle(elem);
                const parentSource = jframe.dataElemDescription.getSourceParent(targetBlock.source);
                let width = parseFloat(styleSheet.width) || 0;
                let height = parseFloat(styleSheet.height) || 0;
                marginLeft = parseFloat(styleSheet.marginLeft) || 0;
                marginRight = parseFloat(styleSheet.marginRight) || 0;
                marginTop = parseFloat(styleSheet.marginTop) || 0;
                marginBottom = parseFloat(styleSheet.marginBottom) || 0;
                
                wholeHeight = marginTop + marginBottom + height;
                wholeWidth = marginLeft + marginRight + width;
                
                let wratio = 1;
                let hratio = 1;
                const s = jframe.dataElemDescription.getSourceParent(targetSource);
                if(s) {
                    const elem = jframe.source_block_element_map.getElementBySource(s);
                    const bounding = elem.getBoundingClientRect();
                    const hw = bounding.width;
                    const hh = bounding.height;
                    wratio = wholeWidth / hw;
                    hratio = wholeHeight / hh;
                }
                if(parentSource) {
                    width = `calc(${wratio * 100}% - ${marginLeft+marginRight}px)`;
                    height = `calc(${hratio * 100}% - ${marginTop+marginBottom}px)`;
                }*/
                
                // const wratio = parseFloat(stylesheet.width) / hw * 100;
                // const hratio = parseFloat(stylesheet.height) / hh * 100;
               
                jframe.dispatchEvent(new JFrameEvent('elementsResized', {
                    elements: [
                        {
                            targetBlock: targetBlock,
                            source: targetBlock?.source,
                            ...this._calculateWidthAfterMarginChange({
                                jframe, elem, targetSource
                            }),
                        }
                    ]
                }))
                toggleMarginActive(marginBarLeft, false);
                toggleMarginActive(marginBarRight, false);
                toggleMarginActive(marginBarBottom, false);
                toggleMarginActive(marginBarTop, false);
                
                // targetBlock.toggleMarginBarRectVisible(false, 'Left')
                // targetBlock.toggleMarginBarRectVisible(false, 'Right')
                // targetBlock.toggleMarginBarRectVisible(false, 'Top')
                // targetBlock.toggleMarginBarRectVisible(false, 'Bottom')
                jframe.IFM.toggleBlockHoverStyle(false);
            }
            
            jframe.bindDragdropListener(marginBarLeft, () => {
                const styleSheet = window.getComputedStyle(elem);
                marginLeft = parseFloat(styleSheet.marginLeft) || 0;
                marginRight = parseFloat(styleSheet.marginRight) || 0;
                wholeWidth = marginLeft + marginRight + targetBlock.width;
                toggleMarginActive(marginBarLeft, true);
                // targetBlock.toggleMarginBarRectVisible(true, 'Left')
            }, (deltaX, deltaY) => {
                jframe.IFM.toggleBlockHoverStyle(true);
                marginLeft = Math.max(0, Math.min(deltaX + marginLeft, wholeWidth - marginRight));
                elem.style.width = `${wholeWidth - marginLeft - marginRight}px`;
                elem.style.marginLeft = `${marginLeft}px`;
            }, dispatcher);

            jframe.bindDragdropListener(marginBarRight, () => {
                const styleSheet = window.getComputedStyle(elem);
                marginLeft = parseFloat(styleSheet.marginLeft) || 0;
                marginRight = parseFloat(styleSheet.marginRight) || 0;
                wholeWidth = marginLeft + marginRight + targetBlock.width;
                toggleMarginActive(marginBarRight, true);
                // targetBlock.toggleMarginBarRectVisible(true, 'Right')
            }, (deltaX, deltaY) => {
                jframe.IFM.toggleBlockHoverStyle(true);
                // const elbounds = elem.getBoundingClientRect();
                marginRight = Math.max(0, Math.min(-deltaX + marginRight, wholeWidth - marginLeft));
                elem.style.width = `${wholeWidth - marginLeft - marginRight}px`;
                elem.style.marginRight = `${marginRight}px`;
            }, dispatcher);

            jframe.bindDragdropListener(marginBarTop, () => {
                const styleSheet = window.getComputedStyle(elem);
                marginTop = parseFloat(styleSheet.marginTop) || 0;
                marginBottom = parseFloat(styleSheet.marginBottom) || 0;
                wholeHeight = marginTop + marginBottom + targetBlock.height;
                toggleMarginActive(marginBarTop, true);
                // targetBlock.toggleMarginBarRectVisible(true, 'Top')
            }, (deltaX, deltaY) => {
                jframe.IFM.toggleBlockHoverStyle(true);
                marginTop = Math.max(0, Math.min(deltaY + marginTop, wholeHeight - marginBottom));
                elem.style.height = `${wholeHeight - marginTop - marginBottom}px`;
                elem.style.marginTop = `${marginTop}px`;
            }, dispatcher);

            jframe.bindDragdropListener(marginBarBottom, () => {
                const styleSheet = window.getComputedStyle(elem);
                marginTop = parseFloat(styleSheet.marginTop) || 0;
                marginBottom = parseFloat(styleSheet.marginBottom) || 0;
                wholeHeight = marginTop + marginBottom + targetBlock.height;
                toggleMarginActive(marginBarBottom, true);
                // targetBlock.toggleMarginBarRectVisible(true, 'Bottom')
            }, (deltaX, deltaY) => {
                jframe.IFM.toggleBlockHoverStyle(true);
                marginBottom = Math.max(0, Math.min(marginBottom - deltaY, wholeHeight - marginTop));
                elem.style.height = `${wholeHeight - marginTop - marginBottom}px`;
                elem.style.marginBottom = `${marginBottom}px`;
            }, dispatcher);
            

            appendChild(marginBarLeft);
            appendChild(marginBarRight);
            appendChild(marginBarTop);
            appendChild(marginBarBottom)
            
            Object.assign(this, {
                marginBarLeft,
                marginBarRight,
                marginBarTop,
                marginBarBottom,
            })
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

            // this.onRefreshMargin(targetBlock)
        }
    }
    

    blockRenderer(targetBlock) {
        const flag = this.accept(targetBlock);
        if(flag) {
            const {
                marginBarRect: marginBarRectLeft,
                marginBarContent: marginBarRectLeftContent,
            } = this._renderMarginBarRect(targetBlock, 'marginLeft');
            const {
                marginBarRect: marginBarRectRight,
                marginBarContent: marginBarRectRightContent,
            } = this._renderMarginBarRect(targetBlock, 'marginRight');
            const {
                marginBarRect: marginBarRectTop,
                marginBarContent: marginBarRectTopContent,
            } = this._renderMarginBarRect(targetBlock, 'marginTop');
            const {
                marginBarRect: marginBarRectBottom,
                marginBarContent: marginBarRectBottomContent,
            } = this._renderMarginBarRect(targetBlock, 'marginBottom');

            targetBlock.elem.appendChild(marginBarRectLeft);
            targetBlock.elem.appendChild(marginBarRectRight);
            targetBlock.elem.appendChild(marginBarRectTop);
            targetBlock.elem.appendChild(marginBarRectBottom);

            return {
                render(targetBlock) {
                    if(!flag) {
                        return;
                    }
                    const { width, height, marginLeft, marginRight, marginTop, marginBottom } = targetBlock;
                    const wholeWidth =  width + marginLeft + marginRight;
                    const wholeHeight = height + marginTop + marginBottom;
                    Object.assign(marginBarRectLeft.style, {
                        left: -marginLeft - 2 + 'px',
                        top: -marginTop - 2 + 'px',
                        width: marginLeft + 'px',
                        height: wholeHeight + 'px'
                    });
                    marginBarRectLeftContent.innerText = Math.round(marginLeft) + 'px';
            
                    Object.assign(marginBarRectRight.style, {
                        left: width - 2 + 'px',
                        top: -marginTop - 2 + 'px',
                        width: marginRight + 'px',
                        height: wholeHeight + 'px'
                    })
                    marginBarRectRightContent.innerText = Math.round(marginRight) + 'px';
                
                    Object.assign(marginBarRectTop.style, {
                        left: -marginLeft - 2 + 'px',
                        top: -marginTop - 2 + 'px',
                        width: wholeWidth + 'px',
                        height: marginTop + 'px'
                    })
                    marginBarRectTopContent.innerText = Math.round(marginTop) + 'px';
                    
                    Object.assign(marginBarRectBottom.style, {
                        left: -marginLeft -2 + 'px',
                        top: height-2 + 'px',
                        width: wholeWidth + 'px',
                        height: marginBottom + 'px'
                    })
                    marginBarRectBottomContent.innerText = Math.round(marginBottom) + 'px';
                }
            }
        }

        return null;
    }

    _renderMarginBarRect(targetBlock, styleProperty) {
        const marginBarRect = document.createElement('div');
        marginBarRect.setAttribute('class', 'jframe-block-margin-rect');
        const marginBarContent = document.createElement('div');
        marginBarContent.setAttribute('class', 'jframe-block-margin-rect-content');
        marginBarRect.appendChild(marginBarContent);
        // marginBarRect.setAttribute('visible', true)
        let oldContent;
        let editting = false;
        const _blurHandler = () => {
            editting = false
            const num = parseFloat(marginBarContent.innerHTML);
            if(num) {
                const jframe = targetBlock.jframe;
                const elem = jframe.source_block_element_map.getElementBySource(targetBlock.source);

                // const pixel = `${num}px`;
                jframe.dispatchEvent(new JFrameEvent('elementsResized', {
                    elements: [
                        {
                            targetBlock,
                            source: targetBlock.source,
                            ...this._calculateWidthAfterMarginChange({
                                jframe, 
                                elem, 
                                targetSource: targetBlock.source,
                                [styleProperty]: num,
                            })
                        },
                    ]
                }))
            } else {
                marginBarContent.innerText = oldContent
            }
            marginBarContent.removeEventListener('keydown', _f);
            marginBarContent.setAttribute('contenteditable', false);
            // marginBarRect.removeAttribute('visible')
        }
        const _f = (e) => {
            if(e.key === 'Enter'){
                _blurHandler();
            };
        }
        const _resetStatus = () => {
            marginBarRect.removeAttribute('visible')
            marginBarContent.removeEventListener(blur, _blurHandler, {
                once: true
            })
            marginBarContent.setAttribute('contenteditable', false);
        }
        marginBarRect.addEventListener('mouseenter', () => {
            // if(!this._hoverEnable) return;
            if(this.processingMarginRectVisible) return
            marginBarRect.setAttribute('visible', true);
        });
        marginBarRect.addEventListener('mouseleave', () => {
            if(this.processingMarginRectVisible || editting) return
            _resetStatus()
        });
        targetBlock.addEventListener('blur', _resetStatus);
        const _close = e => {
            if(!e.path.includes(marginBarRect)) {
                _resetStatus();
                document.removeEventListener('pointerdown', _close);
            }
        }
        marginBarRect.addEventListener('click', () =>{
            oldContent = marginBarContent.innerText;
            marginBarContent.setAttribute('contenteditable', true);
            editting = true;
            document.addEventListener('pointerdown', _close)
            marginBarContent.addEventListener('blur', _blurHandler, {
                once: true
            });
            
            marginBarContent.addEventListener('keydown', _f)
            const selObj = window.getSelection();
            const range = document.createRange();
            const rangeText = marginBarContent.firstChild;
            range.selectNode(rangeText)
            selObj.removeAllRanges();
            selObj.addRange(range)
        })

        return {
            marginBarRect,
            marginBarContent
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