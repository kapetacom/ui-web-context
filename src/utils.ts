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

export const simpleFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const response = await fetch(input, init);

    return handleResponse(response);
}

export const handleResponse = async (response:Response) => {
    if (!response.ok) {
        if (response.status === 404) {
            return null;
        }
        const data = await response.json();
        if (data?.error) {
            throw new Error(data.error);
        }

        throw new Error(`Request failed - status: ${response.status}`);
    }

    if (response.headers['content-type'] &&
        response.headers['content-type'].toLowerCase().indexOf('json') > -1) {
        return response.json();
    }
    return response.text();
}