import * as kiwi from '@lume/kiwi'; 
import { 
    BOUNDING_RECT,
    RELATIONLIST 
} from './constance';

const defaultPriorityStrength = kiwi.Strength.create(0, 1000, 1000);
let transformAttr = 'transform' in document.documentElement.style ? 'transform' : undefined;
transformAttr =
	transformAttr || ('-webkit-transform' in document.documentElement.style ? '-webkit-transform' : 'undefined');
    transformAttr = transformAttr || ('-moz-transform' in document.documentElement.style ? '-moz-transform' : 'undefined');
    transformAttr = transformAttr || ('-ms-transform' in document.documentElement.style ? '-ms-transform' : 'undefined');
    transformAttr = transformAttr || ('-o-transform' in document.documentElement.style ? '-o-transform' : 'undefined');

const DEFAULT_RECT_CONSTRAINTS = {
    [BOUNDING_RECT.LEFT](attr, parentWidth) {
        return new kiwi.Constraint(
            attr[BOUNDING_RECT.LEFT],
            kiwi.Operator.Eq,
            parentWidth.minus(attr[BOUNDING_RECT.RIGHT]).minus(attr[BOUNDING_RECT.WIDTH]),
        );
    },
    [BOUNDING_RECT.RIGHT](attr, parentWidth) {
        return new kiwi.Constraint(
            attr[BOUNDING_RECT.RIGHT],
            kiwi.Operator.Eq,
            parentWidth.minus(attr[BOUNDING_RECT.LEFT]).minus(attr[BOUNDING_RECT.WIDTH]),
        );
    },
    [BOUNDING_RECT.TOP](attr, parentHeight) {
        return new kiwi.Constraint(
            attr[BOUNDING_RECT.TOP],
            kiwi.Operator.Eq,
            parentHeight.minus(attr[BOUNDING_RECT.BOTTOM]).minus(attr[BOUNDING_RECT.HEIGHT]),
        );
    },
    [BOUNDING_RECT.BOTTOM](attr, parentHeight) {
        return new kiwi.Constraint(
            attr[BOUNDING_RECT.BOTTOM],
            kiwi.Operator.Eq,
            parentHeight.minus(attr[BOUNDING_RECT.TOP]).minus(attr[BOUNDING_RECT.HEIGHT]),
        );
    },
    [BOUNDING_RECT.CENTERX](attr) {
        return new kiwi.Constraint(
            attr[BOUNDING_RECT.CENTERX],
            kiwi.Operator.Eq,
            attr[BOUNDING_RECT.LEFT].plus(attr[BOUNDING_RECT.WIDTH].divide(2)),
        );
    },
    [BOUNDING_RECT.CENTERY](attr) {
        return new kiwi.Constraint(
            attr[BOUNDING_RECT.CENTERY],
            kiwi.Operator.Eq,
            attr[BOUNDING_RECT.TOP].plus(attr[BOUNDING_RECT.HEIGHT].divide(2)),
        );
    },
    [BOUNDING_RECT.WIDTH](attr, parentWidth) {
        return new kiwi.Constraint(
            attr[BOUNDING_RECT.WIDTH],
            kiwi.Operator.Eq,
            parentWidth.minus(attr[BOUNDING_RECT.LEFT]).minus(attr[BOUNDING_RECT.RIGHT]),
        );
    },
    [BOUNDING_RECT.HEIGHT](attr, parentHeight) {
        return new kiwi.Constraint(
            attr[BOUNDING_RECT.HEIGHT],
            kiwi.Operator.Eq,
            parentHeight.minus(attr[BOUNDING_RECT.TOP]).minus(attr[BOUNDING_RECT.BOTTOM]),
        );
    },
}
class RelationShip {
    /**
     * { key: string, value: any, isDefault: boolean }
     */
    relation = [];
    meta = {};
    isDefault = true;

    _resolve(config) {
        const obj = {
            key: config.name,
            default: config.default,
        }
        this.meta[obj.key] = obj;
        this.relation.push({
            key: obj.key,
            value: obj.default,
            isDefault: true,
        })
    }

    find(key) {
        return this.relation.find(r => r.key === key);
    }

    setDefault() {
        this.relation.forEach(r => {
            const key = r.key;
            r.value = this.meta[key].default;
            r.isDefault = true;
        });
        this.isDefault = true;
    }

    getConstraints() {
        return this.relation.map(r => r.value)
    }
    getConstraint(name) {
        return this.relation.find(r => r.key === name).value
    }

