import Tool from './tool'
import JFrameEvent from '../event/event';
const ELEMENT_KEYS = [
    'marginBarLeft',
    'marginBarRight',
    'marginBarTop',
    'marginBarBottom',
    'marginBarRect'
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

    renderBlockTool(targetBlock, appendChild) {
        if(this.accept(targetBlock)) {
            

            // const { width, height, jframe, source: targetSource } = targetBlock;
            // const elem = jframe.source_block_element_map.getElementBySource(targetSource);
            // const marginLeft = document.createElement('div');
            // marginLeft.setAttribute('class', 'jframe-block-margin jframe-block-margin-horizontal');
            // Object.assign(marginLeft.style, {
            //     left: 0,
            //     top: height / 2 + 'px',
            //     cursor: 'e-resize'
            // })
            // marginLeft.addEventListener('pointerdown', e => {
            //     e.preventDefault();
            //     e.stopPropagation();
            //     const { clientX, clientY } = e;
            //     const elem = jframe.source_block_element_map.getElementBySource(targetSource);
            //     let marginLeft = parseFloat(window.getComputedStyle(elem).marginLeft);
            //     let processing = false;
            //     Object.assign(this.resizeMeta, {
            //         lastX: clientX, 
            //         lastY: clientY,
            //         marginLeft,
            //     });
                
            //     const f = (e => {
            //         if(processing){
            //             return;
            //         }
            //         processing = true;
            //         const { clientX, clientY } = e;
            //         let {
            //             lastX, lastY, marginLeft
            //         } = this.resizeMeta;
            //         const deltaX = (clientX - lastX) / jframe.scale;
            //         const deltaY = (clientY - lastY) / jframe.scale;
                    
            //         const elbounds = elem.getBoundingClientRect();
            //         marginLeft += deltaX;
            //         elem.style.width = `${elbounds.width - deltaX}px`;
            //         elem.style.marginLeft = `${marginLeft}px`;
            //         Object.assign(this.resizeMeta, {
            //             lastX: clientX,
            //             lastY: clientY,
            //             marginLeft,
            //         })
            //         processing = false;
            //     }).bind(this);

            //     document.addEventListener('pointermove', f);
            //     document.addEventListener('pointerup', event => {
            //         Object.assign(this.resizeMeta, {
            //             lastX: undefined,
            //             lastY: undefined
            //         })
            //         document.removeEventListener('pointermove', f);
            //         jframe.dispatchEvent(new JFrameEvent('elementsResized', {
            //             elements: [
            //                 {
            //                     targetBlock: targetBlock,
            //                     source: targetBlock?.source,
            //                     width: elem.style.width,
            //                     height: elem.style.height,
            //                     marginLeft: elem.style.marginLeft
            //                 }
            //             ]
            //         }))
            //     }, {
            //         once: true
            //     })
            // });

            const { width, height, jframe, source: targetSource } = targetBlock;
            const elem = jframe.source_block_element_map.getElementBySource(targetSource);
            

            const marginBarLeft = document.createElement('div');
            marginBarLeft.setAttribute('class', 'jframe-block-margin jframe-block-margin-horizontal');
            Object.assign(marginBarLeft.style, {
                left: 0,
                top: height / 2 + 'px',
                cursor: 'e-resize'
            })

            const marginBarRect = document.createElement('div');
            marginBarRect.setAttribute('class', 'jframe-block-margin-rect');
            const marginBarContent = document.createElement('div');
            marginBarContent.setAttribute('class', 'jframe-block-margin-rect-content')
            marginBarRect.appendChild(marginBarContent);

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
                Object.assign(marginBarRect.style, {
                    display: 'none'
                })
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

                Object.assign(marginBarRect.style, {
                    display: 'flex',
                    left: -marginLeft + 'px',
                    top: -marginTop + 'px',
                    width: marginLeft + 'px',
                    height: wholeHeight + 'px'
                });
                marginBarContent.innerText = Math.round(marginLeft) + 'px';
            }, (deltaX, deltaY) => {
                // const elbounds = elem.getBoundingClientRect();
                marginLeft = Math.max(0, Math.min(deltaX + marginLeft, wholeWidth - marginRight));
                elem.style.width = `${wholeWidth - marginLeft - marginRight}px`;
                elem.style.marginLeft = `${marginLeft}px`;

                Object.assign(marginBarRect.style, {
                    left: -marginLeft + 'px',
                    width: marginLeft + 'px',
                })
                marginBarContent.innerText = Math.round(marginLeft) + 'px';
            }, dispatcher);

            jframe.bindDragdropListener(marginBarRight, () => {
                const styleSheet = window.getComputedStyle(elem);
                marginLeft = parseFloat(styleSheet.marginLeft) || 0;
                marginRight = parseFloat(styleSheet.marginRight) || 0;
                wholeWidth = marginLeft + marginRight + targetBlock.width;

                Object.assign(marginBarRect.style, {
                    display: 'flex',
                    left: targetBlock.width + 'px',
                    top: -marginTop + 'px',
                    width: marginRight + 'px',
                    height: wholeHeight + 'px'
                })
                marginBarContent.innerText = Math.round(marginRight) + 'px';
            }, (deltaX, deltaY) => {
                // const elbounds = elem.getBoundingClientRect();
                marginRight = Math.max(0, Math.min(-deltaX + marginRight, wholeWidth - marginLeft));
                elem.style.width = `${wholeWidth - marginLeft - marginRight}px`;
                elem.style.marginRight = `${marginRight}px`;
                Object.assign(marginBarRect.style, {
                    left: targetBlock.width + 'px',
                    width: marginRight + 'px',
                })
                marginBarContent.innerText = Math.round(marginRight) + 'px';
            }, dispatcher);

            jframe.bindDragdropListener(marginBarTop, () => {
                const styleSheet = window.getComputedStyle(elem);
                marginTop = parseFloat(styleSheet.marginTop) || 0;
                marginBottom = parseFloat(styleSheet.marginBottom) || 0;
                wholeHeight = marginTop + marginBottom + targetBlock.height;

                Object.assign(marginBarRect.style, {
                    display: 'flex',
                    left: -marginLeft + 'px',
                    top: -marginTop + 'px',
                    width: wholeWidth + 'px',
                    height: marginTop + 'px'
                })
                marginBarContent.innerText = Math.round(marginTop) + 'px';
            }, (deltaX, deltaY) => {
                marginTop = Math.max(0, Math.min(deltaY + marginTop, wholeHeight - marginBottom));
                elem.style.height = `${wholeHeight - marginTop - marginBottom}px`;
                elem.style.marginTop = `${marginTop}px`;
                Object.assign(marginBarRect.style, {
                    top: -marginTop + 'px',
                    height: marginTop + 'px'
                })
                marginBarContent.innerText = Math.round(marginTop) + 'px';
            }, dispatcher);

            jframe.bindDragdropListener(marginBarBottom, () => {
                const styleSheet = window.getComputedStyle(elem);
                marginTop = parseFloat(styleSheet.marginTop) || 0;
                marginBottom = parseFloat(styleSheet.marginBottom) || 0;
                wholeHeight = marginTop + marginBottom + targetBlock.height;
                Object.assign(marginBarRect.style, {
                    display: 'flex',
                    left: -marginLeft + 'px',
                    top: targetBlock.height + 'px',
                    width: wholeWidth + 'px',
                    height: marginBottom + 'px'
                })
                marginBarContent.innerText = Math.round(marginBottom) + 'px';
            }, (deltaX, deltaY) => {
                marginBottom = Math.max(0, Math.min(marginBottom - deltaY, wholeHeight - marginTop));
                elem.style.height = `${wholeHeight - marginTop - marginBottom}px`;
                elem.style.marginBottom = `${marginBottom}px`;

                Object.assign(marginBarRect.style, {
                    top: targetBlock.height + 'px',
                    height: marginBottom + 'px'
                })
                marginBarContent.innerText = Math.round(marginBottom) + 'px';
            }, dispatcher);
            
            appendChild(marginBarRect)
            appendChild(marginBarLeft);
            appendChild(marginBarRight);
            appendChild(marginBarTop);
            appendChild(marginBarBottom)
            Object.assign(this, {
                marginBarLeft,
                marginBarRight,
                marginBarTop,
                marginBarBottom,
                marginBarRect
            })
            // this.el = marginLeft;
        }
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