
class IFrameManager {
    constructor(dom, configs = {}) {
        const wrapper = document.createElement('div');
        wrapper.setAttribute('style', `
            position: relative;
            width: 100%;
            height: 100%;
            background-color: #fff;
            left:0;
            top:0;
            user-select: none;
            overflow:hidden;
            background: rgba(0,0,0,0.1);
            `);
        const iframe = document.createElement('iframe');
        iframe.setAttribute('style', `
            position: absolute;
            top:0;
            left: 0;
            transform-origin: top left;
            width: 100%;
            overflow: hidden;
            border: 2px solid transparent;
            background: #fff;
            user-select: none;`);
        iframe.setAttribute('scrolling', "no");
        const overLayer = document.createElement('div');
        overLayer.setAttribute('class', 'jframe-overlayer');
        dom.setAttribute("style", `
            position: relative;
            background-color: #fff;
            overflow: hidden
            user-select: none;`);
        const mask = document.createElement('div');
        mask.setAttribute('style', `
            position: absolute;
            top: -10px;
            bottom:-10px;
            left:-10px;
            right:-10px;
            user-select: none;`);
        const fence = document.createElement('div');
        fence.setAttribute('class', 'jframe-fence');

        const toolbox = document.createElement('div');
        toolbox.setAttribute('class', 'jframe-toolbox');
        const blockTool = document.createElement('div');
        blockTool.setAttribute('class', 'jframe-blocktool')

        const jframeTool = document.createElement('div');
        jframeTool.setAttribute('class', 'jframe-frametool')

        overLayer.appendChild(fence);
        overLayer.appendChild(mask);
        overLayer.appendChild(toolbox);
        overLayer.appendChild(blockTool);
        overLayer.appendChild(jframeTool);
        wrapper.appendChild(iframe);
        wrapper.appendChild(overLayer); 
        
        // const {
        //     hoverIndicator,
        //     focusIndicator
        // } = configs;
        // if(hoverIndicator) {
        //     hoverIndicator.style.display = 'none';
        //     overLayer.appendChild(hoverIndicator);
        // }
    
        // if(focusIndicator) {
        //     focusIndicator.style.display = 'none';
        //     overLayer.appendChild(focusIndicator);
        // }
        dom.appendChild(wrapper);


        this.iframe = iframe;
        this.overLayer = overLayer;
        this.dom = dom;
        this.wrapper = wrapper;
        this.fence = fence;
        this.toolbox = toolbox;
        this.blockTool = blockTool;
        this.jframeTool = jframeTool;
        // this.blockToolFragment = blockToolFragment;
        // this.hoverIndicator = hoverIndicator;
        // this.focusIndicator = focusIndicator;
    }

    renderHorizontalFence(tx, ty, width) {
        this.fence.style.display = 'block';
        this.fence.style.transition = `width .3s, transform .3s`;
        this.fence.style.transform = `translate(${tx}px, ${ty}px)`;
        this.fence.style.height = '0px';
        this.fence.style.width = `${width}px`;
    }

    renderVerticalFence(tx, ty, height) {
        this.fence.style.display = 'block';
        this.fence.style.transition = `height .3s, transform .3s`;
        this.fence.style.transform = `translate(${tx}px, ${ty}px)`;
        this.fence.style.height = `${height}px`;
        this.fence.style.width = `0px`;
    }

    hideClosestFence() {
        this.fence.style.display = 'none';
    }

    setFenceAccept(val) {
        if(val) {
            this.fence.setAttribute('accept', val);
        } else {
            this.fence.removeAttribute('accept');
        }
    }

    refreshToolWrapper(block) {
        const { x, y } = block;
        this.toolbox.style.left = `${x}px`;
        this.toolbox.style.top = `${y}px`;
        this.blockTool.style.left = `${x}px`;
        this.blockTool.style.top = `${y}px`;
    }

    toggleTools(val, block) {
        if(val) {
            const { x, y } = block;
            this.toolbox.style.left = `${x}px`;
            this.toolbox.style.top = `${y}px`;
            this.blockTool.style.left = `${x}px`;
            this.blockTool.style.top = `${y}px`;
            this.toolbox.style.display = 'block';
            this.blockTool.style.display = 'block';
        } else {
            this.toolbox.style.display = 'none';
            this.blockTool.style.display = 'none';
        }
        this.toolbox.innerHTML = '';
        this.blockTool.innerHTML = '';
    }

    // toggleHoverIndicator(state) {
    //     if(this.hoverIndicator){
    //         this.hoverIndicator.style.display = state ? 'block' : 'none';
    //     }
    // }

    // toggleHoverIndicator(state) {
    //     if(this.hoverIndicator){
    //         this.hoverIndicator.style.display = state ? 'block' : 'none';
    //     }
    // }

    /* resetFrameBoundrary(){
        const innerDoc = this.iframe.contentWindow.document;
        const body = innerDoc.body;
        const html = innerDoc.documentElement;
        const height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
        const width = Math.max(body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth);
        this.iframe.style.height = height + 'px';
        this.iframe.style.width = width + 'px';
        this.overLayer.style.height = height + 'px';
        this.overLayer.style.width = width +'px';
    }

    resetFrameVerticalBoundrary() {
        const innerDoc = this.iframe.contentWindow.document;
        const body = innerDoc.body;
        const html = innerDoc.documentElement;
        const height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
        this.iframe.style.height = height + 'px';
        this.overLayer.style.height = height + 'px';
    } */

    // resetFrameHorizontalBoundrary() {
    //     const innerDoc = this.iframe.contentWindow.document;
    //     const body = innerDoc.body;
    //     const html = innerDoc.documentElement;
    //     const width = Math.max(body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth);
    //     this.iframe.style.width = width + 'px';
    //     this.overLayer.style.width = width +'px';
    // }

    // resetFrameVerticalBoundrary() {
    //     const innerDoc = this.iframe.contentWindow.document;
    //     const body = innerDoc.body;
    //     const html = innerDoc.documentElement;
    //     const height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
    //     this.iframe.style.height = height + 'px';
    //     this.overLayer.style.height = height + 'px';
    // }

    observe(rootElem) {
        const observer = new ResizeObserver(() => {
            const bounding = rootElem.getBoundingClientRect();
            const styleSheet = window.getComputedStyle(rootElem);
            const w = bounding.width + (parseFloat(styleSheet.marginLeft) || 0) + (parseFloat(styleSheet.marginRight) || 0);
            const h = bounding.height + (parseFloat(styleSheet.marginBottom) || 0) + (parseFloat(styleSheet.marginTop) || 0);
            this.resetFrameHorizontalBoundrary(w);
            this.resetFrameVerticalBoundrary(h);
        });
        observer.observe(rootElem);
        this._observer = observer;
    }

    resetFrameHorizontalBoundrary(width) {
        this.iframe.style.width = width + 'px';
        this.overLayer.style.width = width +'px';
    }

     resetFrameVerticalBoundrary(height) {
        this.iframe.style.height = height + 'px';
        this.overLayer.style.height = height + 'px';
    }

    querySelector(selector) {
        return this.iframe.contentDocument.querySelector(selector);
    }
    postMessage(message, url) {
        this.iframe.contentWindow.postMessage(message, this.frameURL);
    }

    get domClientRect() {
        return this.dom.getBoundingClientRect();
    }

    toggleBlockHoverStyle(val) {
        this.overLayer.setAttribute('disablehover', val);
    }
    
    toggleOverLayer(val) {
        if(val) {
            this.overLayer.style.display = 'block';
        } else {
            this.overLayer.style.display = 'none';
        }
    }
    
}


export default IFrameManager;