    getEnableRelationKey() {
        return this.relation.filter(r => !r.isDefault).map(r => r.key);   
    }


}

class TriangleRelationshipGetTwo extends RelationShip {
    
    constructor(aconf, bconf, cconf) {
        super();
        this._resolve(aconf);
        this._resolve(bconf);
        this._resolve(cconf);
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
            r0.value = this.meta[r0.key].default;
            r0.isDefault = true;
        } 
    }
}

// class DoubleRelationship {
//     relation = [];
//     meta = {};
//     isDefault = true;

//     constructor(aconf, bconf) {
//         this._resolve(aconf);
//         this._resolve(bconf);
//     }

//     set(key, val) {
//         this.isDefault = false;
//         const relation = this.relation;
//         const index = relation.findIndex(r => r.key === key);
//         if(index !== -1) {
//             relation[index].value = val;
//             relation[index].isDefault = false;
//         } 
//     }
// }

class TriangleRelationshipGetOne extends RelationShip{
    constructor(aconf, bconf, cconf) {
        super();
        this._resolve(aconf);
        this._resolve(bconf);
        this._resolve(cconf);
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
            r0.value = this.meta[r0.key].default;
            r0.isDefault = true;
            const r1 = relation[1];
            r1.value = this.meta[r1.key].default;
            r1.isDefault = true;
            
        } 
    }
}

const RECT_RELATION_MODE = {
    H_GET_TWO: 'horizonTripleGetTwo',
    H_GET_ONE: 'horizonTripleGetOne',
    V_GET_TWO: 'verticalTripleGetTwo',
    V_GET_ONE: 'verticalTripleGetOne',
}

export class View {
    [BOUNDING_RECT.LEFT] = new kiwi.Variable(BOUNDING_RECT.LEFT);
    [BOUNDING_RECT.RIGHT] = new kiwi.Variable(BOUNDING_RECT.RIGHT);
    [BOUNDING_RECT.TOP] = new kiwi.Variable(BOUNDING_RECT.TOP);
    [BOUNDING_RECT.BOTTOM] = new kiwi.Variable(BOUNDING_RECT.BOTTOM);
    [BOUNDING_RECT.WIDTH] = new kiwi.Variable(BOUNDING_RECT.WIDTH);
    [BOUNDING_RECT.HEIGHT] = new kiwi.Variable(BOUNDING_RECT.HEIGHT);
    [BOUNDING_RECT.CENTERX] = new kiwi.Variable(BOUNDING_RECT.CENTERX);
    [BOUNDING_RECT.CENTERY] = new kiwi.Variable(BOUNDING_RECT.CENTERY);

    constraints = new Map();
    _name = '';
    _defCopy = {
        [BOUNDING_RECT.LEFT]: null,
        [BOUNDING_RECT.RIGHT]: null,
        [BOUNDING_RECT.TOP]: null,
        [BOUNDING_RECT.BOTTOM]: null,
        [BOUNDING_RECT.WIDTH]: null,
        [BOUNDING_RECT.HEIGHT]: null,
        [BOUNDING_RECT.CENTERX]: null,
        [BOUNDING_RECT.CENTERY]: null,
    }

    horizontalMode = RECT_RELATION_MODE.H_GET_TWO;
    verticalMode = RECT_RELATION_MODE.V_GET_TWO;

    widthConstraintInModeOne = null;
    heightConstraintInModeOne = null;

    documentElement = null;

    _solver_constraints = []

