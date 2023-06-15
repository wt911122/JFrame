import * as kiwi from '@lume/kiwi';
/**
 * 
 *  {
        target: '',
        attr: '',
        operator: '',
        value: '',
        unit: '',
    }
 */
import { 
    ATTRIBUTES, 
    ATTRIBUTES_VALS, 
    OPERATOR_VALS,
    BOUNDING_RECT,
    RELATION,
    INTRISIC,
    NORMAL,
    defaultPriorityStrength
} from './constance';

import { View } from './view';
import { Intrisic } from './intrisic';
import { parse as parser } from './layout-parser'
import { translate } from './translate';

class CoinRelation {
    metaA = null;
    metaB = null;
    curr = undefined;
    constructor(a, b){
        this.metaA = {
            ...a,
            value: null,
            def: null,
        };
        this.metaB = {
            ...b,
            value: null,
            def: null,
        };
    }

    getCurCoin() {
        if(this.metaA.key === this.curr) {
            return this.metaA;
        }
        if(this.metaB.key === this.curr) {
            return this.metaB;
        }
    }

    setCoin(key, value) {
        if(this.metaA.key === key) {
            if(this.curr && this.curr !== key) {
                this.metaB.quit();
            }
            this.curr = key;
            this.metaA.def = this.metaA.setDef(value);
            this.metaA.value = this.metaA.setValue(value);
        }
        if(this.metaB.key === key) {
            if(this.curr && this.curr !== key) {
                this.metaA.quit();
            }
            this.curr = key;
            this.metaB.def = this.metaB.setDef(value);
            this.metaB.value = this.metaB.setValue(value);
        }
    }
    
    updateValue(solver) {
        const meta = this.getCurCoin();
        meta.updateValue(solver);
    }

    onReflow(solver) {
        const meta = this.getCurCoin();
        meta.onReflow(solver, meta.value);
    }

    onResize() {
        const meta = this.getCurCoin();
        meta.onResize();
    }
    
    getJSONConstraints() {
        const meta = this.getCurCoin();
        return meta.def;
    }
}

const PARENT_SYMBOL = '|';

class ConstraintLayout {
    static resolveExpr(c, getTarget) {
        const {
            target, attr, operator, value
        } = c;
        const view = getTarget(target);
        if(attr === ATTRIBUTES.CONST) {
            return value
        }
        if(ATTRIBUTES_VALS.includes(attr)) {
            if(OPERATOR_VALS.includes(operator)) {
                switch(attr) {
                    case ATTRIBUTES.BOTTOM_EDGE:
                        return view[BOUNDING_RECT.TOP].plus(view[BOUNDING_RECT.HEIGHT])[operator](value);
                    case ATTRIBUTES.TOP_EDGE:
                        return view[BOUNDING_RECT.BOTTOM].plus(view[BOUNDING_RECT.HEIGHT])[operator](value);
                    case ATTRIBUTES.LEFT_EDGE:
                        return view[BOUNDING_RECT.RIGHT].plus(view[BOUNDING_RECT.WIDTH])[operator](value);
                    case ATTRIBUTES.RIGHT_EDGE:
                        return view[BOUNDING_RECT.LEFT].plus(view[BOUNDING_RECT.WIDTH])[operator](value);
                    default:
                        const variable = view[attr];
                        // console.log(target, attr, variable, operator, value)
                        return variable[operator](value);
                }
            }
        }
        return null;
    }

    _root = undefined;
    _getChild = undefined;

    [BOUNDING_RECT.WIDTH] = new kiwi.Variable(BOUNDING_RECT.WIDTH);
    [BOUNDING_RECT.HEIGHT] = new kiwi.Variable(BOUNDING_RECT.HEIGHT);

    useIntrisicWidth = false;
    useIntrisicHeight = false;

    _widthCoin = null;
    _heightCoin = null;
    

    _solver = null;
    _solver_constraints = [];
    _defCopy = {
        [BOUNDING_RECT.WIDTH]: null,
        [BOUNDING_RECT.HEIGHT]: null,
    }
    _views = new Map();

