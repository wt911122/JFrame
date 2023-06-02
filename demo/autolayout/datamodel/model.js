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
                const el = makeElement(c);
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



import { 
    BOUNDING_RECT,
    RELATIONLIST 
} from '../model/constance';

class RelationShip {
    /**
     * { key: string, value: any, isDefault: boolean }
     */
    relation = [];
    isDefault = true;

    _resolve(name) {
        this.relation.push({
            key: name,
            value: null,
            isDefault: true,
        })
    }

    find(key) {
        return this.relation.find(r => r.key === key);
    }

    setDefault() {
        this.relation.forEach(r => {
            // const key = r.key;
            r.value = null;
            r.isDefault = true;
        });
        this.isDefault = true;
    }

    getEnableRelationKey() {
        return this.relation.filter(r => !r.isDefault).map(r => r.key);   
    }
}

class From3Get2 extends RelationShip {
    constructor(a, b, c) {
        super();
        this._resolve(a);
        this._resolve(b);
        this._resolve(c);
    }
    set(key, val) {
        this.isDefault = false;
        const relation = this.relation;
        const index = relation.findIndex(r => r.key === key);
        if(index !== -1) {
            relation[index].value = val;
            relation[index].isDefault = false;
            const [target] = relation.splice(index, 1);
            relation.push(target);
            const r0 = relation[0];
            r0.value = null
            r0.isDefault = true;
        } 
    }
}


class From3Get1 extends RelationShip {
    constructor(a, b, c) {
        super();
        this._resolve(a);
        this._resolve(b);
        this._resolve(c);
    }
    set(key, val) {
        this.isDefault = false;
        const relation = this.relation;
        const index = relation.findIndex(r => r.key === key);
        if(index !== -1) {
            relation[index].value = val;
            relation[index].isDefault = false;
            const [target] = relation.splice(index, 1);
            relation.push(target);
            
            const r0 = relation[0];
            r0.value = null;
            r0.isDefault = true;
            const r1 = relation[1];
            r1.value = null;
            r1.isDefault = true;
        } 
    }
}

class From2Get1 extends RelationShip {
    constructor(a, b) {
        super();
        this._resolve(a);
        this._resolve(b);
    }

    set(key, val) {
        this.isDefault = false;
        const relation = this.relation;
        const index = relation.findIndex(r => r.key === key);
        if(index !== -1) {
            relation[index].value = val;
            relation[index].isDefault = false;
            const [target] = relation.splice(index, 1);
            relation.push(target);
            
            const r0 = relation[0];
            r0.value = null;
            r0.isDefault = true;
        } 
    }
}

class ConstraintElem extends Elem{

    constructor(source) {
        super(source);
        this.hr1 = new From3Get2()
    }
    set(key, _relation, def) {

    }
}

export function makeElement(source) {
    if(source.tag === 'AutoLayoutComponent'){
        return new ConstraintElem(source)
    } 
    return new Elem(source);
}