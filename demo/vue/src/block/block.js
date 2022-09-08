class Block {
    constructor(sourceNode) {
        this.source = sourceNode;
        this.type = 'default';
    }

    delete() {
        if(this.parent) {
            this.parent.children.splice(this.idx, 1);
        }
    }
}

class ContainerBlock extends Block {
    constructor(sourceNode) {
        super(sourceNode);
        this.type = 'container';
        sourceNode.children.forEach((c, idx) => {
            const node = makeBlock(c);
            node.parent = this;
            node.idx = idx;
        })
    }
}

class LayoutBlock extends ContainerBlock {
    constructor(sourceNode) {
        super(sourceNode);
        this.type = 'layout';
    }
}


function getBlockCtor(tag) {
    switch(tag) {
        case 'DivElement':
        case 'UlElement':
        case 'LiElement':
            return ContainerBlock;
        case 'LayoutElement': 
            return LayoutBlock;
        default:
            return Block;
    }
}

function makeBlock(source) {
    const Ctor = getBlockCtor(source.tag)
    const node = new Ctor(source);
    return node;
}



class BlockManager {
    constructor(source) {

    }

    resolve(source) {

    }
}