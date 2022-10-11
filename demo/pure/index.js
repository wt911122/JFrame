import data from './data/data-flex.json';
import JFrame, { 
    BlockTitle,
    BlockSize,
    BlockDelete,
    BlockBoxResizer,
    BlockBoxSplitter,
    BlockBoxMargin,
    BlockBoxContentEditor,
    BlockAlignment,
} from '../../src/core/jframe';
import '../../src/style/style.css';
const deleteIcon = require('./assets/delete.png');

const app = document.getElementById('app');
let id = 0;
let currentInstance;
class Elem {
    constructor(source) {
        this.id = id ++;
        this.concept = source.concept;
        this.tag = source.tag;
        this.props = source.props || {};
        this.style = source.style || {};
        this.children = [];
        if(source.children){
            source.children.forEach(c => {
                const el = new Elem(c);
                this.children.push(el);
                el.parentElement = this;
            });
        }
    }
    toPlainObject() {
        return {
            id: this.id,
            tag: this.tag,
            props: JSON.parse(JSON.stringify(this.props)),
            style: JSON.parse(JSON.stringify(this.style)),
            children: this.children.map(e => e.toPlainObject()),
        }
    }
    delete() {
        if(this.parentElement) {
            const idx = this.parentElement.children.findIndex(e => e === this);
            this.parentElement.children.splice(idx, 1);
            return idx;
        }
    }
}

let source = new Elem(data);

function memo() {
    let snapshots = [];
    let i = 0;
    function snapshot() {
        snapshots = snapshots.slice(0, i + 1);
        snapshots.push(source.toPlainObject());
        i = snapshots.length - 1;
    }

    function revokable() {
        return i > 0;
    }

    function redoable() {
        return i < snapshots.length - 1;
    }

    function revoke() {
        if(revokable()) {
            i--;
            source = new Elem(snapshots[i]);
            jframeInstance.setFocusTarget(null)
            jframeInstance.postMessage(JSON.stringify({
                type: 'rerender',
                elements: [source.toPlainObject()],
            }));
            console.log(snapshots);
        }
    }

    function redo() {
        if(redoable()) {
            i++;
            console.log(snapshots);
            source = new Elem(snapshots[i]);
            jframeInstance.setFocusTarget(null)
            jframeInstance.postMessage(JSON.stringify({
                type: 'rerender',
                elements: [source.toPlainObject()],
            }));
        }
    }
    
    return {
        snapshot,
        revokable,
        redoable,
        revoke,
        redo
    }
}
const {
    snapshot,
    revokable,
    redoable,
    revoke,
    redo
} = memo();

document.getElementById('revokebtn').addEventListener('click', () => {
    revoke();
});
document.getElementById('redobtn').addEventListener('click', () => {
    redo();
})

const dataElemDescription = {
    getRoot() {
        return source;
    },
    bindElement(jframe, source) {
        return jframe.getRenderElement(`[data-id="${source.id}"]`);
    },
    getSourceChildren(source) {
        return source.children;
    },
    getSourceParent(source) {
        return source.parentElement;
    },
    hasSlot(source) {
        return ['UlElement', 'LiElement', 'DivElement', 'FlexContainer'].includes(source.tag);
    },
    inlineElement(source) {
        return ['TextElement', 'BtnElement'].includes(source.tag);
    },
    blockElement(source){
        return ['UlElement', 'LiElement', 'DivElement', 'FlexContainer'].includes(source.tag);
    },
    isAcceptElement(movingSource, targetSource) {
        movingSource = currentInstance || movingSource;
        const mtag = movingSource.tag;
        const tTag = targetSource.tag;
        if(mtag === 'DivElement' || mtag === 'FlexContainer') {
            return ['LiElement', 'DivElement', 'FlexContainer'].includes(tTag)
        }
        if(mtag === 'UlElement') {
            return ['LiElement', 'DivElement', 'FlexContainer'].includes(tTag)
        }
        if(mtag === 'LiElement') {
            return ['UlElement'].includes(tTag)
        }
        if(mtag === 'TextElement' || mtag === 'BtnElement') {
            return ['UlElement', 'DivElement', 'LiElement', 'FlexContainer'].includes(tTag)
        }
    },
    draggable(source) {
        return source.tag !== 'FlexContainer';
    },
    splitable(source){
        return source.tag === 'FlexContainer';
    },
    getSplitableDiretion(source) {
        return source.props.direction;
    }
    // paddingResizable(source) {
    //     return ['FlexContainer'].includes(source.tag);
    // },
    // contentSplit(source) {
    //     return ['FlexContainer'].includes(source.tag);
    // }
}

