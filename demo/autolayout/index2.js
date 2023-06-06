// import data from './data/data-flex.json';
import data from './data/data2.json';
import JFrame, { 
    BlockTitle,
    BlockDelete
} from '../../src/c/jframe';
import '../../src/c/style.css';
const app = document.getElementById('app');

function resolveDependencies(name, remainConstraints) {
    const dependencies = [];

    function inDependency(c, ct) {
        return !!dependencies.find(d => d.component === c && d.constraint === ct);
    }
    remainConstraints.forEach(c => {
        const component = c.component;
        Object.keys(c).forEach(k => {
            if(k !== 'component') {
                if(c[k].target === name) {
                    dependencies.push({
                        component,
                        constraint: k,
                    });
                }
            }
        });
    });
    let flag = true;
    while(flag) {
        flag = false
        remainConstraints.forEach(c => {
            const component = c.component;
            Object.keys(c).forEach(k => {
                if(k !== 'component') {
                    const cc = c[k];
                    const r = inDependency(cc.target, cc.attr);
                    if(r && !inDependency(component, k)) {
                        dependencies.push({
                            component,
                            constraint: k,
                        });
                        flag = true;
                    }
                }
            });
        })
    }

    console.log(dependencies)
    return dependencies;
    
}
let id = 0;
class Elem {
    constructor(source) {
        this.id = id ++;
        this.concept = source.concept;
        this.tag = source.tag;
        this.title = source.title;
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
    addElement(el) {
        this.children.push(el);
        el.parentElement = this;
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
    delete(callback) {
        if(this.parentElement) {
            const idx = this.parentElement.children.findIndex(e => e === this);
            if(idx !== -1) {
                this.parentElement.children.splice(idx, 1);
                if(this.parentElement.tag === 'AutoLayoutComponent') {
                    const parentElement = this.parentElement;
                    const name = this.props.name;
                    const cs = this.parentElement.props.constraints;
                    const index = cs.findIndex(c => c.component === name);
                    if(index !== -1) {
                        cs.splice(index, 1);
                        const dependences = resolveDependencies(name, cs);
                        callback(dependences, parentElement)
                    }
                    
                }
            }
            return idx;
        }
    }
    iterator(cb) {
        cb(this);
        this.children.forEach(c => {
            c.iterator(cb)
        })
    }

    toStackHTML(path = '') {
        if(this.parentElement) {
            const idx = this.parentElement.children.findIndex(e => e === this);
            path+=` ${idx} `
        }
        let html = `<div class="stackitem"><span path="${path}">${this.props.name}</span>`;
        
        
        if(this.children.length) {
            html += this.children.map(c => c.toStackHTML(path)).join('\n')
        }
        html += '</div>'
        return html
    }
}

const source = new Elem(data);

function getElement(path) {
    const p = path.split(/\s+/).filter(s => s);
    let s = source
    while(p.length) {
        const idx = p.shift();
        console.log(idx)
        s = s.children[idx];
    }
    return s;
}

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
        return ['AutoLayoutComponent'].includes(source.tag);
    },
    inlineElement(source) {
        return ['TextElement', 'BtnElement'].includes(source.tag);
    },
    blockElement(source){
        return ['DivElement', 'AutoLayoutComponent'].includes(source.tag);
    },
    draggable(source) {
        return source.tag !== 'AutoLayoutComponent';
    },
    splitable(source){
        return false
    },
    getSplitableDiretion(source) {
        return source.props.direction;
    }
}

const frameURL = `${window.location.origin}${window.location.pathname}vueproj.html`;

const jframeInstance = new JFrame({
    frameURL,
    dataElemDescription,
    simulatorWidth: 1200,
    simulatorHeight: 600,
    toolbox: {
        tools: [
            new BlockTitle(),
            new BlockDelete(),
            // new BlockSize({
            //     editable(targetBlock) {
            //         if(SPLITABLE(targetBlock.source)) {
            //             return !targetBlock.source.parentElement;
            //         }
            //         return true;
            //     },
            // }),
        ]
    }
});


const simulatorW = document.getElementById('simulatorW');
const simulatorH = document.getElementById('simulatorH');
const setSimulator = document.getElementById('setSimulator');

function refreshSimulator() {
    simulatorW.value = jframeInstance.IFM.rootWidth;
    simulatorH.value = jframeInstance.IFM.rootHeight;
}

setSimulator.addEventListener('click', () => {
    jframeInstance.IFM.resetFrameHorizontalBoundrary(simulatorW.value);
    jframeInstance.IFM.resetFrameVerticalBoundrary(simulatorH.value);
})

const stackContainer = document.getElementById('stackContainer');
stackContainer.addEventListener('click', (e) => {
    if(e.target.tagName === 'SPAN') {
        const path = e.target.getAttribute('path');
        
        const s = getElement(path);
        console.log(path, s)
        if(s) {
            const block = jframeInstance.source_block_element_map.getBlockBySource(s);
            jframeInstance.setFocusTarget(block)
        }
       
    }   
})

