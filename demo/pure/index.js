import data from './data/data.json';
import JFrame from '../../src/core/jframe';
import '../../src/style/style.css';

const app = document.getElementById('app');
let id = 0;
class Elem {
    constructor(source) {
        this.id = id ++;
        this.concept = source.concept;
        this.tag = source.tag;
        this.props = source.props;
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
            props: this.props,
            children: this.children.map(e => e.toPlainObject()),
        }
    }
    delete() {
        if(this.parentElement) {
            const idx = this.parentElement.children.findIndex(e => e === this);
            console.log(idx);
            this.parentElement.children.splice(idx, 1);
        }
    }
}

const source = new Elem(data);
// const slotElement = ['UlElement', 'LiElement'];
// class BlockManager {
//     constructor(source) {
//         this.root = source;
//     }

//     renderBlock(jframe) {
//         function render(e) {
//             const elem = jframe.getRenderElement(`[data-id="${e.id}"]`);
//             if(elem){
//                 jframe.renderBlock(e, elem);
//             }
//             e.children.forEach(c => { render(c); })
//         }
//         this.elements.forEach(e => {
//             render(e);
//         });
//     }

//     getRoot() {
//         return this.root;
//     }
    
//     bindElement(source) {
//         return jframe.getRenderElement(`[data-id="${source.id}"]`);
//     }

//     getSourceChildren(source) {
//         return source.children;
//     }

//     getSourceParent(source) {
//         return source.parentElement;
//     }

//     hasSlot(source) {
//         return slotElement.includes(source.tag);
//     }

    
// }

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
        return ['UlElement', 'LiElement', 'DivElement'].includes(source.tag);
    },
    inlineElement(source) {
        return ['TextElement'].includes(source.tag);
    },
    blockElement(source){
        return ['UlElement', 'LiElement', 'DivElement'].includes(source.tag);
    }
}

const indicatorElem = document.createElement('div');
indicatorElem.setAttribute('style', 'transform: translateY(-100%);position: absolute;background: #fff;color: #4e75ec;')
const textContent = document.createElement('span');
indicatorElem.appendChild(textContent);
function renderElem(x, y, content) {
    indicatorElem.style.left = `${x}px`;
    indicatorElem.style.top = `${y}px`;
    textContent.innerText = content;
}

const focusElem = document.createElement('div')
focusElem.setAttribute('style', 'transform: translateY(-100%);position: absolute;background: #4e75ec;color: #fff;')
const focusContent = document.createElement('span');
focusElem.appendChild(focusContent);
function renderFocusElem(x, y, content) {
    focusElem.style.left = `${x}px`;
    focusElem.style.top = `${y}px`;
    focusContent.innerText = content;
}

let currentInstance;

const jframeInstance = new JFrame({
    frameURL: "http://localhost:8080/vueproj.html",
    dataElemDescription,
    hoverIndicator: indicatorElem,
    focusIndicator: focusElem,
    // dataElementBind(d, elem) {
    //     return elem.getAttribute('data-id') === d.id;
    // }
})
jframeInstance.addEventListener('frameloaded', () => {
    console.log(JSON.stringify(data))
    jframeInstance.postMessage(JSON.stringify({
        type: 'rerender',
        elements: [source.toPlainObject()],
    }));
})
jframeInstance.addEventListener('elementHover', (e) => {
    const { target } = e.detail;
    if(target) {
        renderElem(target.x, target.y, target.source.tag);
    } 
})
jframeInstance.addEventListener('elementFocus', (e) => {
    const { target } = e.detail;
    if(target) {
        renderFocusElem(target.x, target.y, target.source.tag);
    } 
})
jframeInstance.addEventListener('elementdrop', (e) => {
    const { source: sdata, childIdx, target } = e.detail;
    if(target) {
        if(sdata === target) return;
        target.delete();
        sdata.children.splice(childIdx, 0, target);
        target.parentElement = sdata;
    } else {
        if(sdata === currentInstance) return;
        sdata.children.splice(childIdx, 0, currentInstance);
        currentInstance.parentElement = sdata;
    }
    
    console.log(source.toPlainObject())
    jframeInstance.postMessage(JSON.stringify({
        type: 'rerender',
        elements: [source.toPlainObject()],
    }));
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
DivElementTool.addEventListener('dragstart', function() {
    dragstart(new Elem({
        concept: 'ViewElement',
        tag: 'DivElement',
    }))
})
UlElementTool.addEventListener('dragstart', function() {
    dragstart(new Elem({
        concept: 'ViewElement',
        tag: 'UlElement',
    }))
})
LiElementTool.addEventListener('dragstart', function() {
    dragstart(new Elem({
        concept: 'ViewElement',
        tag: 'LiElement',
    }))
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
