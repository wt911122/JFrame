import Tool from './tool'
class BlockAlignment extends Tool {
    constructor(configs) {
        super(configs);
        this.onClick = configs.onClick;
        this.accept = configs.accept;

        const g1 = document.createElement('span');
        g1.setAttribute('class', 'jframe-toolbtn');
        const justifyStartBtn = document.createElement('span');
        justifyStartBtn.setAttribute('class', 'jframe-toolbtn-group-item jframe-toolbtn-group-justify-start');
        const justifyEndBtn = document.createElement('span');
        justifyEndBtn.setAttribute('class', 'jframe-toolbtn-group-item jframe-toolbtn-group-justify-end');
        const columnBtn = document.createElement('span');
        columnBtn.setAttribute('class', 'jframe-toolbtn-group-item jframe-toolbtn-group-column');
        g1.appendChild(justifyStartBtn);
        g1.appendChild(justifyEndBtn);
        g1.appendChild(columnBtn);

        const g2 = document.createElement('span');
        g2.setAttribute('class', 'jframe-toolbtn');
        const alignStartBtn = document.createElement('span');
        alignStartBtn.setAttribute('class', 'jframe-toolbtn-group-item jframe-toolbtn-group-alignment-start');
        const alignCenterBtn = document.createElement('span');
        alignCenterBtn.setAttribute('class', 'jframe-toolbtn-group-item jframe-toolbtn-group-alignment-center');
        const alignEndBtn = document.createElement('span');
        alignEndBtn.setAttribute('class', 'jframe-toolbtn-group-item jframe-toolbtn-group-alignment-end');
        g2.appendChild(alignStartBtn);
        g2.appendChild(alignCenterBtn);
        g2.appendChild(alignEndBtn);


        g1.addEventListener('click', e => {
            const targetBlock = this.targetBlock;
            if(e.target === justifyStartBtn) {
                this.onClick(targetBlock, 'justify', 'start');
                e.stopPropagation();
            }
            if(e.target === justifyEndBtn) {
                this.onClick(targetBlock, 'justify', 'end');
                e.stopPropagation();
            }
            if(e.target === columnBtn) {
                this.onClick(targetBlock, 'containerDirection', targetBlock.source.props.containerDirection === 'column' ? 'row' : 'column');
                e.stopPropagation();
            }
        })

        g2.addEventListener('click', e => {
            const targetBlock = this.targetBlock;
            if(e.target === alignStartBtn) {
                this.onClick(targetBlock, 'alignment', 'start');
                e.stopPropagation();
            }
            if(e.target === alignCenterBtn) {
                this.onClick(targetBlock, 'alignment', 'center');
                e.stopPropagation();
            }
            if(e.target === alignEndBtn) {
                this.onClick(targetBlock, 'alignment', 'end');
                e.stopPropagation();
            }
        })
        Object.assign(this, {
            g1, g2,
            justifyStartBtn,
            justifyEndBtn,
            columnBtn,
            alignStartBtn,
            alignCenterBtn,
            alignEndBtn,
        });
    }
    renderToolbox(targetBlock, appendChild) {
        if(this.accept(targetBlock.source)) {
            const {
                g1, g2
            } = this;
            this.targetBlock = targetBlock;
            this._resetProps(targetBlock);
            appendChild(g1);
            appendChild(g2);
        }
    }
        
    _resetProps(targetBlock) {
        const {
            justifyStartBtn,
            justifyEndBtn,
            columnBtn,
            alignStartBtn,
            alignCenterBtn,
            alignEndBtn,
        } = this;
        const {
            containerDirection,
            justify,
            alignment,
        } = targetBlock.source.props;

        justifyStartBtn.setAttribute('light', !justify || justify === 'start');
        justifyEndBtn.setAttribute('light', justify === 'end');
        columnBtn.setAttribute('light', containerDirection === 'column');
        alignStartBtn.setAttribute('light', !alignment || alignment === 'start');
        alignCenterBtn.setAttribute('light', alignment === 'center');
        alignEndBtn.setAttribute('light', alignment === 'end');
    }

    refresh(targetBlock) {
        if(this.accept(targetBlock.source)) {
            this._resetProps(targetBlock);
        }
    }

    destroy() {
        this.g1.remove();
        this.g2.remove();
    }
}

export default BlockAlignment;