function _rerenderJframeInstance() {
    jframeInstance.postMessage(JSON.stringify({
        type: 'rerender',
        elements: [source.toPlainObject()],
    }));
    const html = source.toStackHTML();
    stackContainer.innerHTML = html;
    
}

jframeInstance.addEventListener('frameloaded', () => {
    _rerenderJframeInstance();
})

jframeInstance.addEventListener('drop', e => {
    console.log(e);
    const { target, point } = e.detail;
    const source = target.source;
    if(source.tag === 'AutoLayoutComponent') {
        const name = currentInstance.props.name
        const p = [parseInt(point[0] - target.x), parseInt(point[1] - target.y)];
        const constraints = [
            {
                component: name,
                left: {
                    target: "",
                    attr: "const",
                    operator: "",
                    value: p[0],
                    relation: "Eq"
                },
                top: {
                    target: "",
                    attr: "const",
                    operator: "",
                    value: p[1],
                    relation: "Eq"
                },
                width: {
                    target: "",
                    attr: "const",
                    operator: "",
                    value: 200,
                    relation: "Eq"
                },
                height: {
                    target: "",
                    attr: "const",
                    operator: "",
                    value: 80,
                    relation: "Eq"
                },
            }
        ]
        source.props.constraints = source.props.constraints.concat(constraints);
        console.log(source)
        source.addElement(currentInstance);
        _rerenderJframeInstance();
    }
})

jframeInstance.addEventListener('delete', e => {
    const { target } = e.detail;
    target.source.delete((dependencies, parentElement) => {
        const element = jframeInstance.source_block_element_map.getElementBySource(parentElement);
        const cInstance = element._constraints_;
        if(cInstance) {
            const components = new Set()
            dependencies.forEach(d => {
                const { component, constraint } = d;
                components.add(component);
                cInstance.resetConstaintOnview(component, constraint);
            });
            const cs = parentElement.props.constraints;
            for (const cname of components) {
                const idx = cs.findIndex(c => c.component === cname);
                cs.splice(idx, 1, cInstance.getViewConstraintJSON(cname));
            } 
        }
    });

    _rerenderJframeInstance();
    jframeInstance.setFocusTarget(null);
})

jframeInstance.$mount(app);
refreshSimulator();

let flag = false;
document.getElementById('toggleOverLayer').addEventListener('click', () => {
    jframeInstance.IFM.toggleOverLayer(flag);
    flag = !flag;
});


const AutoLayoutTool = document.getElementById('AutoLayout');

