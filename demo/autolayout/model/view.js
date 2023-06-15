import * as kiwi from '@lume/kiwi'; 
import { 
    BOUNDING_RECT,
    INTRISIC,
    defaultPriorityStrength,
    generatePriortyStrength,
} from './constance';
import { Intrisic } from './intrisic';
const HORIZON_KEYS = [BOUNDING_RECT.LEFT, BOUNDING_RECT.WIDTH, BOUNDING_RECT.RIGHT];
const VERTICAL_KEYS = [BOUNDING_RECT.TOP, BOUNDING_RECT.HEIGHT, BOUNDING_RECT.BOTTOM];

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
            generatePriortyStrength,
        );
    },
    [BOUNDING_RECT.RIGHT](attr, parentWidth) {
        return new kiwi.Constraint(
            attr[BOUNDING_RECT.RIGHT],
            kiwi.Operator.Eq,
            parentWidth.minus(attr[BOUNDING_RECT.LEFT]).minus(attr[BOUNDING_RECT.WIDTH]),
            generatePriortyStrength,
        );
    },
    [BOUNDING_RECT.TOP](attr, parentHeight) {
        return new kiwi.Constraint(
            attr[BOUNDING_RECT.TOP],
            kiwi.Operator.Eq,
            parentHeight.minus(attr[BOUNDING_RECT.BOTTOM]).minus(attr[BOUNDING_RECT.HEIGHT]),
            generatePriortyStrength,
        );
    },
    [BOUNDING_RECT.BOTTOM](attr, parentHeight) {
        return new kiwi.Constraint(
            attr[BOUNDING_RECT.BOTTOM],
            kiwi.Operator.Eq,
            parentHeight.minus(attr[BOUNDING_RECT.TOP]).minus(attr[BOUNDING_RECT.HEIGHT]),
            generatePriortyStrength,
        );
    },
    [BOUNDING_RECT.CENTERX](attr) {
        return new kiwi.Constraint(
            attr[BOUNDING_RECT.CENTERX],
            kiwi.Operator.Eq,
            attr[BOUNDING_RECT.LEFT].plus(attr[BOUNDING_RECT.WIDTH].divide(2)),
            generatePriortyStrength
        );
    },
    [BOUNDING_RECT.CENTERY](attr) {
        return new kiwi.Constraint(
            attr[BOUNDING_RECT.CENTERY],
            kiwi.Operator.Eq,
            attr[BOUNDING_RECT.TOP].plus(attr[BOUNDING_RECT.HEIGHT].divide(2)),
            generatePriortyStrength
        );
    },
    [BOUNDING_RECT.WIDTH](attr, parentWidth) {
        return new kiwi.Constraint(
            attr[BOUNDING_RECT.WIDTH],
            kiwi.Operator.Eq,
            parentWidth.minus(attr[BOUNDING_RECT.LEFT]).minus(attr[BOUNDING_RECT.RIGHT]),
            generatePriortyStrength
        );
    },
    [BOUNDING_RECT.HEIGHT](attr, parentHeight) {
        return new kiwi.Constraint(
            attr[BOUNDING_RECT.HEIGHT],
            kiwi.Operator.Eq,
            parentHeight.minus(attr[BOUNDING_RECT.TOP]).minus(attr[BOUNDING_RECT.BOTTOM]),
            generatePriortyStrength
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
            value: [obj.default],
            isDefault: true,
        })
    }

    find(key) {
        return this.relation.find(r => r.key === key);
    }

    setDefault() {
        this.relation.forEach(r => {
            const key = r.key;
            r.value = [this.meta[key].default];
            r.isDefault = true;
        });
        this.isDefault = true;
    }

    getConstraints() {
        return this.relation.map(r => r.value).flat()
    }
    getConstraint(name) {
        return this.relation.find(r => r.key === name).value
    }

    getEnableRelationKey() {
        return this.relation.filter(r => !r.isDefault).map(r => r.key);   
    }


}

class fixedTriangleRelationShip extends RelationShip {
    constructor(allowKeys, aconf, bconf, cconf, dconf) {
        super();
        this._resolve(aconf);
        this._resolve(bconf);
        this._resolve(cconf);
        this._resolve(dconf);
        this.allowKeys = allowKeys;
    }

    set(key, val) {
        if(this.allowKeys.includes(key)) {
            this.isDefault = false;
            const relation = this.relation;
            const index = relation.findIndex(r => r.key === key);
            if(index !== -1) {
                relation[index].value = val;
                relation[index].isDefault = false;
                const [target] = relation.splice(index, 1);
                relation.push(target);
                const r = relation.filter(r => this.allowKeys.includes(r.key) && !(r.value instanceof Intrisic))
                const r0 = r[0];
                r0.value = this.meta[r0.key].default;
                r0.isDefault = true;
            } 
        }
    }

}