    constructor(documentElement, parentlayout, name) {
        this.documentElement = documentElement;
        this._name = name;
        this.horizonTripleGetTwo = new TriangleRelationshipGetTwo(
                {
                    name: BOUNDING_RECT.LEFT,
                    default: DEFAULT_RECT_CONSTRAINTS[BOUNDING_RECT.LEFT](this, parentlayout[BOUNDING_RECT.WIDTH])
                },
                {
                    name: BOUNDING_RECT.RIGHT,
                    default: DEFAULT_RECT_CONSTRAINTS[BOUNDING_RECT.RIGHT](this, parentlayout[BOUNDING_RECT.WIDTH])
                },
                {
                    name: BOUNDING_RECT.WIDTH,
                    default: DEFAULT_RECT_CONSTRAINTS[BOUNDING_RECT.WIDTH](this, parentlayout[BOUNDING_RECT.WIDTH])
                },
            );
        this.verticalTripleGetTwo = new TriangleRelationshipGetTwo(
                {
                    name: BOUNDING_RECT.TOP,
                    default: DEFAULT_RECT_CONSTRAINTS[BOUNDING_RECT.TOP](this, parentlayout[BOUNDING_RECT.HEIGHT])
                },
                {
                    name: BOUNDING_RECT.BOTTOM,
                    default: DEFAULT_RECT_CONSTRAINTS[BOUNDING_RECT.BOTTOM](this, parentlayout[BOUNDING_RECT.HEIGHT])
                },
                {
                    name: BOUNDING_RECT.HEIGHT,
                    default: DEFAULT_RECT_CONSTRAINTS[BOUNDING_RECT.HEIGHT](this, parentlayout[BOUNDING_RECT.HEIGHT])
                },
            );
    
        this.horizonTripleGetOne = new TriangleRelationshipGetOne(
                {
                    name: BOUNDING_RECT.LEFT,
                    default: DEFAULT_RECT_CONSTRAINTS[BOUNDING_RECT.LEFT](this, parentlayout[BOUNDING_RECT.WIDTH])
                },
                {
                    name: BOUNDING_RECT.RIGHT,
                    default: DEFAULT_RECT_CONSTRAINTS[BOUNDING_RECT.RIGHT](this, parentlayout[BOUNDING_RECT.WIDTH])
                },
                {
                    name: BOUNDING_RECT.CENTERX,
                    default: DEFAULT_RECT_CONSTRAINTS[BOUNDING_RECT.CENTERX](this)
                },
            );
        this.verticalTripleGetOne = new TriangleRelationshipGetOne(
                {
                    name: BOUNDING_RECT.TOP,
                    default: DEFAULT_RECT_CONSTRAINTS[BOUNDING_RECT.TOP](this, parentlayout[BOUNDING_RECT.HEIGHT])
                },
                {
                    name: BOUNDING_RECT.BOTTOM,
                    default: DEFAULT_RECT_CONSTRAINTS[BOUNDING_RECT.BOTTOM](this, parentlayout[BOUNDING_RECT.HEIGHT])
                },
                {
                    name: BOUNDING_RECT.CENTERY,
                    default: DEFAULT_RECT_CONSTRAINTS[BOUNDING_RECT.CENTERY](this)
                },
            );
        this[BOUNDING_RECT.LEFT].setContext(name)
        this[BOUNDING_RECT.RIGHT].setContext(name)
        this[BOUNDING_RECT.TOP].setContext(name)
        this[BOUNDING_RECT.BOTTOM].setContext(name)
        this[BOUNDING_RECT.WIDTH].setContext(name)
        this[BOUNDING_RECT.HEIGHT].setContext(name)
        this[BOUNDING_RECT.CENTERX].setContext(name)
        this[BOUNDING_RECT.CENTERY].setContext(name)
                
            
        this.horizonTripleGetTwo.set(BOUNDING_RECT.WIDTH, new kiwi.Constraint(this[BOUNDING_RECT.WIDTH], kiwi.Operator.Eq, 280, defaultPriorityStrength));
        this.horizonTripleGetTwo.set(BOUNDING_RECT.LEFT, new kiwi.Constraint(this[BOUNDING_RECT.LEFT], kiwi.Operator.Eq, 0, defaultPriorityStrength));
        this.verticalTripleGetTwo.set(BOUNDING_RECT.HEIGHT, new kiwi.Constraint(this[BOUNDING_RECT.HEIGHT], kiwi.Operator.Eq, 160, defaultPriorityStrength));
        this.verticalTripleGetTwo.set(BOUNDING_RECT.TOP, new kiwi.Constraint(this[BOUNDING_RECT.TOP], kiwi.Operator.Eq, 0, defaultPriorityStrength));
                
        this._defCopy[BOUNDING_RECT.LEFT] = {
            target: "",
            attr: "const",
            operator: "",
            value: 0,
            relation: "Eq"
        }
        this._defCopy[BOUNDING_RECT.TOP] = {
            target: "",
            attr: "const",
            operator: "",
            value: 0,
            relation: "Eq"
        }
        this._defCopy[BOUNDING_RECT.WIDTH] = {
            target: "",
            attr: "const",
            operator: "",
            value: 280,
            relation: "Eq"
        }
        this._defCopy[BOUNDING_RECT.HEIGHT] = {
            target: "",
            attr: "const",
            operator: "",
            value: 160,
            relation: "Eq"
        }
    }