const ViewElementTool = document.getElementById('ViewElement');
let currentInstance;
let viewid = 0;
ViewElementTool.addEventListener('dragstart', function() {
    currentInstance = (new Elem({
        concept: 'ViewElement',
        tag: 'ViewContainer',
        title: '文本',
        props: {
            name: `viewcontainer-${viewid++}`,
        }
    }))
    console.log(currentInstance)
})
ViewElementTool.addEventListener('dragend', function() {
    currentInstance = null;
})
let layoutid = 0;
AutoLayoutTool.addEventListener('dragstart', function() {
    currentInstance = (new Elem({
        concept: 'ViewElement',
        tag: 'AutoLayoutComponent',
        title: '自动布局',
        props: {
            name: `autoLayout${layoutid++}`,
            constraints: [],
        }
    }))
    console.log(currentInstance)
})
AutoLayoutTool.addEventListener('dragend', function() {
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

// const vfl = document.getElementById('vfl');
let focusedElem = null;
jframeInstance.addEventListener('elementFocus', (e) => {
    layerIndicatorElem.innerHTML = '';
    const { target } = e.detail;
    if(target) {
        console.log(target)
        let s = target.source;
        focusedElem = s;
        let i = 0;
        while(s) {
            if(i !== 0) {
                layerIndicatorElem.prepend(" / ")
            }
            layerIndicatorElem.prepend(makeCrumb(s));
            i ++;
            s = s.parentElement;
        } 
        focusConstaintView(target);

        // if(target.source.tag === 'AutoLayoutComponent') {
        //     vfl.innerText = target.source.props.constraints.join('\n')
        // } 
    }
});



// const btnapplyvfl = document.getElementById('applyvfl');
// btnapplyvfl.addEventListener('click', () => {
//     const constraints = vfl.innerText.split(/\r?\n/).filter(t => t);
//     if(focusedElem && focusedElem.tag === 'AutoLayoutComponent') {
//         focusedElem.props.constraints = constraints;
//         _rerenderJframeInstance();
//     }
// })

const controlPanel = document.querySelector('.controlpanel');
const ctop = controlPanel.querySelector('.top');
const cleft = controlPanel.querySelector('.left');
const cright = controlPanel.querySelector('.right');
const cbottom = controlPanel.querySelector('.bottom');
const cwidth = controlPanel.querySelector('.center > .width');
const cheight = controlPanel.querySelector('.center > .height');
const centerx = controlPanel.querySelector('.center > .centerx');
const centery = controlPanel.querySelector('.center > .centery');

const imageBtn = document.getElementById('background-confirm');
const imageAddr = document.getElementById('imageAddr');
imageBtn.addEventListener('click', () => {
    if(focusedTarget) {
        focusedTarget.source.style['background-image'] = `url(${imageAddr.value})`;
        _rerenderJframeInstance();
    }
})

function setElem(el, value, isDefault) {
    el.innerText = value.toFixed(0);
    el.classList.toggle('active', !isDefault);
}
let focusedTarget
function focusConstaintView(target) {
    const source = target.source;
    focusedTarget = target;
    const element = jframeInstance.source_block_element_map.getElementBySource(source.parentElement);
    const cInstance = element?._constraints_;
    imageAddr.value = focusedTarget.source.style?.['background-image'] || ''
    console.log(cInstance)
    if(cInstance) {
        const bounding = cInstance.getViewConstraintBounding(source.props.name);
        // source.props.constraints = [newConstraints];
        console.log(bounding)
        setElem(ctop, bounding.top.value, bounding.top.isDefault);
        setElem(cleft, bounding.left.value, bounding.left.isDefault);
        setElem(cright, bounding.right.value, bounding.right.isDefault);
        setElem(cbottom, bounding.bottom.value, bounding.bottom.isDefault);
        setElem(cwidth, bounding.width.value, bounding.width.isDefault);
        setElem(cheight, bounding.height.value, bounding.height.isDefault);
        setElem(centerx, bounding.centerX.value, bounding.centerX.isDefault);
        setElem(centery, bounding.centerY.value, bounding.centerY.isDefault);
    }
}
const nestedControlPanel = document.querySelector('.nestedControlPanel');
const controlTarget = document.querySelector('#control-target');
const controlAttribute = document.querySelector('#control-attribute');
const controlOperator = document.querySelector('#control-operator');
const controlValue = document.querySelector('#control-value');
const controlConfirm = document.querySelector('#control-confirm');

let currDimension
function bindListeners(target, dimension) {
    target.addEventListener('click', () => {
        if(focusedTarget) {
            const source = focusedTarget.source;
            const element = jframeInstance.source_block_element_map.getElementBySource(source.parentElement);
            const cInstance = element?._constraints_;
            console.log(cInstance)
            if(cInstance) {
                const names = source.parentElement.props.constraints.map(c => c.component);
                console.log(names);
                const bounding = cInstance.getViewConstraintBounding(source.props.name);
                const d = bounding[dimension];
                currDimension = dimension;
                nestedControlPanel.classList.toggle('active', !d.isDefault)
                controlTarget.innerHTML = names.map(n => `<option value="${n}">${n}</option>`).join('') + '<option value="">绝对值</option>' + '<option value="|">父级</option>';
                if(!d.isDefault) {
                    const def = d.def;
                    controlTarget.value = def.target;
                    controlAttribute.value = def.attr;
                    controlOperator.value = def.operator;
                    controlValue.value = def.value
                } else {
                    controlTarget.value = ''
                    controlAttribute.value = 'const'
                    controlOperator.value = ''
                    controlValue.value = ''
                }
                console.log(d)
            }
        }
    })
}

bindListeners(ctop, 'top');
bindListeners(cleft, 'left');
bindListeners(cright, 'right');
bindListeners(cbottom, 'bottom');
bindListeners(cwidth, 'width');
bindListeners(cheight, 'height');
bindListeners(centerx, 'centerX');
bindListeners(centery, 'centerY');

controlConfirm.addEventListener('click', () => {
    if(focusedTarget) {
        const target = controlTarget.value;
        const attr = controlAttribute.value;
        const operator = controlOperator.value;
        const value = controlValue.value;
        if(value && currDimension) {
            if(attr === 'const') {
                set(focusedTarget, currDimension, {
                    target: "",
                    attr: "const",
                    operator: "",
                    value: parseFloat(value),
                    relation: "Eq"
                })
            } else if(target && operator){
                set(focusedTarget, currDimension, {
                    target,
                    attr,
                    operator,
                    value: parseFloat(value),
                    relation: "Eq"
                })
            }
        }
    }

})

function set(elem, d, def) {
    const source = elem.source;
    const element = jframeInstance.source_block_element_map.getElementBySource(source.parentElement);
    const cInstance = element._constraints_;
    if(cInstance) {
        const parent = source.parentElement
        const newConstraints = cInstance.setConstraintOnView(source.props.name, d, def);
        // console.log(newConstraints)
        const cs = parent.props.constraints;
        const idx = cs.findIndex(c => c.component === source.props.name);
        cs.splice(idx, 1, newConstraints)
        focusConstaintView(elem);
    }
}


