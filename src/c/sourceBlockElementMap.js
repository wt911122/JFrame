class sourceBlockElememtMap {
    constructor() {
        this._map = new WeakMap();
    }

    get(source) {
        return this._map.get(source);
    }

    has(source) {
        return this._map.has(source);
    }

    clear() {
        this._map.clear();
    }

    getBlockBySource(source) {
        const mapping = this._map.get(source);
        if(mapping) {
            return mapping.block;
        }
        return undefined;
    }

    getElementBySource(source) {
        const mapping = this._map.get(source);
        if(mapping) {
            return mapping.element;
        }
        return undefined;
    }

    setBlockBySource(source, block) {
        if(!this.has(source)) {
            const obj = getMapObject(block);
            this._map.set(source, obj);
        } else {
            const obj = this._map.get(source);
            obj.block = block;
        }
    }
    setElementBySource(source, element) {
        if(!this.has(source)) {
            const obj = getMapObject(undefined, element);
            this._map.set(source, obj);
        } else {
            const obj = this._map.get(source);
            obj.element = element;
        }
    }
}

function getMapObject(block, element) {
    return {
        block,
        element,
    }
}


export default sourceBlockElememtMap;