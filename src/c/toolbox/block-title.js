import Tool from './tool'

class BlockTitle extends Tool {
    renderToolbox(targetBlock, appendChild) {
        const { jframe, source } = targetBlock
        const wrapper = document.createElement('span');
        wrapper.setAttribute('class', 'jframe-title-wrapper');
       
        let parent = source
        let idx = 0;
        while(parent) {
            const block = jframe.source_block_element_map.getBlockBySource(parent);
            const el = document.createElement('span');
            el.setAttribute('class', 'jframe-title');
            el.innerText = block.source.props.name || block.source.tag;
            const isFirst = (idx === 0);
            if(isFirst) {
                el.setAttribute('first-title', true);
            }
            el.addEventListener('mouseenter', e => {
                if(!isFirst) {
                    console.log('sethover')
                    block.setHover(true);
                }
            });
            el.addEventListener('mouseleave', e => {
                if(!isFirst) {
                    block.setHover(false);
                }
            });
            el.addEventListener('click', () => {
                block.setHover(false);
                jframe.setFocusTarget(block);
                
            })
            wrapper.prepend(el);
            parent = jframe.dataElemDescription.getSourceParent(parent);
            idx ++;
        }
        
        this.el = wrapper;
        appendChild(wrapper);
    }
}

export default BlockTitle;