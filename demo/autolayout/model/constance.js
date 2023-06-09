import * as kiwi from '@lume/kiwi'; 
export const BOUNDING_RECT = {
    LEFT: 'left',
    RIGHT: 'right',
    TOP: 'top',
    BOTTOM: 'bottom',
    WIDTH: 'width',
    HEIGHT: 'height',
    CENTERX: 'centerX',
    CENTERY: 'centerY',
}

export const INTRISIC = 'intrisic';
export const NORMAL = 'normal';

export const ATTRIBUTES = {
    ...BOUNDING_RECT,
    CONST: 'const',
    BOTTOM_EDGE: 'bottomedge',
    RIGHT_EDGE: 'rightedge',
    LEFT_EDGE: 'leftedge',
    TOP_EDGE: 'topedge',
}
export const ATTRIBUTES_VALS = Object.values(ATTRIBUTES)
export const OPERATOR = {
    PLUS: 'plus',
    MINUS: 'minus',
    MULTIPLY: 'multiply',
    DIVIDE: 'divide'
}
export const OPERATOR_VALS = Object.values(OPERATOR)
export const RELATION = {
    Eq: 'Eq',
    Ge: 'Ge',
    Le: 'Le'
}
export const RELATIONLIST = ['Le', 'Ge', 'Eq'];


export const defaultPriorityStrength = kiwi.Strength.create(0, 1000, 1000);
export const generatePriortyStrength =  kiwi.Strength.create(0, 500, 1000);