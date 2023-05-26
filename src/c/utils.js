export function findParent(instance, selector) {
    if(instance.constructor.TYPE === selector) {
        return instance;
    }
    const element = instance.documentElement.closest(selector);
    return element?.[JEDITOR_SYMBOL];
} 