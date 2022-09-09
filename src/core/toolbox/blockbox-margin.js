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
                targetBlock.toggleMarginBarRectVisible(false, 'Left')
                targetBlock.toggleMarginBarRectVisible(false, 'Right')
                targetBlock.toggleMarginBarRectVisible(false, 'Top')
                targetBlock.toggleMarginBarRectVisible(false, 'Bottom')
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
                targetBlock.toggleMarginBarRectVisible(true, 'Left')
            }, (deltaX, deltaY) => {
                processing = true;
                marginLeft = Math.max(0, Math.min(deltaX + marginLeft, wholeWidth - marginRight));
                elem.style.width = `${wholeWidth - marginLeft - marginRight}px`;
                elem.style.marginLeft = `${marginLeft}px`;
            }, dispatcher);

            jframe.bindDragdropListener(marginBarRight, () => {
                const styleSheet = window.getComputedStyle(elem);
                marginLeft = parseFloat(styleSheet.marginLeft) || 0;
                marginRight = parseFloat(styleSheet.marginRight) || 0;
                wholeWidth = marginLeft + marginRight + targetBlock.width;
                targetBlock.toggleMarginBarRectVisible(true, 'Right')
            }, (deltaX, deltaY) => {
                processing = true;
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
                targetBlock.toggleMarginBarRectVisible(true, 'Top')
            }, (deltaX, deltaY) => {
                processing = true;
                marginTop = Math.max(0, Math.min(deltaY + marginTop, wholeHeight - marginBottom));
                elem.style.height = `${wholeHeight - marginTop - marginBottom}px`;
                elem.style.marginTop = `${marginTop}px`;
            }, dispatcher);

            jframe.bindDragdropListener(marginBarBottom, () => {
                const styleSheet = window.getComputedStyle(elem);
                marginTop = parseFloat(styleSheet.marginTop) || 0;
                marginBottom = parseFloat(styleSheet.marginBottom) || 0;
                wholeHeight = marginTop + marginBottom + targetBlock.height;
                targetBlock.toggleMarginBarRectVisible(true, 'Bottom')
            }, (deltaX, deltaY) => {
                processing = true;
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
    

    destroy() {
        ELEMENT_KEYS.forEach(k => {
            if(this[k]){
                this[k].remove();
            }
        })
    }
}

export default BlockBoxMargin;