    constructor(configs) {
        this._getChild = configs.getChild;
        this._root = configs.root;
        this._root._constraints_ = this;
        this[BOUNDING_RECT.WIDTH].setContext('_parent_');
        this[BOUNDING_RECT.HEIGHT].setContext('_parent_');
        this.initCoinConstraints();
        this.disconnectOb = this._observe();
    }
    initCoinConstraints() {
        const widthVariable = this[BOUNDING_RECT.WIDTH];
        const heightVariable = this[BOUNDING_RECT.HEIGHT];
        const root = this._root;
        // const _genGetTarget = this._genGetTarget.bind(this, this.views);
        this._widthCoin = new CoinRelation(
            {
                key: NORMAL,
                onReflow(solver) {
                    if(!solver.hasEditVariable(widthVariable)) {
                        solver.addEditVariable(widthVariable, kiwi.Strength.strong);
                    }
                },
                updateValue(solver) {
                    solver.suggestValue(widthVariable, root.clientWidth);
                },
                onResize() {},
                setValue() {
                    return null;
                },
                setDef(){
                    return null;
                },
                quit() {}
            },
            {
                key: INTRISIC,
                onReflow(solver, cs) {
                    cs.forEach(c => {
                        if(!solver.hasConstraint(c)) {
                            solver.addConstraint(c);
                        }
                    })
                    
                },
                updateValue() {},
                onResize() {
                    const width = parseInt(widthVariable.value());
                    root.style.width = `${width}px`;
                },
                setValue: (def) => {
                    const finder = this._genGetTarget(this._views);
                    const cs = [];
                    def.forEach(df => {
                        const ast = parser(df);
                        const c = translate(ast, finder, this, widthVariable, defaultPriorityStrength)
                        cs.push(c);
                    });
                    return cs;
                },
                setDef(value){
                    return Array.isArray(value) ? value.slice() : value;
                },
                quit() {}
            }
        );
        this._heightCoin = new CoinRelation(
            {
                key: NORMAL,
                onReflow(solver) {
                    if(!solver.hasEditVariable(heightVariable)) {
                        solver.addEditVariable(heightVariable, kiwi.Strength.strong);
                    }
                },
                updateValue(solver) {
                    console.log('update height', root.clientHeight)
                    solver.suggestValue(heightVariable, root.clientHeight);
                },
                onResize() {},
                setValue() {
                    return null;
                },
                setDef(){
                    return null;
                },
                quit() {}
            },
            {
                key: INTRISIC,
                onReflow(solver, cs) {
                    cs.forEach(c => {
                        if(!solver.hasConstraint(c)) {
                            solver.addConstraint(c);
                        }
                    })
                },
                updateValue(solver) {},
                onResize() {
                    const height = parseInt(heightVariable.value());
                    root.style.height = `${height}px`;
                },
                setValue: (def) => {
                    const finder = this._genGetTarget(this._views);
                    const cs = [];
                    def.forEach(df => {
                        const ast = parser(df);
                        const c = translate(ast, finder, this, heightVariable, defaultPriorityStrength)
                        cs.push(c);
                    });
                    return cs;
                },
                setDef(value){
                    return Array.isArray(value) ? value.slice() : value;
                },
                quit() {}
            }
        )
    }

    setSelfConstraint(mode, d, def) {
        if(d === BOUNDING_RECT.WIDTH) {
            this._widthCoin.setCoin(mode, def);
            return;
        }
        if(d === BOUNDING_RECT.HEIGHT) {
            this._heightCoin.setCoin(mode, def);
            return;
        }
    }

    _observe() {
        const observer = new ResizeObserver(() => {
            console.log('layout observer')
            if(this._solver) {
                this.scheduleResize();
            }
           
        });
        console.log(this._root)
        observer.observe(this._root);
        return () => {
            console.log('disconnect root Observer')
            observer.disconnect();
        }
    }

    _genGetTarget(views) {
        return (target) => {
            if(target === PARENT_SYMBOL) {
                return this
            }
            return views.get(target);
        }
    }

    _setIntrisic(key, def, finder) {
        
        if(def && Array.isArray(def)) {
            const variable = this[key];
            if(key === BOUNDING_RECT.WIDTH) {
                this.useIntrisicWidth = true;
            }
            if(key === BOUNDING_RECT.HEIGHT) {
                this.useIntrisicHeight = true;
            }
            
            def.forEach(df => {
                const kiwiRelation = kiwi.Operator[df.relation];
                const idx = this._solver_constraints.findIndex(c => c.key === key);
                if(idx !== -1) {
                    this._solver_constraints.splice(idx, 1);
                }
                this._solver_constraints.push({
                    key,
                    value: new kiwi.Constraint(
                        variable, 
                        kiwiRelation, 
                        ConstraintLayout.resolveExpr(df, finder), 
                        defaultPriorityStrength)
                })
            });
            this._defCopy[key] = def.slice();
        }
    }

