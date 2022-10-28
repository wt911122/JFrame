import data from './data/data-flex.json';
import JFrame, { 
    BlockTitle,
    BlockSize,
    BlockDelete,
    BlockDuplicate,
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
        this.title = source.tag === 'AreaContainer' ? '区域' : source.title;
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
    insertElement(el, idx) {
        this.children.splice(idx, 0, el);
        el.parentElement = this
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
    iterator(cb) {
        cb(this);
        this.children.forEach(c => {
            c.iterator(cb)
        })
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
document.getElementById('previewbtn').addEventListener('click', () => {
    previewbtn.innerText = previewbtn.innerText === '预览' ? '取消预览' : '预览';
    jframeInstance.toggleOverLayer();
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
        return ['UlElement', 'LiElement', 'DivElement', 'AreaContainer'].includes(source.tag);
    },
    inlineElement(source) {
        return ['TextElement', 'BtnElement'].includes(source.tag);
    },
    blockElement(source){
        return ['UlElement', 'LiElement', 'DivElement', 'AreaContainer'].includes(source.tag);
    },
    isAcceptElement(movingSource, targetSource) {
        movingSource = currentInstance || movingSource;
        const mtag = movingSource.tag;
        const tTag = targetSource.tag;

        if(tTag === 'AreaContainer') {
            return targetSource.children.every(e => e.tag !== 'AreaContainer');
        }

        // if(mtag === 'DivElement' || mtag === 'FlexContainer') {
        //     return ['LiElement', 'DivElement', 'FlexContainer'].includes(tTag)
        // }
        // if(mtag === 'UlElement') {
        //     return ['LiElement', 'DivElement', 'FlexContainer'].includes(tTag)
        // }
        // if(mtag === 'LiElement') {
        //     return ['UlElement'].includes(tTag)
        // }
        // if(mtag === 'TextElement' || mtag === 'BtnElement') {
        //     return ['UlElement', 'DivElement', 'LiElement', 'FlexContainer'].includes(tTag)
        // }
        return false;
    },
    draggable(source) {
        return source.tag !== 'AreaContainer';
    },
    splitable(source){
        return source.tag === 'AreaContainer';
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
    return ['AreaContainer'].includes(source.tag)
}

const frameURL = `${window.location.origin}${window.location.pathname}vueproj.html`;
// const frameURL = 'http://localhost:9003/'
console.log(frameURL)

const jframeInstance = new JFrame({
    frameURL,
    dataElemDescription,
    worldMargin: 400,
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
                    if(source.tag === 'AreaContainer') {
                        if(source.children.length > 0 && source.children[0].tag !== 'AreaContainer'){
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
            new BlockDuplicate({
                accept(targetBlock) {
                    return !SPLITABLE(targetBlock.source)
                },
                onClick(targetBlock) {
                    const s = targetBlock.source;
                    const _t = new Elem(s.toPlainObject());
                    const idx =  s.parentElement.children.findIndex(n => n === s);
                    s.parentElement.insertElement(_t, idx+1)
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
                    return SPLITABLE(source) && source.children.length === 0 ;
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
            const remainChildren = remainElem.children.filter(c => SPLITABLE(c));
            const grandParentEle = parentSource.parentElement;
            if(!grandParentEle) {
                if(remainElem.children.length > 0) {
                    remainElem.children.forEach(c => {
                        c.parentElement = parentSource;
                    })
                    Object.assign(parentSource.style, {
                        marginLeft: remainElem.style.marginLeft,
                        marginTop: remainElem.style.marginTop,
                        marginRight: remainElem.style.marginRight,
                        marginBottom: remainElem.style.marginBottom,
                    });
                    if(remainElem.style['grid-template-columns']) {
                        parentSource.style['grid-template-columns'] = remainElem.style['grid-template-columns']
                    } 
                    if(remainElem.style['grid-template-rows']) {
                        parentSource.style['grid-template-rows'] = remainElem.style['grid-template-rows']
                    }
                } else {
                    
                    delete parentSource.style['grid-template-columns']
                    delete parentSource.style['grid-template-rows'];
                    remainElem.delete();
                }
                jframeInstance.addEventListener('afterResize', () => {
                    jframeInstance.setFocusTarget(parentBlock)
                }, {
                    once: true,
                })
                return true;
            }
            const grandIdx = grandParentEle.children.findIndex(c => c === parentSource);
            if(grandParentEle && remainChildren.length > 0) {
                const dir = grandParentEle.props.direction;
                const grandBlock = getBlockBySource(grandParentEle);
                const parent_idx = parentSource.delete();
                let spaces = [];
                let remainSpaces = [];
                let styleName = '';
                if(dir === 'row') {
                    remainChildren.forEach(c => {
                        c.parentElement = grandParentEle;
                    });
                    styleName = 'grid-template-columns';
                    remainSpaces = remainElem.style['grid-template-columns'].split(/\s+/);
                    spaces = grandParentEle.style['grid-template-columns'].split(/\s+/);
                } 
                if(dir === 'column') {
                    remainChildren.forEach(c => {
                        c.parentElement = grandParentEle;
                    });
                    styleName = 'grid-template-rows'
                    remainSpaces = remainElem.style['grid-template-rows'].split(/\s+/);
                    spaces = grandParentEle.style['grid-template-rows'].split(/\s+/);
                }
                
                const wholeSpace = parseFloat(spaces[grandIdx]);
                spaces.splice(grandIdx, 1, ...remainSpaces.map(rs => {
                    return `${wholeSpace * parseFloat(rs) / 100}%`
                }))
                grandParentEle.style[styleName] = spaces.join(' ');
                grandParentEle.children.splice(parent_idx, 1, ...remainChildren);
            
                jframeInstance.addEventListener('afterResize', () => {
                    jframeInstance.setFocusTarget(grandBlock)
                }, {
                    once: true,
                })
                return true;
            } else if(grandParentEle){
                const grandBlock = getBlockBySource(grandParentEle);
                remainElem.parentElement = grandParentEle;
          
                Object.assign(remainElem.style, {
                    marginLeft: parentSource.style.marginLeft,
                    marginTop: parentSource.style.marginTop,
                    marginRight: parentSource.style.marginRight,
                    marginBottom: parentSource.style.marginBottom,
                })
                grandParentEle.children.splice(grandIdx, 1, remainElem);
                
                jframeInstance.addEventListener('afterResize', () => {
                    jframeInstance.setFocusTarget(grandBlock)
                }, {
                    once: true,
                })
                return true;
            }
        } else {
            const afterNode = parentSource.children[idx + 1];
            let spaces = [];
            let styleName = '';
            if(dir === 'row') {
                styleName = 'grid-template-columns';
                spaces = parentSource.style['grid-template-columns'].split(/\s+/).map(parseFloat);
            } 
            if(dir === 'column') {
                styleName = 'grid-template-rows'
                spaces = parentSource.style['grid-template-rows'].split(/\s+/).map(parseFloat);
            }

            if(afterNode) {
                const _sp = spaces[idx] + spaces[idx + 1];
                spaces.splice(idx, 2, _sp);
            } else {
                const _sp = spaces[idx] + spaces[idx - 1];
                spaces.splice(idx-1, 2, _sp);
            }
            parentSource.style[styleName] = spaces.map(s => `${s}%`).join(' ');
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

jframeInstance.addEventListener('elementResplit', e => {
    e.detail.elements.forEach(e => {
        const {
            gridColumns,
            gridRows,
            source
        } = e;
        if(gridRows) {
            source.style['grid-template-rows'] = gridRows;
        }
        if(gridColumns) {
            source.style['grid-template-columns'] = gridColumns;
        }
        _rerenderJframeInstance();
    });
})

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
    const { block, source: sdata, dir, splitRatio } = e.detail;
    console.log(splitRatio)
    const children = sdata.children;
    if(sdata.parentElement && SPLITABLE(sdata.parentElement)) {
        if(sdata.parentElement.props.direction === dir) {
            // 与父级同侧，父级切分
            const parentBlock = jframeInstance.source_block_element_map.getBlockBySource(sdata.parentElement);
            const parentElement = sdata.parentElement;
            const c = new Elem({
                concept: 'ViewElement',
                tag: 'AreaContainer',
            });
            const idx = parentElement.children.findIndex(e => e === sdata);
            parentElement.children.splice(idx, 0, c);
           
            c.parentElement = parentElement;
            if(dir === 'column') {
                // const r = block.height / parentBlock.height;
                const rows = parentElement.style['grid-template-rows'].split(/\s+/);
                const percent = parseFloat(rows[idx]);
                rows.splice(idx, 1, `${percent*splitRatio}%`, `${percent*(1-splitRatio)}%`)
                parentElement.style['grid-template-rows'] = rows.join(' ');
                c.style.marginTop = sdata.style.marginTop || 0;
                // c.style.height = `${r*splitRatio*100}%`;
                // c.style.width = sdata.style.width;
                c.style.marginLeft = sdata.style.marginLeft || 0;
                c.style.marginRight = sdata.style.marginRight || 0;
                sdata.style.marginTop = 0;
                // sdata.style.height = `${r*(1-splitRatio)*100}%`;
            } else if(dir === 'row') {
                const columns = parentElement.style['grid-template-columns'].split(/\s+/);
                const percent = parseFloat(columns[idx]); // TODO 后续改成根据单位判断, 这里全按 百分比
                columns.splice(idx, 1, `${percent*splitRatio}%`, `${percent*(1-splitRatio)}%`)
                parentElement.style['grid-template-columns'] = columns.join(' ');
                c.style.marginLeft = sdata.style.marginLeft || 0;
                // const w = block.width / 2 / parentBlock.width * 100;
                // c.style.width = `${r*splitRatio*100}%`;
                // c.style.height = sdata.style.height;
                c.style.marginTop = sdata.style.marginTop || 0;
                c.style.marginBottom = sdata.style.marginBottom || 0;
                sdata.style.marginLeft = 0;
                // sdata.style.width = `${r*(1-splitRatio)*100}%`;
            }
            jframeInstance.addEventListener('afterResize', () => {
                const cblock = jframeInstance.source_block_element_map.getBlockBySource(c);
                jframeInstance.setFocusTarget(cblock)
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
        tag: 'AreaContainer',
    });

    const c2 = new Elem({
        concept: 'ViewElement',
        tag: 'AreaContainer',
    })
    if(dir === 'column') {
        sdata.style['grid-template-rows'] = `${splitRatio*100}% ${100 - splitRatio*100}%`
    }
    if(dir === 'row') {
        sdata.style['grid-template-columns'] = `${splitRatio*100}% ${100 - splitRatio*100}%`
    }

    // if(dir === 'column') {
    //     c1.style.height = `${splitRatio*100}%`;
    //     c2.style.height = `${100 - splitRatio*100}%`;
    //     c1.style.width = '100%';
    //     c2.style.width = '100%';
    // } else if(dir === 'row') {
    //     c1.style.width = `${splitRatio*100}%`;
    //     c2.style.width = `${100 - splitRatio*100}%`;
    //     c1.style.height = '100%';
    //     c2.style.height = '100%';
    // }

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

// const DivElementTool = document.getElementById('DivElement');
// const UlElementTool = document.getElementById('UlElement');
// const LiElementTool = document.getElementById('LiElement');
// const TextElementTool = document.getElementById('TextElement');
const ButtonElementTool = document.getElementById('ButtonElement');

// DivElementTool.addEventListener('dragstart', function() {
//     dragstart(new Elem({
//         concept: 'ViewElement',
//         tag: 'DivElement',
//     }))
// })
// DivElementTool.addEventListener('dragend', function() {
//     currentInstance = null;
// })
// UlElementTool.addEventListener('dragstart', function() {
//     dragstart(new Elem({
//         concept: 'ViewElement',
//         tag: 'UlElement',
//     }))
// })
// UlElementTool.addEventListener('dragend', function() {
//     currentInstance = null;
// })
// LiElementTool.addEventListener('dragstart', function() {
//     dragstart(new Elem({
//         concept: 'ViewElement',
//         tag: 'LiElement',
//     }))
// })
// LiElementTool.addEventListener('dragend', function() {
//     currentInstance = null;
// })
// TextElementTool.addEventListener('dragstart', function() {
//     dragstart(new Elem({
//         concept: 'ViewElement',
//         tag: 'TextElement',
//         props: {
//             content: "xxxx"
//         }
//     }))
// })
// TextElementTool.addEventListener('dragend', function() {
//     currentInstance = null;
// })
ButtonElementTool.addEventListener('dragstart', function() {
    dragstart(new Elem({
        concept: 'ViewElement',
        tag: 'BtnElement',
        title: '文本',
        props: {
            content: "文本", 
        }
    }))
})
ButtonElementTool.addEventListener('dragend', function() {
    currentInstance = null;
})

const layerIndicatorElem = document.getElementById('layerIndicator');
function makeCrumb(source) {
    const block = jframeInstance.source_block_element_map.getBlockBySource(source);
    const span = document.createElement('span');
    span.setAttribute('class', 'crumb')
    span.innerText = source.title || source.tag
    span.addEventListener('mouseenter', () => {
        block.setHover(true)
    })
    span.addEventListener('mouseleave', () => {
        block.setHover(false)
    });
    span.addEventListener('click', () => {
        jframeInstance.setFocusTarget(block)
    });
    console.log(span)
    return span;
}
jframeInstance.addEventListener('elementFocus', (e) => {
    layerIndicatorElem.innerHTML = '';
    const { target } = e.detail;
    if(target) {
        console.log(target)
        let s = target.source;
        let i = 0;
        while(s) {
            if(i !== 0) {
                layerIndicatorElem.prepend(" / ")
            }
            layerIndicatorElem.prepend(makeCrumb(s));
            i ++;
            s = s.parentElement;
        } 
    }
})

const backgroundColorInput = document.getElementById('backgroundColor');
const borderColorInput = document.getElementById('borderColor');
const contentColorInput = document.getElementById('contentColor');
function rgb2hex(rgb, rgba){
    if(/^rgb\(/.test(rgba)){
        const t = rgba.match(/^rgb?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
        rgba = `rgba(${t[1]},${t[2]},${t[3]}, 1)`
    }
    rgb = rgb.match(/^rgb?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
    rgba = rgba.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/)

  var red = Math.round((rgba[1] * rgba[4]) + (rgb[1] * (1-rgba[4])));
  var blue = Math.round((rgba[2] * rgba[4]) + (rgb[2] * (1-rgba[4])));
  var green = Math.round((rgba[3] * rgba[4]) + (rgb[3] * (1-rgba[4])));  
 return (rgba && rgba.length === 5) ? "#" +
  ("0" + red.toString(16)).slice(-2) +
  ("0" + blue.toString(16)).slice(-2) +
  ("0" + green.toString(16)).slice(-2) : '';
}
let currTarget;
jframeInstance.addEventListener('elementFocus', (e) => {
    const { target } = e.detail;
    if(target) {
        currTarget = target;
        const elem = jframeInstance.source_block_element_map.getElementBySource(target.source);
        const stylesheet = window.getComputedStyle(elem);
        backgroundColorInput.value = rgb2hex('rgb(255, 255, 255)', stylesheet.backgroundColor);
        borderColorInput.value = rgb2hex('rgb(255, 255, 255)', stylesheet.borderColor);
        if(target.source.tag === 'AreaContainer') {
            contentColorInput.parentElement.style.display = 'none';
        } else {
            contentColorInput.parentElement.style.display = 'inline';
            contentColorInput.value = rgb2hex('rgb(255, 255, 255)', stylesheet.color);
        }
        
    } else {
        currTarget = null;
        backgroundColorInput.value = '#000';
        borderColorInput.value = '#000';
        contentColorInput.value = '#000';
    }
});
const onColorChange = function(inputElem, setStyle){
    return () => {
        if(currTarget) {
            const newVal = inputElem.value;
            setStyle(currTarget.source.style, newVal);
            jframeInstance.postMessage(JSON.stringify({
                type: 'rerender',
                elements: [source.toPlainObject()],
            }));
            snapshot();
        }
    }
}
backgroundColorInput.addEventListener('change', onColorChange(backgroundColorInput, (sheet, val) => {
    sheet.backgroundColor = val
}));
borderColorInput.addEventListener('change', onColorChange(borderColorInput, (sheet, val) => {
    sheet.borderColor = val
}))
contentColorInput.addEventListener('change', onColorChange(contentColorInput, (sheet, val) => {
    console.log(val)
    sheet.color = val
}))

document.getElementById('applytoAll').addEventListener('click', () => {
    const filterTag = currTarget.source.tag;
    source.iterator((node) => {
        if(node.tag === filterTag) {
            node.style.backgroundColor = backgroundColorInput.value;
            node.style.borderColor = borderColorInput.value;
            node.style.color = contentColorInput.value;
        }
    });
    jframeInstance.postMessage(JSON.stringify({
        type: 'rerender',
        elements: [source.toPlainObject()],
    }));
    snapshot();
})
function parseFloatOrZero(str) {
    return parseFloat(str) || 0;
}
// document.getElementById('resetMargin').addEventListener('click', () => {
//     const height = parseFloatOrZero(currTarget.height) + parseFloatOrZero(currTarget.source.style.marginTop) + parseFloatOrZero(currTarget.source.style.marginBottom)
//     const width = parseFloatOrZero(currTarget.width) + parseFloatOrZero(currTarget.source.style.marginLeft) + parseFloatOrZero(currTarget.source.style.marginRight)
//     Object.assign(currTarget.source.style, {
//         marginLeft: 0,
//         marginRight: 0,
//         marginTop: 0,
//         marginBottom: 0,
//         width: width + 'px',
//         hei: height + 'px',
//     });
//     jframeInstance.postMessage(JSON.stringify({
//         type: 'rerender',
//         elements: [source.toPlainObject()],
//     }));
//     snapshot();
// })

const astDialog = document.getElementById('astDialog');
const aststructure = document.getElementById('aststructure');
document.getElementById('astbtn').addEventListener('click', () => {
    astDialog.showModal()
    aststructure.value = JSON.stringify(source.toPlainObject(), null, "\t")
})
document.getElementById('confirmBtn').addEventListener('click', () => {
    try {
        const s = JSON.parse(aststructure.value);
        source = new Elem(s);
        jframeInstance.postMessage(JSON.stringify({
            type: 'rerender',
            elements: [source.toPlainObject()],
        }));
        snapshot();
    } catch(e) {
        alert("数据结构无法转成JSON")
    }
})