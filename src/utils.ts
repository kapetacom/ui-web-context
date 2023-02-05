/**
 * Ensures that only 1 instance is used consistently.
 *
 * A bit of an anti-pattern though - should be refactored into creating and providing these specifically
 * where needed instead of relying on this.
 *
 * @param {string} id
 * @param {<T>} instance
 * @return {<T>}
 */
export const asSingleton = <T>(id: string, instance: T): T => {
    const global = window as any;
    if (!global.$$singletons) {
        global.$$singletons = {};
    }
    
    if (!global.$$singletons[id]) {
        global.$$singletons[id] = instance;
    }

    return global.$$singletons[id];
}