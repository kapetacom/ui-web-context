import * as _ from 'lodash';

import {ResourceConfig, ResourceKind, ResourceConverter} from "@blockware/ui-web-types";
import {VersionMap} from "./VersionMap";
import {asSingleton} from "./utils";

class ResourceTypeProviderImpl {

    private resourceTypeMap = new VersionMap<ResourceConfig>();

    get(key: string) {
        const config = this.resourceTypeMap.get(key);
        if (!config) {
            throw new Error(`Resource type with kind ${key} not found.`);
        }
        return config;
    }

    list() {
        return this.resourceTypeMap.list();
    }

    listAll() {
        return this.resourceTypeMap.listAll();
    }

    getVersionsFor(name:string) {
        return this.resourceTypeMap.getVersionsFor(name);
    }

    kinds() {
        return this.resourceTypeMap.kinds();
    }

    exists(kind:string) {
        return this.resourceTypeMap.exists(kind);
    }

    register(component: ResourceConfig) {
        this.resourceTypeMap.add(component);
    }

    canApplyResourceToKind(resourceKind:string, targetKind:string) {
        if (resourceKind === targetKind) {
            return true;
        }

        const targetConfig = this.get(targetKind);

        const parsedResourceKind = this.resourceTypeMap.parseKind(resourceKind);

        if (targetConfig.converters && 
            _.find(targetConfig.converters, {fromKind: parsedResourceKind.name})) {
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
        const parsedTargetKind = this.resourceTypeMap.parseKind(targetKind);
        const parsedResourceKind = this.resourceTypeMap.parseKind(resourceKind);
        const targetConfig = this.get(parsedTargetKind.id);

        if (targetConfig.converters) {
            return _.find(targetConfig.converters, {fromKind: parsedResourceKind.name});
        }

        return undefined;
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
        const parsedTargetKind = this.resourceTypeMap.parseKind(targetKind);
        const parsedFromKind = this.resourceTypeMap.parseKind(fromKind.kind);

        if (parsedFromKind.name === parsedTargetKind.name) {
            return {...fromKind};
        }

        const converter = this.getConverterFor(fromKind.kind, parsedTargetKind.id);
        if (!converter || !converter.createFrom) {
             return {...fromKind, kind: parsedTargetKind.id};
        }

        fromKind.kind = parsedTargetKind.id;
        
        return converter.createFrom(fromKind);
    }
}

export const ResourceTypeProvider = asSingleton('ResourceTypeProvider', new ResourceTypeProviderImpl());
