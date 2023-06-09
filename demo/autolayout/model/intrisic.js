import * as kiwi from '@lume/kiwi'; 
import { BOUNDING_RECT } from "./constance";
const DIMENSION_MAPPING = {
    [BOUNDING_RECT.WIDTH]: 'clientWidth',
    [BOUNDING_RECT.HEIGHT]: 'clientHeight',
}
export class Intrisic{
    _observer = null;
    constructor(key, variable, elem) {
        this.key = key;
        this.variable = variable;
        this.elem = elem;
    }
    onReflow(solver) {
        if(!solver.hasEditVariable(this.variable)){
            solver.addEditVariable(this.variable, kiwi.Strength.strong);
        }
    }
    onResize(solver) {
        console.log(this.elem[DIMENSION_MAPPING[this.key]])
        solver.suggestValue(this.variable, this.elem[DIMENSION_MAPPING[this.key]]);
    }
    observe(callback) {
        const observer = new ResizeObserver(callback);
        observer.observe(this.elem);
        this._observer = observer;
    }
    unObserve() {
        this._observer.disconnect();
    }
}