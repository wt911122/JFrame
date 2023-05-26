// import data from './data/data-flex.json';
import data from './data/data.json';
import JFrame, { 
    BlockTitle,
    BlockDelete
} from '../../src/c/jframe';
import '../../src/c/style.css';
const app = document.getElementById('app');
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
    delete() {
        if(this.parentElement) {
            const idx = this.parentElement.children.findIndex(e => e === this);
            if(idx !== -1) {
                this.parentElement.children.splice(idx, 1);
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
        const p = [(point[0] - target.x).toFixed(0), (point[1] - target.y).toFixed(0)];
        const constraints = [
            `H:|-${p[0]}-[${name}(200)]`,
            `V:|-${p[1]}-[${name}(80)]`,
            // `C:${name}.width(200)`,
            // `C:${name}.height(80)`,
        ]
        source.props.constraints = source.props.constraints.concat(constraints);
        console.log(source)
        source.addElement(currentInstance);
        _rerenderJframeInstance();
    }
})

jframeInstance.addEventListener('delete', e => {
    const { target } = e.detail;
    target.source.delete();
    _rerenderJframeInstance();
})

jframeInstance.$mount(app);

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
            name: `viewcontainer${viewid++}`,
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

const vfl = document.getElementById('vfl');
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
        

        if(target.source.tag === 'AutoLayoutComponent') {
            vfl.innerText = target.source.props.constraints.join('\n')
        } 
    }
});

const btnapplyvfl = document.getElementById('applyvfl');
btnapplyvfl.addEventListener('click', () => {
    const constraints = vfl.innerText.split(/\r?\n/).filter(t => t);
    if(focusedElem && focusedElem.tag === 'AutoLayoutComponent') {
        focusedElem.props.constraints = constraints;
        _rerenderJframeInstance();
    }
})