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
    RELATION
} from './constance';

import { View } from './view';

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
                        console.log(target, attr, variable, operator, value)
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

    _solver = null;

    _views = new Map();

    constructor(configs) {
        this._getChild = configs.getChild;
        this._root = configs.root;
        this._root._constraints_ = this;
        this[BOUNDING_RECT.WIDTH].setContext('_parent_');
        this[BOUNDING_RECT.HEIGHT].setContext('_parent_');
        this._observe();
    }

    _observe() {
        const observer = new ResizeObserver(() => {
            if(this._solver) {
                this.resize()
            }
        });
        observer.observe(this._root);
    }

    _genGetTarget(views) {
        return (target) => {
            if(target === PARENT_SYMBOL) {
                return this
            }
            return views.get(target);
        }
    }

    setConstraint(constraints) {
        this._views = new Map();
        const views = this._views;
        const root = this._root;
        constraints.forEach(c => {
            const component = c.component;
            const element = this._getChild(root, component);
            views.set(component, new View(element, this, component));
        });
        const finder = this._genGetTarget(views);
        constraints.forEach(c => {
            const component = c.component;
            const view = views.get(component);
            if(view) {
                Object.values(BOUNDING_RECT).forEach(d => {
                    const def = c[d];
                    if(def) {
                        const expr = ConstraintLayout.resolveExpr(def, finder);
                        view.set(d, def.relation, expr, def);
                    }
                });
            }
        });
    }

    resetConstaintOnview(viewname, d) {
        const solver = this._solver; 
        const view = this._views.get(viewname);
        const value = view[d].value();
        view._solver_constraints.forEach(c => {
            solver.removeConstraint(c);
        })
        view.set(d, RELATION.Eq, value, {
            target: "",
            attr: "const",
            operator: "",
            value: value,
            relation: "Eq"
        });
        const c = view.getConstraints();
        c.forEach(_c => {
            solver.addConstraint(_c)
        })
        this._views.forEach((view) => {
            view.onResize();
        });
        return view.toJSONConstraint();
    }

    getViewConstraintJSON(viewname) {
        const view = this._views.get(viewname);
        return view.toJSONConstraint();
    }

    setConstraintOnView(viewname, d, def) {
        const solver = this._solver; 
        const view = this._views.get(viewname);
        view._solver_constraints.forEach(c => {
            solver.removeConstraint(c);
        })
        const finder = this._genGetTarget(this._views);
        const expr = ConstraintLayout.resolveExpr(def, finder);
        view.set(d, def.relation, expr, def);
        const c = view.getConstraints();
        c.forEach(_c => {
            solver.addConstraint(_c)
        })
        
        solver.updateVariables();
        // console.log(solver)
        this._views.forEach((view) => {
            const c = view.getConstraints();
            c.forEach(_c => {
                console.log(_c.toString())
            })
        });
        this._views.forEach((view) => {
            view.onResize();
        });
        return view.toJSONConstraint();
    }

    reflow() {
        this._solver = new kiwi.Solver();
        const solver = this._solver;
        solver.addEditVariable(this.width, kiwi.Strength.strong);
        solver.addEditVariable(this.height, kiwi.Strength.strong);
        this._views.forEach((view) => {
            const c = view.getConstraints();
            c.forEach(_c => {
                solver.addConstraint(_c)
            })
        });
    }

    resize() {
        const solver = this._solver; 
        const root = this._root; 
        solver.suggestValue(this.width, root.clientWidth);
        solver.suggestValue(this.height, root.clientHeight);
        solver.updateVariables();
        // this._views.forEach((view) => {
        //     const c = view.getConstraints();
        //     c.forEach(_c => {
        //         console.log(_c.toString())
        //     })
        // });
        // console.log(solver)
        this._views.forEach((view) => {
            view.onResize();
        });
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