// const indicatorElem = document.createElement('div');
// indicatorElem.setAttribute('style', 'transform: translateY(-100%);position: absolute;background: #fff;color: #4e75ec;')
// const textContent = document.createElement('span');
// indicatorElem.appendChild(textContent);
// function renderElem(x, y, content) {
//     indicatorElem.style.left = `${x}px`;
//     indicatorElem.style.top = `${y}px`;
//     textContent.innerText = content;
// }

// const focusElem = document.createElement('div')
// focusElem.setAttribute('style', 'transform: translateY(-100%);position: absolute;background: #4e75ec;color: #fff;')
// const focusContent = document.createElement('span');
// focusElem.appendChild(focusContent);
// function renderFocusElem(x, y, content) {
//     focusElem.style.left = `${x}px`;
//     focusElem.style.top = `${y}px`;
//     focusContent.innerText = content;
// }


function SPLITABLE(source){
    return ['FlexContainer'].includes(source.tag)
}

const frameURL = `${window.location.origin}${window.location.pathname}vueproj.html`;
// const frameURL = 'http://localhost:9003/'
console.log(frameURL)

const jframeInstance = new JFrame({
    frameURL,
    dataElemDescription,
    toolbox: {
        tools: [
            new BlockTitle(),
            new BlockSize({
                editable(targetBlock) {
                    if(SPLITABLE(targetBlock.source)) {
                        return !targetBlock.source.parentElement;
                    }
                    return true;
                },
            }),
            new BlockAlignment({
                accept(source) {
                    if(source.tag === 'FlexContainer') {
                        if(source.children.length > 0 && source.children[0].tag !== 'FlexContainer'){
                            return true;
                        }
                    }
                    return false;
                },
                onClick(targetBlock, propertyName, value) {
                    targetBlock.source.props[propertyName] = value;
                    _rerenderJframeInstance();
                }
            }),
            new BlockDelete({
                accept(targetBlock) {
                    return !!targetBlock.source.parentElement
                },
                onClick(target) {
                    onDeleteElement(target);
                    _rerenderJframeInstance();
                }
            }),
            new BlockBoxResizer({
                accept(targetBlock) {
                    return ['BtnElement'].includes(targetBlock.source.tag);
                }
            }),
            new BlockBoxSplitter({
                accept(source) {
                    return SPLITABLE(source);
                },
                getDirection(targetBlock){
                    return targetBlock.source.props.direction;
                }
            }),
            new BlockBoxMargin({
                accept(targetBlock) {
                    return SPLITABLE(targetBlock.source);
                },
            }),
            new BlockBoxContentEditor({
                accept(targetBlock) {
                    return targetBlock.source.tag === 'BtnElement';
                },
                getContent(source) {
                    return source.props.content;
                },
                onContentChange(s, content) {
                    s.props.content = content;
                    _rerenderJframeInstance();
                }
            })
        ],
    },
});

function _rerenderJframeInstance() {
    jframeInstance.postMessage(JSON.stringify({
        type: 'rerender',
        elements: [source.toPlainObject()],
    }));
    snapshot();
}

