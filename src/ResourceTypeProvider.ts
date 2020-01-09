import * as _ from 'lodash';

import {ResourceConfig, ResourceKind, ResourceConverter} from "@blockware/ui-web-types";

class ResourceTypeProviderImpl {

    private resourceTypeMap = new Map<string, ResourceConfig>();

    get(key: string) {
        const config = this.resourceTypeMap.get(key);
        if (!config) {
            throw new Error(`Resource type with kind ${key} not found.`);
        }
        return config;
    }

    list() {
        return Array.from(this.resourceTypeMap.values());
    }

    kinds() {
        return Array.from(this.resourceTypeMap.keys());
    }


    register(component: ResourceConfig) {
        this.resourceTypeMap.set(component.kind, component);
    }

    canApplyResourceToKind(resourceKind:string, targetKind:string) {
        if (resourceKind === targetKind) {
            return true;
        }

        const targetConfig = this.get(targetKind);

        if (targetConfig.converters && 
            _.find(targetConfig.converters, {fromKind: resourceKind})) {
            return true;
        }

        return false;
    }

    renameEntityReferences(resource: ResourceKind, from:string, to:string):void {
        const resourceConfig = this.get(resource.kind);

        if (!resourceConfig.renameEntityReferences) {
            return;
        }

        resourceConfig.renameEntityReferences(resource, from, to);
    }

    resolveEntities(resource: ResourceKind):string[] {
        const resourceConfig = this.get(resource.kind);

        if (!resourceConfig.resolveEntities) {
            return [];
        }

        const usedEntityNames = resourceConfig.resolveEntities(resource);

        return _.uniq(usedEntityNames);
    }

    getConverterFor(resourceKind:string, targetKind:string):ResourceConverter|undefined {
        const targetConfig = this.get(targetKind);

        if (targetConfig.converters) {
            return _.find(targetConfig.converters, {fromKind: resourceKind});
        }

        return;
    }
    
    convertToConsumable(fromKind:ResourceKind):ResourceKind {
        const data = _.cloneDeep(fromKind);
        const targetConfig = this.get(fromKind.kind);
        if (!targetConfig.consumableKind) {
            return data;
        }
        
        return this.convertTo(data, targetConfig.consumableKind);
    }

    convertTo(fromKind:ResourceKind, targetKind:string):ResourceKind {
        if (fromKind.kind === targetKind) {
            return {...fromKind};
        }

        const converter = this.getConverterFor(fromKind.kind, targetKind);
        if (!converter || !converter.createFrom) {
             return {...fromKind, kind: targetKind};
        }
        
        return converter.createFrom(fromKind);
    }
}

export const ResourceTypeProvider = new ResourceTypeProviderImpl();
