/**
 * Copyright 2023 Kapeta Inc.
 * SPDX-License-Identifier: MIT
 */

import * as _ from 'lodash';

import { IResourceTypeProvider, IResourceTypeConverter } from '@kapeta/ui-web-types';
import { Resource } from '@kapeta/schemas';
import { VersionMap } from './VersionMap';
import { asSingleton } from './utils';
import { parseKapetaUri } from '@kapeta/nodejs-utils';

class ResourceTypeProviderImpl {
    private resourceTypeMap = new VersionMap<IResourceTypeProvider>();

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

    getVersionsFor(name: string) {
        return this.resourceTypeMap.getVersionsFor(name);
    }

    kinds() {
        return this.resourceTypeMap.kinds();
    }

    exists(kind: string) {
        return this.resourceTypeMap.exists(kind);
    }

    register(component: IResourceTypeProvider) {
        this.resourceTypeMap.add(component);
    }

    canApplyResourceToKind(resourceKind: string, targetKind: string) {
        const resourceUri = parseKapetaUri(resourceKind);
        const targetUri = parseKapetaUri(targetKind);
        if (resourceUri.equals(targetUri)) {
            return true;
        }

        const targetConfig = this.get(targetKind);

        const parsedResourceKind = this.resourceTypeMap.parseKind(resourceKind);

        if (targetConfig.converters && _.find(targetConfig.converters, { fromKind: parsedResourceKind.name })) {
            return true;
        }

        return false;
    }

    renameEntityReferences(resource: Resource, from: string, to: string): void {
        const resourceConfig = this.get(resource.kind);

        if (!resourceConfig.renameEntityReferences) {
            return;
        }

        resourceConfig.renameEntityReferences(resource, from, to);
    }

    resolveEntities(resource: Resource): string[] {
        const resourceConfig = this.get(resource.kind);

        if (!resourceConfig.resolveEntities) {
            return [];
        }

        const usedEntityNames = resourceConfig.resolveEntities(resource);

        return _.uniq(usedEntityNames);
    }

    getConverterFor(resourceKind: string, targetKind: string): IResourceTypeConverter | undefined {
        const parsedTargetKind = this.resourceTypeMap.parseKind(targetKind);
        const parsedResourceKind = this.resourceTypeMap.parseKind(resourceKind);
        const targetConfig = this.get(parsedTargetKind.id);

        if (targetConfig.converters) {
            return _.find(targetConfig.converters, { fromKind: parsedResourceKind.name });
        }

        return undefined;
    }

    convertToConsumable(fromKind: Resource): Resource {
        const data = _.cloneDeep(fromKind);
        const targetConfig = this.get(fromKind.kind);
        if (!targetConfig.consumableKind) {
            return data;
        }

        return this.convertTo(data, targetConfig.consumableKind);
    }

    convertTo(fromKind: Resource, targetKind: string): Resource {
        let parsedTargetKind = this.resourceTypeMap.parseKind(targetKind);
        const parsedFromKind = this.resourceTypeMap.parseKind(fromKind.kind);

        if (
            parsedFromKind.version === 'local' &&
            parsedTargetKind.version !== 'local' &&
            this.get(`${parsedTargetKind.name}:local`)
        ) {
            //If we're converting a local version - and we've got the target kind as local
            // - then also use local version for that
            parsedTargetKind = this.resourceTypeMap.parseKind(`${parsedTargetKind.name}:local`);
        }

        if (parsedFromKind.name === parsedTargetKind.name) {
            return { ...fromKind };
        }

        const converter = this.getConverterFor(parsedFromKind.id, parsedTargetKind.id);
        if (!converter || !converter.createFrom) {
            return { ...fromKind, kind: parsedTargetKind.id };
        }

        fromKind.kind = parsedTargetKind.id;
        return converter.createFrom(fromKind);
    }
}

export const ResourceTypeProvider = asSingleton('ResourceTypeProvider', new ResourceTypeProviderImpl());
