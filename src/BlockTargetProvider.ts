/**
 * Copyright 2023 Kapeta Inc.
 * SPDX-License-Identifier: MIT
 */

import { ILanguageTargetProvider } from '@kapeta/ui-web-types';
import { VersionMap } from './VersionMap';
import { asSingleton } from './utils';
import { parseKapetaUri } from '@kapeta/nodejs-utils';

function containsIgnoreCase(list: string[], key: string) {
    return list.map((val) => val.toLowerCase()).indexOf(key.toLowerCase()) > -1;
}

class BlockTargetProviderImpl {
    private targetMap = new VersionMap<ILanguageTargetProvider>();

    get(key: string, blockKind: string): ILanguageTargetProvider {
        let targetConfig = this.targetMap.get(key.toLowerCase());
        if (!targetConfig) {
            throw new Error(`Target named ${key} not found.`);
        }

        const kindName = parseKapetaUri(blockKind).fullName;
        if (!containsIgnoreCase(targetConfig.blockKinds, kindName)) {
            throw new Error(`Target ${key} not applicable for block kind ${kindName}.`);
        }

        return targetConfig;
    }

    list(blockKind: string) {
        if (!blockKind) {
            return [];
        }
        const kindName = parseKapetaUri(blockKind).fullName;
        return this.targetMap.list().filter((target) => {
            return containsIgnoreCase(target.blockKinds, kindName);
        });
    }

    listAll(blockKind: string) {
        if (!blockKind) {
            return [];
        }
        const kindName = parseKapetaUri(blockKind).fullName;
        return this.targetMap.listAll().filter((target) => {
            return containsIgnoreCase(target.blockKinds, kindName);
        });
    }

    getVersionsFor(name: string) {
        return this.targetMap.getVersionsFor(name);
    }

    kinds() {
        return this.targetMap.kinds();
    }

    exists(kind: string) {
        return this.targetMap.exists(kind);
    }

    register(target: ILanguageTargetProvider) {
        this.targetMap.add(target);
    }
}

export const BlockTargetProvider = asSingleton('BlockTargetProvider', new BlockTargetProviderImpl());