function onDeleteElementInSplitable(target) {
    const sdata = target.source;
    if(sdata.parentElement && SPLITABLE(sdata) && SPLITABLE(sdata.parentElement)) {
        const parentSource = sdata.parentElement;
        const dir = parentSource.props.direction;
        const getBlockBySource = jframeInstance.source_block_element_map.getBlockBySource.bind(jframeInstance.source_block_element_map);
        const parentBlock = getBlockBySource(parentSource);
        const idx = parentSource.children.findIndex(s => s === sdata);
        if(parentSource.children.length === 2) {
            const remainElem = parentSource.children[idx === 0 ? 1 : 0];
            const remainChildren = remainElem.children;
            const grandParentEle = parentSource.parentElement;
            if(grandParentEle && remainChildren.length > 0) {
                const dir = grandParentEle.props.direction;
                const grandBlock = getBlockBySource(grandParentEle);
                const parent_idx = parentSource.delete();
                if(dir === 'row') {
                    remainChildren.forEach(c => {
                        const t = getBlockBySource(c).width;
                        c.style.width = `${t / grandBlock.width * 100}%`
                        c.parentElement = grandParentEle;
                    });
                } 
                if(dir === 'column') {
                    remainChildren.forEach(c => {
                        const t = getBlockBySource(c).height;
                        c.style.height = `${t / grandBlock.height * 100}%`
                        c.parentElement = grandParentEle;
                    });
                }
                grandParentEle.children.splice(parent_idx, 0, ...remainChildren);
            
                jframeInstance.addEventListener('afterResize', () => {
                    
                    jframeInstance.setFocusTarget(grandBlock)
                }, {
                    once: true,
                })
                return true;
            } else {
                remainElem.delete();
                remainChildren.forEach(c => {
                    c.parentElement = parentSource;
                    parentSource.children.push(c);
                });
                parentSource.props.direction = remainElem.props.direction;
                
                jframeInstance.addEventListener('afterResize', () => {
                    jframeInstance.setFocusTarget(parentBlock)
                }, {
                    once: true,
                })
                return true;
            }
        } else {
            const prevNode = parentSource.children[idx - 1];
            const afterNode = parentSource.children[idx + 1];
            let pw = 0, aw = 0;
            let wholewidth = target.width
            const parentWidth = parentBlock.width;
            if(prevNode) {
                const prevBlock = getBlockBySource(prevNode);
                pw = prevBlock.width;
                wholewidth += prevBlock.width;
            }
            if(afterNode) {
                const afterBlock = getBlockBySource(afterNode);
                aw = afterBlock.width;
                wholewidth += afterBlock.width;
            }
            let stylebound;
            if(dir === 'column') {
                stylebound = 'height'
            } 
            if(dir === 'row') {
                stylebound = 'width'
            }
            if(prevNode) {
                prevNode.style[stylebound] = `${pw / (aw + pw) * wholewidth / parentWidth * 100}%`
            }
            if(afterNode) {
                afterNode.style[stylebound] = `${aw / (aw + pw) * wholewidth / parentWidth * 100}%`
            }
            jframeInstance.addEventListener('afterResize', () => {
                jframeInstance.setFocusTarget(parentBlock)
            }, {
                once: true,
            })
            return true;
        }
        
    }
    return false;
}

function onDeleteElement(target) {
    const informed = onDeleteElementInSplitable(target);
    const sdata = target.source;
    const parentBlock = jframeInstance.source_block_element_map.getBlockBySource(sdata.parentElement);
    sdata.delete();
    if(!informed && parentBlock) {
        jframeInstance.addEventListener('afterResize', () => {
            jframeInstance.setFocusTarget(parentBlock)
        }, {
            once: true,
        })
    }
}
jframeInstance.addEventListener('frameloaded', () => {
    _rerenderJframeInstance();
})
/*
jframeInstance.addEventListener('elementHover', (e) => {
    const { target } = e.detail;
})
jframeInstance.addEventListener('elementFocus', (e) => {
    const { target } = e.detail;
}) */

jframeInstance.addEventListener('elementsResized', (e) => {
    e.detail.elements.forEach(e => {
        const { 
            targetBlock,
            source, 
            width,
            height,
            marginLeft,
            marginRight,
            marginTop,
            marginBottom,
         } = e;
        if(parseFloat(width) === 0 || parseFloat(height) === 0) {
            onDeleteElement(targetBlock);
        } else {
            if(width !== undefined) {
                source.style.width = width;
            }
            if(height !== undefined) {
                source.style.height = height;
            }
            if(marginLeft !== undefined) {
                source.style.marginLeft = marginLeft;
            }
            if(marginRight !== undefined) {
                source.style.marginRight = marginRight;
            }
            if(marginTop !== undefined) {
                source.style.marginTop = marginTop;
            }
            if(marginBottom !== undefined) {
                source.style.marginBottom = marginBottom;
            }
        }
    })
   
    _rerenderJframeInstance();
})

jframeInstance.addEventListener('elementdrop', (e) => {
    const { source: sdata, childIdx, target, targetBlock } = e.detail;
    if(target) {
        if(sdata === target) return;
        // onDeleteElementInSplitable(targetBlock);
        target.delete();
        sdata.children.splice(childIdx, 0, target);
        target.parentElement = sdata;
    } else {
        if(sdata === currentInstance) return;
        sdata.children.splice(childIdx, 0, currentInstance);
        currentInstance.parentElement = sdata;
    }
    const _c = currentInstance;
    jframeInstance.addEventListener('afterResize', () => {
        const block = jframeInstance.source_block_element_map.getBlockBySource(target || _c)
        jframeInstance.setFocusTarget(block);
    }, {
        once: true,
    });
    _rerenderJframeInstance();
})