    set(key, _relation, expr, def) {
        const kiwiRelation = kiwi.Operator[_relation];
        if(key === BOUNDING_RECT.CENTERX) {
            if(this.horizontalMode !== RECT_RELATION_MODE.H_GET_ONE) {
                this.horizontalMode = RECT_RELATION_MODE.H_GET_ONE;
                const relation = this.horizonTripleGetTwo.find(BOUNDING_RECT.WIDTH);
                if(relation.isDefault) {
                    this.widthConstraintInModeOne = new kiwi.Constraint(this[BOUNDING_RECT.WIDTH], kiwiRelation, this[BOUNDING_RECT.WIDTH].value());
                } else {
                    this.widthConstraintInModeOne  = relation.value;
                }
            }
            this.horizonTripleGetOne.set(key, new kiwi.Constraint(this[key], kiwiRelation, expr, defaultPriorityStrength));
        }
        
        if(key === BOUNDING_RECT.CENTERY) {
            if(this.verticalMode !== RECT_RELATION_MODE.V_GET_ONE) {
                this.verticalMode = RECT_RELATION_MODE.V_GET_ONE;
                const relation = this.horizonTripleGetTwo.find(BOUNDING_RECT.HEIGHT);
                if(relation.isDefault) {
                    this.heightConstraintInModeOne = new kiwi.Constraint(this[BOUNDING_RECT.HEIGHT], kiwiRelation, this[BOUNDING_RECT.HEIGHT].value());
                } else {
                    this.heightConstraintInModeOne  = relation.value;
                }
            }
            this.verticalTripleGetOne.set(key, new kiwi.Constraint(this[key], kiwiRelation, expr, defaultPriorityStrength));
        }

        if(key === BOUNDING_RECT.LEFT || key === BOUNDING_RECT.RIGHT) {
            if(this.horizontalMode !== RECT_RELATION_MODE.H_GET_TWO) {
                this.horizontalMode = RECT_RELATION_MODE.H_GET_TWO;
                this.horizonTripleGetOne.setDefault();
                this.horizonTripleGetTwo.set(BOUNDING_RECT.WIDTH, this.widthConstraintInModeOne);
                this.widthConstraintInModeOne = null;   
            }
            this.horizonTripleGetTwo.set(key, new kiwi.Constraint(this[key], kiwiRelation, expr, defaultPriorityStrength));
        }

        if(key === BOUNDING_RECT.TOP || key === BOUNDING_RECT.BOTTOM) {
            if(this.verticalMode !== RECT_RELATION_MODE.V_GET_TWO) {
                this.verticalMode = RECT_RELATION_MODE.V_GET_TWO;
                this.verticalTripleGetOne.setDefault();
                this.verticalTripleGetTwo.set(BOUNDING_RECT.HEIGHT, this.heightConstraintInModeOne);
                this.heightConstraintInModeOne = null;   
            }
            this.verticalTripleGetTwo.set(key, new kiwi.Constraint(this[key], kiwiRelation, expr, defaultPriorityStrength));
        }

        if(key === BOUNDING_RECT.WIDTH) {
            if(this.horizontalMode === RECT_RELATION_MODE.H_GET_TWO) {
                this.horizonTripleGetTwo.set(key, new kiwi.Constraint(this[key], kiwiRelation, expr, defaultPriorityStrength));
            } else {
                this.widthConstraintInModeOne = new kiwi.Constraint(this[key], kiwiRelation, expr, defaultPriorityStrength);
            }
        }

        if(key === BOUNDING_RECT.HEIGHT) {
            if(this.verticalMode === RECT_RELATION_MODE.V_GET_TWO) {
                this.verticalTripleGetTwo.set(key, new kiwi.Constraint(this[key], kiwiRelation, expr, defaultPriorityStrength));
            } else {
                this.heightConstraintInModeOne = new kiwi.Constraint(this[key], kiwiRelation, expr, defaultPriorityStrength);
            }
        }

        this._defCopy[key] = Object.assign({}, def);
    }