class fixedRelationShip extends RelationShip {
    constructor(allowKeys, aconf, bconf, cconf, dconf) {
        super();
        this._resolve(aconf);
        this._resolve(bconf);
        this._resolve(cconf);
        this._resolve(dconf);
        this.allowKeys = allowKeys;
    }
    set(key, val) {
        this.isDefault = false;
        if(this.allowKeys.includes(key)) {
            const relation = this.relation;
            const index = relation.findIndex(r => r.key === key);
            if(index !== -1) {
                relation[index].value = val;
                relation[index].isDefault = false;
            } 
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

    horizonTripleGetTwo = null;
    verticalTripleGetTwo = null;
    horizontalConple = null;
    verticalConple = null;

    documentElement = null;

    _solver_constraints = [];

    useIntrisicWidth = false;
    useIntrisicHeight = false;

    constructor(documentElement, parentlayout, name) {
        this.documentElement = documentElement;
        this._name = name;
        this.horizonTripleGetTwo = new fixedTriangleRelationShip(
                [BOUNDING_RECT.LEFT, BOUNDING_RECT.RIGHT, BOUNDING_RECT.WIDTH],
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
                {
                    name: BOUNDING_RECT.CENTERX,
                    default: DEFAULT_RECT_CONSTRAINTS[BOUNDING_RECT.CENTERX](this)
                },
            );
        this.verticalTripleGetTwo = new fixedTriangleRelationShip(
                [BOUNDING_RECT.TOP, BOUNDING_RECT.BOTTOM, BOUNDING_RECT.HEIGHT],
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
                {
                    name: BOUNDING_RECT.CENTERY,
                    default: DEFAULT_RECT_CONSTRAINTS[BOUNDING_RECT.CENTERY](this)
                },
            );

        this.horizontalConple = new fixedRelationShip(
            [BOUNDING_RECT.WIDTH, BOUNDING_RECT.CENTERX],
            {
                name: BOUNDING_RECT.LEFT,
                default: new kiwi.Constraint(
                    this[BOUNDING_RECT.LEFT],
                    kiwi.Operator.Eq,
                    this[BOUNDING_RECT.CENTERX].minus(this[BOUNDING_RECT.WIDTH].divide(2)),
                    generatePriortyStrength
                ),
            },
            {
                name: BOUNDING_RECT.RIGHT,
                default: new kiwi.Constraint(
                    this[BOUNDING_RECT.RIGHT],
                    kiwi.Operator.Eq,
                    parentlayout[BOUNDING_RECT.WIDTH].minus(this[BOUNDING_RECT.WIDTH].divide(2)).minus(this[BOUNDING_RECT.LEFT]),
                    generatePriortyStrength
                ),
            },
            {
                name: BOUNDING_RECT.WIDTH,
            },
            {
                name: BOUNDING_RECT.CENTERX,
            }
        )

        this.verticalConple = new fixedRelationShip(
            [BOUNDING_RECT.HEIGHT, BOUNDING_RECT.CENTERY],
            {
                name: BOUNDING_RECT.TOP,
                default: new kiwi.Constraint(
                    this[BOUNDING_RECT.TOP],
                    kiwi.Operator.Eq,
                    this[BOUNDING_RECT.CENTERY].minus(this[BOUNDING_RECT.HEIGHT].divide(2)),
                    generatePriortyStrength
                ),
            },
            {
                name: BOUNDING_RECT.BOTTOM,
                default: new kiwi.Constraint(
                    this[BOUNDING_RECT.BOTTOM],
                    kiwi.Operator.Eq,
                    parentlayout[BOUNDING_RECT.HEIGHT].minus(this[BOUNDING_RECT.HEIGHT].divide(2)).minus(this[BOUNDING_RECT.TOP]),
                    generatePriortyStrength
                ),
            },
            {
                name: BOUNDING_RECT.HEIGHT,
            },
            {
                name: BOUNDING_RECT.CENTERY,
            }
        )
        
        this[BOUNDING_RECT.LEFT].setContext(name)
        this[BOUNDING_RECT.RIGHT].setContext(name)
        this[BOUNDING_RECT.TOP].setContext(name)
        this[BOUNDING_RECT.BOTTOM].setContext(name)
        this[BOUNDING_RECT.WIDTH].setContext(name)
        this[BOUNDING_RECT.HEIGHT].setContext(name)
        this[BOUNDING_RECT.CENTERX].setContext(name)
        this[BOUNDING_RECT.CENTERY].setContext(name)
                
            
        this.horizonTripleGetTwo.set(BOUNDING_RECT.WIDTH, [
            new kiwi.Constraint(this[BOUNDING_RECT.WIDTH], kiwi.Operator.Eq, 280, defaultPriorityStrength)
        ]);
        this.horizonTripleGetTwo.set(BOUNDING_RECT.LEFT, [
            new kiwi.Constraint(this[BOUNDING_RECT.LEFT], kiwi.Operator.Eq, 0, defaultPriorityStrength)
        ]);
        this.verticalTripleGetTwo.set(BOUNDING_RECT.HEIGHT, [
            new kiwi.Constraint(this[BOUNDING_RECT.HEIGHT], kiwi.Operator.Eq, 160, defaultPriorityStrength)
        ]);
        this.verticalTripleGetTwo.set(BOUNDING_RECT.TOP, [
            new kiwi.Constraint(this[BOUNDING_RECT.TOP], kiwi.Operator.Eq, 0, defaultPriorityStrength)
        ]);
    
        this._defCopy[BOUNDING_RECT.LEFT] = [
            '=0'
        ]
        this._defCopy[BOUNDING_RECT.TOP] = [
            '=0'
        ]
        this._defCopy[BOUNDING_RECT.WIDTH] = [
            '=280'
        ]
        this._defCopy[BOUNDING_RECT.HEIGHT] = [
            '=160'
        ]
    }

    setIntrisic(def, val) {
        if(def === BOUNDING_RECT.WIDTH) {
            this.useIntrisicWidth = val;
            if(val) {
                const _inW = new Intrisic(BOUNDING_RECT.WIDTH, this[BOUNDING_RECT.WIDTH], this.documentElement);
                this.set(BOUNDING_RECT.WIDTH, _inW, INTRISIC)
            }
        }
        if(def === BOUNDING_RECT.HEIGHT) {
            this.useIntrisicHeight = val;
            if(val) {
                const _inW = new Intrisic(BOUNDING_RECT.HEIGHT, this[BOUNDING_RECT.HEIGHT], this.documentElement);
                this.set(BOUNDING_RECT.HEIGHT, _inW, INTRISIC)
            }
        }
    }

    _setConstraint(key, constraints, target) {  
        if(constraints instanceof Intrisic) {
            target.set(key, constraints);
            return;
        }
        // const cs = [];
        // constraints.forEach((cons) => {
        //     if(cons instanceof kiwi.Constraint) {
        //         cs.push(cons);
        //     } else {
        //         const { relation, expr } = cons
        //         const kiwiRelation = kiwi.Operator[relation];
        //         cs.push(new kiwi.Constraint(this[key], kiwiRelation, expr, defaultPriorityStrength))
        //     }
           
        // });
        target.set(key, constraints);
    }

    set(key, constraints, def) {
        switch(key) {
            case BOUNDING_RECT.CENTERX:
                if(this.horizontalMode !== RECT_RELATION_MODE.H_GET_ONE) {
                    this.horizontalMode = RECT_RELATION_MODE.H_GET_ONE;
                    const relation = this.horizonTripleGetTwo.find(BOUNDING_RECT.WIDTH);
                    let cs;
                    if(relation.isDefault) {
                        cs = [new kiwi.Constraint(this[BOUNDING_RECT.WIDTH], kiwiRelation, this[BOUNDING_RECT.WIDTH].value(), defaultPriorityStrength)];
                    } else {
                        cs = relation.value;
                    }
                    this._setConstraint(BOUNDING_RECT.WIDTH, cs, this.horizontalConple);
                }
                this._setConstraint(key, constraints, this.horizontalConple);
            break;

            case BOUNDING_RECT.CENTERY:
                if(this.verticalMode !== RECT_RELATION_MODE.V_GET_ONE) {
                    this.verticalMode = RECT_RELATION_MODE.V_GET_ONE;
                    const relation = this.verticalTripleGetTwo.find(BOUNDING_RECT.HEIGHT);
                    let cs;
                    if(relation.isDefault) {
                        cs = [new kiwi.Constraint(this[BOUNDING_RECT.HEIGHT], kiwiRelation, this[BOUNDING_RECT.HEIGHT].value(), defaultPriorityStrength)];
                    } else {
                        cs = relation.value;
                    }
                    this._setConstraint(BOUNDING_RECT.HEIGHT, cs, this.verticalConple);
                }
                this._setConstraint(key, constraints, this.verticalConple);
            break;

            case BOUNDING_RECT.LEFT:
            case BOUNDING_RECT.RIGHT:
                if(this.horizontalMode !== RECT_RELATION_MODE.H_GET_TWO) {
                    this.horizontalMode = RECT_RELATION_MODE.H_GET_TWO;
                    this._setConstraint(BOUNDING_RECT.WIDTH, 
                        this.horizontalConple.find(BOUNDING_RECT.WIDTH).value, 
                        this.horizonTripleGetTwo);
                    this.horizontalConple.setDefault();
                }
                this._setConstraint(key, constraints, this.horizonTripleGetTwo);
            break;

            case BOUNDING_RECT.TOP:
            case BOUNDING_RECT.BOTTOM:
                if(this.verticalMode !== RECT_RELATION_MODE.V_GET_TWO) {
                    this.verticalMode = RECT_RELATION_MODE.V_GET_TWO;
                    this._setConstraint(BOUNDING_RECT.HEIGHT, 
                        this.verticalConple.find(BOUNDING_RECT.HEIGHT).value, 
                        this.verticalTripleGetTwo);
                    this.verticalConple.setDefault();
                }
                this._setConstraint(key, constraints, this.verticalTripleGetTwo);
            break;

            case BOUNDING_RECT.WIDTH:
                if(this.horizontalMode === RECT_RELATION_MODE.H_GET_TWO) {
                    this._setConstraint(key, constraints, this.horizonTripleGetTwo);
                } else {
                    this._setConstraint(key, constraints, this.horizontalConple);
                }
            break;

            case BOUNDING_RECT.HEIGHT:
                if(this.verticalMode === RECT_RELATION_MODE.V_GET_TWO) {
                    this._setConstraint(key, constraints, this.verticalTripleGetTwo);
                } else {
                    this._setConstraint(key, constraints, this.verticalConple);
                }
            break;
        }

        this._defCopy[key] = Array.isArray(def) ? def.slice() : def;
    }

    getConstraint(key) {
        if(HORIZON_KEYS.includes(key)) {
            if(this.horizontalMode === RECT_RELATION_MODE.H_GET_TWO) {
                return this.horizonTripleGetTwo.find(key).value;
            } 
            if(this.horizontalMode === RECT_RELATION_MODE.H_GET_ONE) {
                return this.horizontalConple.find(key).value;
            }
        }
        if(VERTICAL_KEYS.includes(key)) {
            if(this.verticalMode === RECT_RELATION_MODE.V_GET_TWO) {
                return this.verticalTripleGetTwo.find(key).value;
            }
    
            if(this.verticalMode === RECT_RELATION_MODE.V_GET_ONE) {
                return this.verticalConple.find(key).value;
            }
        }
    }

    getConstraints() {
        let c = [];
        if(this.horizontalMode === RECT_RELATION_MODE.H_GET_TWO) {
            c = c.concat(this.horizonTripleGetTwo.getConstraints());
        } 
        if(this.horizontalMode === RECT_RELATION_MODE.H_GET_ONE) {
            c = c.concat(this.horizontalConple.getConstraints());
        }

        if(this.verticalMode === RECT_RELATION_MODE.V_GET_TWO) {
            c = c.concat(this.verticalTripleGetTwo.getConstraints());
        }

        if(this.verticalMode === RECT_RELATION_MODE.V_GET_ONE) {
            c = c.concat(this.verticalConple.getConstraints());
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
            keys = keys.concat(this.horizontalConple.getEnableRelationKey());
        }

        if(this.verticalMode === RECT_RELATION_MODE.V_GET_TWO) {
            keys = keys.concat(this.verticalTripleGetTwo.getEnableRelationKey());
        }

        if(this.verticalMode === RECT_RELATION_MODE.V_GET_ONE) {
            keys = keys.concat(this.verticalConple.getEnableRelationKey());
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
                isDefault: r.isDefault,
            }
       };

        if(this.horizontalMode === RECT_RELATION_MODE.H_GET_TWO) {
            this.horizonTripleGetTwo.relation.forEach(callback);
        } 
        if(this.horizontalMode === RECT_RELATION_MODE.H_GET_ONE) {
           this.horizontalConple.relation.forEach(callback);
        }

        if(this.verticalMode === RECT_RELATION_MODE.V_GET_TWO) {
            this.verticalTripleGetTwo.relation.forEach(callback);
        }

        if(this.verticalMode === RECT_RELATION_MODE.V_GET_ONE) {
            this.verticalConple.relation.forEach(callback);
        }
  
        return c;
    }

    onResize() { 
        const left = parseInt(this[BOUNDING_RECT.LEFT].value());
        const top = parseInt(this[BOUNDING_RECT.TOP].value());
        const el = this.documentElement
        el.style.position = 'absolute';
        el.style.left = 0;
        el.style.top = 0;
        if(!this.useIntrisicWidth) {
            const width = parseInt(this[BOUNDING_RECT.WIDTH].value());
            el.style.width = `${width}px`;
        }
        if(!this.useIntrisicHeight) {
            const height = parseInt(this[BOUNDING_RECT.HEIGHT].value());
            el.style.height = `${height}px`;
        }
        el.style[transformAttr] = `translate3d(${left}px, ${top}px, 0px)`
    }

    destroy() {
        // clear observer
        const c = this.getConstraints();
        c.forEach(_c => {
            if(_c instanceof Intrisic) {
                _c.unObserve();
            } 
        })
    }
}