jframeInstance.addEventListener('elementSplit', (e) => {
    const { block, source: sdata, dir } = e.detail;
    const children = sdata.children;
    if(sdata.parentElement && SPLITABLE(sdata.parentElement)) {
        if(sdata.parentElement.props.direction === dir) {
            // 与父级同侧，父级切分
            const parentBlock = jframeInstance.source_block_element_map.getBlockBySource(sdata.parentElement);
            const parentElement = sdata.parentElement;
            const c = new Elem({
                concept: 'ViewElement',
                tag: 'FlexContainer',
            });
            const idx = parentElement.children.findIndex(e => e === sdata);
            parentElement.children.splice(idx, 0, c);
            c.parentElement = parentElement;
            if(dir === 'column') {
                const h = block.height / 2 / parentBlock.height * 100;
                c.style.height = `${h}%`;
                c.style.width = '100%';
                sdata.style.height = `${h}%`;
            } else if(dir === 'row') {
                const w = block.width / 2 / parentBlock.width * 100;
                c.style.width = `${w}%`;
                c.style.height = '100%';
                sdata.style.width = `${w}%`;
            }
            jframeInstance.addEventListener('afterResize', () => {
                jframeInstance.setFocusTarget(parentBlock)
            }, {
                once: true,
            })
            _rerenderJframeInstance();
            return;
        } 
    }
    // 自身切分
    sdata.props.direction = dir;
    const c1 = new Elem({
        concept: 'ViewElement',
        tag: 'FlexContainer',
    });

    const c2 = new Elem({
        concept: 'ViewElement',
        tag: 'FlexContainer',
    })
    if(dir === 'column') {
        c1.style.height = '50%';
        c2.style.height = '50%';
        c1.style.width = '100%';
        c2.style.width = '100%';
    } else if(dir === 'row') {
        c1.style.width = '50%';
        c2.style.width = '50%';
        c1.style.height = '100%';
        c2.style.height = '100%';
    }

    sdata.children = [];
    
    sdata.children.push(c1);
    c1.parentElement = sdata
    sdata.children.push(c2);
    c2.parentElement = sdata
    if(children.length) {
        children.forEach(d => {
            c1.children.push(d);
            d.parentElement = c1;
        }) 
    }
    // block.setSplit(true);
    _rerenderJframeInstance();
})
jframeInstance.$mount(app);


function dragstart(elem) {
    // jframeInstance.sendMessage({ 
    //     instance: elem,
    // });
    currentInstance = elem;
}

const DivElementTool = document.getElementById('DivElement');
const UlElementTool = document.getElementById('UlElement');
const LiElementTool = document.getElementById('LiElement');
const TextElementTool = document.getElementById('TextElement');
const ButtonElementTool = document.getElementById('ButtonElement');

DivElementTool.addEventListener('dragstart', function() {
    dragstart(new Elem({
        concept: 'ViewElement',
        tag: 'DivElement',
    }))
})
DivElementTool.addEventListener('dragend', function() {
    currentInstance = null;
})
UlElementTool.addEventListener('dragstart', function() {
    dragstart(new Elem({
        concept: 'ViewElement',
        tag: 'UlElement',
    }))
})
UlElementTool.addEventListener('dragend', function() {
    currentInstance = null;
})
LiElementTool.addEventListener('dragstart', function() {
    dragstart(new Elem({
        concept: 'ViewElement',
        tag: 'LiElement',
    }))
})
LiElementTool.addEventListener('dragend', function() {
    currentInstance = null;
})
TextElementTool.addEventListener('dragstart', function() {
    dragstart(new Elem({
        concept: 'ViewElement',
        tag: 'TextElement',
        props: {
            content: "xxxx"
        }
    }))
})
TextElementTool.addEventListener('dragend', function() {
    currentInstance = null;
})
ButtonElementTool.addEventListener('dragstart', function() {
    dragstart(new Elem({
        concept: 'ViewElement',
        tag: 'BtnElement',
        props: {
            content: "按钮",
            
        }
    }))
})
ButtonElementTool.addEventListener('dragend', function() {
    currentInstance = null;
})