    getConstraints() {
        let c = [];
        if(this.horizontalMode === RECT_RELATION_MODE.H_GET_TWO) {
            c = c.concat(this.horizonTripleGetTwo.getConstraints());
            c.push(this.horizonTripleGetOne.getConstraint(BOUNDING_RECT.CENTERX))
        }
        if(this.horizontalMode === RECT_RELATION_MODE.H_GET_ONE) {
            c = c.concat(this.horizonTripleGetOne.getConstraints());
            c.push(this.widthConstraintInModeOne);
            c.push(this.horizonTripleGetTwo.getConstraint(BOUNDING_RECT.LEFT))
            c.push(this.horizonTripleGetTwo.getConstraint(BOUNDING_RECT.RIGHT))
        }

        if(this.verticalMode === RECT_RELATION_MODE.V_GET_TWO) {
            c = c.concat(this.verticalTripleGetTwo.getConstraints());
            c.push(this.verticalTripleGetOne.getConstraint(BOUNDING_RECT.CENTERY))
        }
        if(this.verticalMode === RECT_RELATION_MODE.V_GET_ONE) {
            c = c.concat(this.verticalTripleGetOne.getConstraints());
            c.push(this.heightConstraintInModeOne);
            c.push(this.verticalTripleGetTwo.getConstraint(BOUNDING_RECT.TOP))
            c.push(this.verticalTripleGetTwo.getConstraint(BOUNDING_RECT.BOTTOM))
        }
        this._solver_constraints = c;
        return c;
    }

    toJSONConstraint() {
        const c = {
            component: this._name
        };
        let keys = [];
        if(this.horizontalMode === RECT_RELATION_MODE.H_GET_TWO) {
            keys = keys.concat(this.horizonTripleGetTwo.getEnableRelationKey());
        }
        if(this.horizontalMode === RECT_RELATION_MODE.H_GET_ONE) {
            keys = keys.concat(this.horizonTripleGetOne.getEnableRelationKey());
            keys.push(BOUNDING_RECT.WIDTH);
        }

        if(this.verticalMode === RECT_RELATION_MODE.V_GET_TWO) {
            keys = keys.concat(this.verticalTripleGetTwo.getEnableRelationKey());
        }
        if(this.verticalMode === RECT_RELATION_MODE.V_GET_ONE) {
            keys = keys.concat(this.verticalTripleGetOne.getEnableRelationKey());
            keys.push(BOUNDING_RECT.HEIGHT);
        }
        keys.forEach(k => {
            c[k] = this._defCopy[k];
        })
        return c;
    }

    getBoundingValues() {
        let c = {}
        const callback = r => {
            c[r.key] = {
                def: this._defCopy[r.key],
                value: this[r.key].value(),
                isDefault: r.isDefault
            }
       };
        if(this.horizontalMode === RECT_RELATION_MODE.H_GET_TWO) {
           this.horizonTripleGetTwo.relation.forEach(callback);
           callback({ key: BOUNDING_RECT.CENTERX, isDefault: true });
        }
        if(this.horizontalMode === RECT_RELATION_MODE.H_GET_ONE) {
            this.horizonTripleGetOne.relation.forEach(callback)
            c[BOUNDING_RECT.WIDTH] = {
                value: this[BOUNDING_RECT.WIDTH].value(),
                isDefault: false,
            }
            callback({ key: BOUNDING_RECT.LEFT, isDefault: true });
            callback({ key: BOUNDING_RECT.RIGHT, isDefault: true });
        }

        if(this.verticalMode === RECT_RELATION_MODE.V_GET_TWO) {
            this.verticalTripleGetTwo.relation.forEach(callback);
            callback({ key: BOUNDING_RECT.CENTERY, isDefault: true });
        }
        if(this.verticalMode === RECT_RELATION_MODE.V_GET_ONE) {
            this.verticalTripleGetOne.relation.forEach(callback)
            c[BOUNDING_RECT.HEIGHT] = {
                value: this[BOUNDING_RECT.HEIGHT].value(),
                isDefault: false,
            }
            callback({ key: BOUNDING_RECT.TOP, isDefault: true });
            callback({ key: BOUNDING_RECT.BOTTOM, isDefault: true });
        }
        return c;
    }

    onResize() {
        const width = parseInt(this[BOUNDING_RECT.WIDTH].value());
        const height = parseInt(this[BOUNDING_RECT.HEIGHT].value());
        const left = parseInt(this[BOUNDING_RECT.LEFT].value());
        const top = parseInt(this[BOUNDING_RECT.TOP].value());
        const el = this.documentElement
        el.style.position = 'absolute';
        el.style.left = 0;
        el.style.top = 0;
        el.style.width = `${width}px`;
        el.style.height = `${height}px`;
        el.style[transformAttr] = `translate3d(${left}px, ${top}px, 0px)`
    }
}
