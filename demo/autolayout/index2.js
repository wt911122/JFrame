// import data from './data/data-flex.json';
import data from './data/data4.json';
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
                if(Array.isArray(c[k])) {
                    c[k].forEach(t => {
                        if(t.target === name) {
                            dependencies.push({
                                component,
                                constraint: k,
                            });
                        }
                    })
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
                    if(Array.isArray(c[k])) {
                        c[k].forEach(t => {
                            const r = inDependency(t.target, t.attr);
                            if(r && !inDependency(component, k)) {
                                dependencies.push({
                                    component,
                                    constraint: k,
                                });
                                flag = true;
                            }
                        })
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
        const constraints = {
                component: name,
                left: [{
                    target: "",
                    attr: "const",
                    operator: "",
                    value: p[0],
                    relation: "Eq"
                }],
                top: [{
                    target: "",
                    attr: "const",
                    operator: "",
                    value: p[1],
                    relation: "Eq"
                }],
                width: [{
                    target: "",
                    attr: "const",
                    operator: "",
                    value: 200,
                    relation: "Eq"
                }],
                height: [{
                    target: "",
                    attr: "const",
                    operator: "",
                    value: 80,
                    relation: "Eq"
                }],
            }
        
        if(currentInstance.tag === "IntrisicView") {
            constraints.width = 'intrisic';
            constraints.height = 'intrisic';
        }
        source.props.constraints.push(constraints);
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
const IntrisicViewTool = document.getElementById('IntrisicView');
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

IntrisicViewTool.addEventListener('dragstart', function() {
    currentInstance = (new Elem({
        concept: 'ViewElement',
        tag: 'IntrisicView',
        title: '内宽高',
        props: {
            name: `IntrisicView-${viewid++}`,
            constraints: [],
        }
    }))
    console.log(currentInstance)
})
IntrisicViewTool.addEventListener('dragend', function() {
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

const dimensionMapping = {
    top: ctop, left: cleft, right: cright, bottom: cbottom,
    width: cwidth, height: cheight, centerX: centerx, centerY: centery,
}

const imageBtn = document.getElementById('background-confirm');
const imageAddr = document.getElementById('imageAddr');
imageBtn.addEventListener('click', () => {
    if(focusedTarget) {
        focusedTarget.source.style['background-image'] = `url(${imageAddr.value})`;
        _rerenderJframeInstance();
    }
})

function setElem(el, value, isDefault, disabled, isIntrisic) {
    el.innerText = value.toFixed(0);
    el.classList.toggle('active', !isDefault);
    console.log(isIntrisic)
    el.classList.toggle('intrisic', !!isIntrisic);
    el.setAttribute('disabled', !!disabled);
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
        setElem(cwidth, bounding.width.value, bounding.width.isDefault, source.props.intrisicWidth, bounding.width.def === "intrisic");
        setElem(cheight, bounding.height.value, bounding.height.isDefault, source.props.intrisicHeight, bounding.height.def === "intrisic");
        setElem(centerx, bounding.centerX.value, bounding.centerX.isDefault);
        setElem(centery, bounding.centerY.value, bounding.centerY.isDefault);
        if(currDimension) {
            dimensionMapping[currDimension].click();
        }
    }
}
const nestedControlPanel = document.querySelector('.nestedControlPanel');

function createWrapper(target, content) {
    const div = document.createElement('div');
    div.append(content, target);
    return div;
}
function genDefControls(isLast) {
    const operatorElem = document.createElement('select');
    operatorElem.innerHTML = `
        <option value="Eq">等于</option>
        <option value="Ge">大于等于</option>
        <option value="Le">小于等于</option>
    `
    const controlTarget = document.createElement('select');
    
    const controlAttribute = document.createElement('select');
    controlAttribute.innerHTML = ` <option value="const">绝对值</option>
        <option value="left">左边距</option>
        <option value="leftedge">左边缘</option>
        <option value="right">右边距</option>
        <option value="rightedge">右边缘</option>
        <option value="top">上边距</option>
        <option value="topedge">上边缘</option>
        <option value="bottom">下边距</option>
        <option value="bottomedge">下边缘</option>
        <option value="width">宽度</option>
        <option value="height">高度</option>
        <option value="centerX">中心X</option>
        <option value="centerY">中心Y</option>`
    const controlOperator = document.createElement('select');
    controlOperator.innerHTML = `
        <option value="">绝对值</option>
        <option value="plus">加</option>
        <option value="minus">减</option>
        <option value="multiply">乘</option>
        <option value="divide">除</option>
    `
    const controlValue = document.createElement('input');
   
    const wrapper = document.createElement('div');
    wrapper.classList.add('nestedControlPanel');

    wrapper.append(
        createWrapper(operatorElem, '关系'),
        createWrapper(controlTarget, '对象'),
        createWrapper(controlAttribute, '属性'),
        createWrapper(controlOperator, ''),
        createWrapper(controlValue, ''));
    
    let deleteButton;
    if(!isLast) {
        deleteButton = document.createElement('button');
        deleteButton.innerText = '删除'
        wrapper.append(
            createWrapper(deleteButton, '')
        )
    }
    return {
        wrapper,
        operatorElem,
        controlTarget,
        controlAttribute,
        controlOperator,
        controlValue,
        deleteButton,
    };

}

// const controlTarget = document.querySelector('#control-target');
// const controlAttribute = document.querySelector('#control-attribute');
// const controlOperator = document.querySelector('#control-operator');
// const controlValue = document.querySelector('#control-value');
const controlConfirm = document.querySelector('#control-confirm');
const nestedControlPanelwrapper = document.getElementById('nestedControlPanelwrapper');
const dimensionLabel = document.getElementById('dimensionLabel');
let currDimension
let ruleElemList = [];
let autoLayoutMode = 'normal';
let isCurrIntrisic = false;

function genIntrisicRadiogenIntrisicRadio(onChange) {
    const a = document.createElement('input');
    a.setAttribute('type', "radio");
    a.setAttribute('name', "mode");
    a.setAttribute('value', "normal");
    const alabel = document.createElement('label');
    alabel.setAttribute('for', 'normal');
    alabel.innerText = '外部';

    a.addEventListener('click', () => {
        autoLayoutMode = a.value;
        onChange(a.value);
    })

    const b = document.createElement('input');
    b.setAttribute('type', "radio");
    b.setAttribute('name', "mode");
    b.setAttribute('value', "intrisic");
    b.innerHTML = `<label for="intrisic">内部</label>`
    const blabel = document.createElement('label');
    blabel.setAttribute('for', 'intrisic');
    blabel.innerText = '内部';
    b.addEventListener('click', () => {
        autoLayoutMode = b.value;
        onChange(b.value);
    })

    const div = document.createElement('div');
    div.append(a, alabel, b, blabel);
    return {
        a, b, div,
    }

}

function genElement(bounding, innerTargets) {
    const def = bounding.def || [];
    const isLast = def.length === 1;
    def.forEach((_def, idx) => {
        const {
            wrapper,
            operatorElem,
            controlTarget,
            controlAttribute,
            controlOperator,
            controlValue,
            deleteButton
        } = genDefControls(isLast);
        controlTarget.innerHTML = innerTargets;
        nestedControlPanelwrapper.append(wrapper);
        operatorElem.value = _def.relation;
        controlTarget.value = _def.target;
        controlAttribute.value = _def.attr;
        controlOperator.value = _def.operator;
        controlValue.value = _def.value;
        const t = () => {
            return {
                relation: operatorElem.value,
                target: controlTarget.value,
                attr: controlAttribute.value,
                operator: controlOperator.value,
                value: controlValue.value,
            }
        };
        ruleElemList.push(t)
        if(deleteButton){
            deleteButton.addEventListener('click', () => {
                const idx = ruleElemList.findIndex(q => q === t);
                if(idx !== -1) {
                    ruleElemList.splice(idx, 1);
                    wrapper.remove()
                }
            })
        }
        
    })
}

function genNewRuleElement(innerTargets) {
    const {
        wrapper,
        operatorElem,
        controlTarget,
        controlAttribute,
        controlOperator,
        controlValue,
        deleteButton
    } = genDefControls(ruleElemList.length === 0);
    controlTarget.innerHTML = innerTargets;
    nestedControlPanelwrapper.append(wrapper);
    operatorElem.value = 'Eq';
    controlTarget.value = '';
    controlAttribute.value = 'const';
    controlOperator.value = '';
    controlValue.value = '';
    const t = () => {
        return {
            relation: operatorElem.value,
            target: controlTarget.value,
            attr: controlAttribute.value,
            operator: controlOperator.value,
            value: controlValue.value,
        }
    };
    ruleElemList.push(t)
    if(deleteButton){
        deleteButton.addEventListener('click', () => {
            const idx = ruleElemList.findIndex(q => q === t);
            if(idx !== -1) {
                ruleElemList.splice(idx, 1);
                wrapper.remove()
            }
        })
    }
}
function bindListeners(target, dimension) {
    target.addEventListener('click', () => {
        ruleElemList = [];
        autoLayoutMode = '';
        nestedControlPanelwrapper.innerHTML = "";
        if(target.getAttribute('disabled') === 'true') {
            return;
        }
        if(focusedTarget) {
            const source = focusedTarget.source;
            const element = jframeInstance.source_block_element_map.getElementBySource(source.parentElement);
            const cInstance = element?._constraints_;
            if(source.tag === 'AutoLayoutComponent') {
                currDimension = dimension;
                const useIntrisic = target.classList.contains('intrisic');
                isCurrIntrisic = useIntrisic;
                const el = jframeInstance.source_block_element_map.getElementBySource(source);
                const elInstance = el?._constraints_;


                function _intrisicElem() {
                    const innerNames = source.props.constraints.map(c => c.component).filter(c => c !== '|');
                    const innerTargets = innerNames.map(n => `<option value="${n}">${n}</option>`).join('') + '<option value="">绝对值</option>';
                    const bounding = elInstance.getBounding(dimension);
                    genElement(bounding, innerTargets);
                }
                function _normalElem() {
                    const names = source.parentElement.props.constraints.map(c => c.component);
                    const bounding = cInstance.getViewConstraintBounding(source.props.name);
                    const d = bounding[dimension];
                    const targetsTemplate = names.map(n => `<option value="${n}">${n}</option>`).join('') + '<option value="">绝对值</option>' + '<option value="|">父级</option>';
                    if(!d.isDefault && d.def !== 'intrisic') {
                        genElement(d, targetsTemplate) 
                    } 
                }
                if(dimension === 'width' || dimension === 'height') {
                    const { a, b, div } = genIntrisicRadiogenIntrisicRadio((value) => {
                        nestedControlPanelwrapper.innerHTML = "";
                        ruleElemList = [];
                        nestedControlPanelwrapper.append(div);
                        if(value === 'intrisic') {
                            _intrisicElem();
                        } else {
                            _normalElem();
                        }

                    });
                    dimensionLabel.innerText = dimension;
                    nestedControlPanelwrapper.append(div);
                    if(useIntrisic) {
                        autoLayoutMode = b.value;
                        b.setAttribute('checked', true);
                    } else {
                        autoLayoutMode = a.value;
                        a.setAttribute('checked', true);
                    }
                }
                
                
                if(useIntrisic && elInstance) {
                    _intrisicElem();
                } else {
                    _normalElem();
                }

                return;
                
            }
            if(cInstance) {
                const names = source.parentElement.props.constraints.map(c => c.component);
                const bounding = cInstance.getViewConstraintBounding(source.props.name);
                const d = bounding[dimension];
                currDimension = dimension;
                dimensionLabel.innerText = currDimension;
                nestedControlPanel.classList.toggle('active', !d.isDefault)
                const targetsTemplate = names.map(n => `<option value="${n}">${n}</option>`).join('') + '<option value="">绝对值</option>' + '<option value="|">父级</option>';
                if(!d.isDefault) {
                    genElement(d, targetsTemplate) 
                } 
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
        // const target = controlTarget.value;
        // const attr = controlAttribute.value;
        // const operator = controlOperator.value;
        // const value = controlValue.value;
        const constraints = ruleElemList.map(getValue => getValue())
            .map(v => {
                if(v.attr === 'const' && v.value) {
                    return {
                        target: "",
                        attr: "const",
                        operator: "",
                        value: parseFloat(v.value),
                        relation: v.relation
                    }
                } else if(v.target && v.operator && v.value) {
                    return {
                        target: v.target,
                        attr: v.attr,
                        operator: v.operator,
                        value: parseFloat(v.value),
                        relation: v.relation
                    }
                }
            }).filter(i => !!i);
        set(focusedTarget, currDimension, constraints)
    }

})

function getLayoutInstance(source) {
    const el = jframeInstance.source_block_element_map.getElementBySource(source);
    const elInstance = el?._constraints_;
    return elInstance;
}

function set(elem, d, def) {
    const source = elem.source;
    if(source.tag === 'AutoLayoutComponent') {
        console.log(isCurrIntrisic);
        if(autoLayoutMode === 'intrisic') {
            const elInstance = getLayoutInstance(source);
            if(elInstance) {
                elInstance.setSelfConstraint('intrisic', d, def);
                const newConstraints = elInstance.getSelfConstraint();
                console.log(newConstraints)
                const cs = source.props.constraints;
                const idx = cs.findIndex(c => c.component === newConstraints.component);
                if(idx === -1) {
                    cs.push(newConstraints);
                } else {
                    cs.splice(idx, 1, newConstraints)
                }
                elInstance.reflow();
                elInstance.resize();
            }
            if(!isCurrIntrisic) {
                setConstraintOnView(elem, d, 'intrisic')
            } 
            focusConstaintView(elem);
        } else {
            if(isCurrIntrisic) {
                const elInstance = getLayoutInstance(source);
                if(elInstance) {
                    elInstance.setSelfConstraint('normal', d, def);
                    const newConstraints = elInstance.getSelfConstraint();
                    const cs = source.props.constraints;
                    const idx = cs.findIndex(c => c.component === '|');
                    if(newConstraints) {
                        cs.splice(idx, 1, newConstraints)
                    } else {
                        cs.splice(idx, 1)
                    }
                    
                    elInstance.reflow();
                }
            }
            setConstraintOnView(elem, d, def)
        }
        return;
    }
    setConstraintOnView(elem, d, def)
}

function setConstraintOnView(elem, d, def) {
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

const addRuleBtn = document.getElementById('add-rule');
addRuleBtn.addEventListener('click', () => {
    if(focusedTarget && currDimension) {
        const source = focusedTarget.source;
        if(source.tag === 'AutoLayoutComponent') {

            if(currDimension === 'width' || currDimension === 'height') {
                if(autoLayoutMode === 'intrisic') {
                    const innerNames = source.props.constraints.map(c => c.component).filter(c => c !== '|');
                    const innerTargets = innerNames.map(n => `<option value="${n}">${n}</option>`).join('') + '<option value="">绝对值</option>';
                    genNewRuleElement(innerTargets);
                    return;
                }
            }
           
        }
       
        // const defs = source.props.constraints[currDimension];
        const names = source.parentElement.props.constraints.map(c => c.component);
        const targetsTemplate = names.map(n => `<option value="${n}">${n}</option>`).join('') + '<option value="">绝对值</option>' + '<option value="|">父级</option>';
        genNewRuleElement(targetsTemplate);

    }
})



