import Tool from './tool'

class BlockTitle extends Tool {
    renderToolbox(targetBlock, appendChild) {
        const { jframe, source } = targetBlock
        const wrapper = document.createElement('span');
        wrapper.setAttribute('class', 'jframe-title-wrapper');
       
        let parent = source
        while(parent) {
            const block = jframe.source_block_element_map.getBlockBySource(parent);
            const el = document.createElement('span');
            el.setAttribute('class', 'jframe-title');
            el.innerText = block.source.tag;
            el.addEventListener('mouseenter', e => {
                // jframe.setHoverTarget(block);
                // block.setHover(true);
            });
            el.addEventListener('mouseleave', e => {
                // jframe.resetHoverTarget(block);
                // block.setHover(false);
            });
            el.addEventListener('click', () => {
                jframe.setFocusTarget(block);
            })
            wrapper.prepend(el);
            parent = jframe.dataElemDescription.getSourceParent(parent);
        }
        
        this.el = wrapper;
        appendChild(wrapper);
    }
}

export default BlockTitle;