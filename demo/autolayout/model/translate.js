import * as kiwi from '@lume/kiwi';

const operatorMapping = {
    '+': 'plus',
    '-': 'minus',
    '*': 'multiply',
    '/': 'divide'
}

const relationMapping = {
    '=': 'Eq',
    '>=': 'Ge',
    '<=': 'Le'
}

function run(ast, getView, parentView) {
    switch(ast.type) {
        case 'parentViewAttribute':
            return parentView[ast.attribute];
        case 'ViewAttribute':
            return getView(ast.view)[ast.attribute];
        case 'Number':
            return ast.value;
        case 'Expression':
            const queue = ast.queue;
            const v = run(queue[0], getView, parentView);
            let expr = new kiwi.Expression(v);
            queue.slice(1).forEach(part => {
                expr = expr[operatorMapping[part.operator]](run(part.expr, getView, parentView))
            });
            return expr
    }
    return null;
}


export function translate(ast, getView, parentView, targetVariable, strength) {
    const kiwiRelation = kiwi.Operator[relationMapping[ast.relation]];
    return new kiwi.Constraint(
        targetVariable,
        kiwiRelation,
        run(ast.expr, getView, parentView),
        strength);
}