    setConstraint(constraints) {
        this._views = new Map();
        const views = this._views;
        const root = this._root;
        constraints.forEach(c => {
            if(c.component === PARENT_SYMBOL) {
                return;
            }
            const component = c.component;
            const element = this._getChild(root, component);
            const v = new View(element, this, component);
            views.set(component, v);
        });
        const finder = this._genGetTarget(views);
        constraints.forEach(c => {
            if(c.component === PARENT_SYMBOL) {
                if(c[BOUNDING_RECT.WIDTH]) {
                    this._widthCoin.setCoin(INTRISIC, c[BOUNDING_RECT.WIDTH])
                    // this._setIntrisic(BOUNDING_RECT.WIDTH, c[BOUNDING_RECT.WIDTH], finder) 
                }
                if(c[BOUNDING_RECT.HEIGHT]) {
                    this._heightCoin.setCoin(INTRISIC, c[BOUNDING_RECT.HEIGHT])
                    // this._setIntrisic(BOUNDING_RECT.HEIGHT, c[BOUNDING_RECT.HEIGHT], finder) 
                }
                return;
            }
            const component = c.component;
            const view = views.get(component);
            if(view) {
                Object.values(BOUNDING_RECT).forEach(d => {
                    const def = c[d];
                    this._setSingleConstraintFromDef(view, d, def, finder);
                });
            }
        });
    }

    _setSingleConstraintFromDef(view, dimension, def, finder) {
        if(def && Array.isArray(def)) {
            view.setIntrisic(dimension, false)
            const constraints = [];
            def.forEach(df => {
                const ast = parser(df);
                const c = translate(ast, finder, this, view[dimension], defaultPriorityStrength)
                constraints.push(c);
                // constraints.push({
                //     relation: df.relation,
                //     expr: ConstraintLayout.resolveExpr(df, finder)
                // });
            })
            view.set(dimension, constraints, def);
        }
        if(def === INTRISIC) {
            view.setIntrisic(dimension, true)
        }
    }

    _removeSingleConstraint(solver, c) {
        if(!(c instanceof Intrisic)) {
            solver.removeConstraint(c);
        }
    }

    resetConstaintOnview(viewname, d) {
        const solver = this._solver; 
        const view = this._views.get(viewname);
        if(d === BOUNDING_RECT.WIDTH && view.useIntrisicWidth) {
            return;
        }
        if(d === BOUNDING_RECT.HEIGHT && view.useIntrisicHeight) {
            return;
        }
        const value = view[d].value();

        // const def = [{
        //     target: "",
        //     attr: "const",
        //     operator: "",
        //     value: value,
        //     relation: "Eq"
        // }]
        // view.set(d, [{
        //     relation: 'Eq',
        //     expr: value,
        // }], def);
        view.set(d, [
            new kiwi.Constraint(
                view[d],
                kiwi.Operator.Eq,
                value,
                defaultPriorityStrength
            )
        ], [
            `=${value}`
        ]);
        solver.addConstraint(view.getConstraint(d)[0])
    }

    getViewConstraintJSON(viewname) {
        const view = this._views.get(viewname);
        return view.toJSONConstraint();
    }

    getSelfConstraintJSON() {
        const c = {
            component: PARENT_SYMBOL,
        };
        Object.keys(this._defCopy).forEach(k => {
            if(this._defCopy[k]) {
                c[k] = this._defCopy[k];
            }
        });
        return c;
    }

    setConstraintOnView(viewname, d, def) {
        const solver = this._solver; 
        const view = this._views.get(viewname);
        view._solver_constraints.forEach(c => {
            this._removeSingleConstraint(solver, c);
        })
        const finder = this._genGetTarget(this._views);
        this._setSingleConstraintFromDef(view, d, def, finder);
        this._reflowView(view, solver);
        this.resize();
        return view.toJSONConstraint();
    }

    _reflowView(view, solver) {
        const c = view.getConstraints();
        c.forEach(_c => {
            if(_c instanceof Intrisic) {
                _c.onReflow(solver);
                const t = this.scheduleResize.bind(this);
                _c.observe(() => {
                    console.log('resize intrisic')
                    t();
                });
            } else {
                solver.addConstraint(_c)
            }
        })
    }

    _reflowSelf(solver) {
        this._solver_constraints.forEach(_c => {
            solver.addConstraint(_c.value)
        })
    }

    reflow() {
        this._solver = new kiwi.Solver();
        const solver = this._solver;
        // if(!this.useIntrisicWidth) {
        //     solver.addEditVariable(this.width, kiwi.Strength.strong);
        // }
        // if(!this.useIntrisicHeight) {
        //     solver.addEditVariable(this.height, kiwi.Strength.strong);
        // }
        this._views.forEach((view) => {
            this._reflowView(view, solver);
        });
        this._widthCoin.onReflow(solver);
        this._heightCoin.onReflow(solver);
        this._reflowSelf(solver);
    }

    resize() {
        const solver = this._solver; 
        // const root = this._root; 
        /* if(!this.useIntrisicWidth) {
            solver.suggestValue(this.width, root.clientWidth);
        }
        if(!this.useIntrisicHeight) {
            solver.suggestValue(this.height, root.clientHeight);
        }*/
        console.log('resize')

        this._widthCoin.updateValue(solver);
        this._heightCoin.updateValue(solver);
        this._views.forEach((view) => {
            const c = view.getConstraints();
            c.forEach(_c => {
                console.log(_c.toString())
                if(_c instanceof Intrisic) {
                    _c.onResize(solver);
                } 
            })
        });
        solver.updateVariables();
        this._views.forEach((view) => {
            view.onResize();
        });
        this._widthCoin.onResize();
        this._heightCoin.onResize();
        // this.onResize();
    }

    getSelfConstraint() {
        let c = {};
        let flag = false;
        const def1 = this._widthCoin.getJSONConstraints();
        if(def1) {
            c.width = def1;
            flag = true;
        }
        const def2 = this._heightCoin.getJSONConstraints();
        if(def2) {
            c.height = def2;
            flag = true;
        }
        if(flag) {
            return {
                component: '|',
                ...c
            }
        }
        return null;
    }

    getJSONConstraints(viewname) {
        if(viewname) {
            return this._views.get(viewname)?.toJSONConstraint();
        } 
        return this._views.map((view) => view.toJSONConstraint());
    }

    getViewConstraintBounding(viewname) {
        return this._views.get(viewname)?.getBoundingValues();
    }

    cleanConstraint() {
        // this.useIntrisicWidth = false;
        // this.useIntrisicHeight = false;
        // this._solver_constraints = [];
        // this._defCopy = {
        //     [BOUNDING_RECT.WIDTH]: null,
        //     [BOUNDING_RECT.HEIGHT]: null,
        // }
        // this.disconnectOb();
        this._widthCoin.setCoin(NORMAL, null);
        this._heightCoin.setCoin(NORMAL, null);
        this._views.forEach((view) => {
            view.destroy();
        });
    }

    cleanObserver() {
        this.disconnectOb();
    }

    scheduleResize() {
        requestAnimationFrame((timestamp) => {
            const isFirstTime = this.__clock__ !== timestamp
            if(isFirstTime) {
                console.log('scheduleResize')
                this.resize();
            }
            this.__clock__ = timestamp;
        })
    }
    // onResize() {
    //     const el = this._root;
    //     if(this.useIntrisicWidth) {
    //         const width = parseInt(this[BOUNDING_RECT.WIDTH].value());
    //         el.style.width = `${width}px`;
    //     }
    //     if(this.useIntrisicHeight) {
    //         const height = parseInt(this[BOUNDING_RECT.HEIGHT].value());
    //         el.style.height = `${height}px`;
    //     }
    // }

    getBounding(key) {
        if(key === BOUNDING_RECT.WIDTH) {
            const meta = this._widthCoin.getCurCoin();
            return {
                def: meta.def,
                value: this[key].value(),
                isDefault: false,
            }
        }

        if(key === BOUNDING_RECT.HEIGHT) {
            const meta = this._heightCoin.getCurCoin();
            return {
                def: meta.def,
                value: this[key].value(),
                isDefault: false,
            }
        }
        return null;
    }
}


// const layout = new ConstraintLayout({
//     getRoot() {
//         return this.$refs.root;
//     },
//     getChild(root, component) {
//         return root.querySelector(`[component-name="${component}"]`);
//     }
// });

export default ConstraintLayout;

