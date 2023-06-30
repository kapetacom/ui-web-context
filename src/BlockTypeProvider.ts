import { IBlockTypeProvider } from '@kapeta/ui-web-types';
import { VersionMap } from './VersionMap';
import { asSingleton } from './utils';

class BlockTypeProviderImpl {
    private blockTypeMap = new VersionMap<IBlockTypeProvider>();

    private defaultKind?: string;

    get(key: string) {
        const config = this.blockTypeMap.get(key.toLowerCase());
        if (!config) {
            throw new Error(`Block type with kind ${key} not found.`);
        }
        return config;
    }

    getDefaultKind(): string {
        if (!this.defaultKind) {
            throw new Error('Default block kind not defined');
        }
        return this.defaultKind;
    }

    kinds() {
        return this.blockTypeMap.kinds();
    }

    exists(kind: string) {
        return this.blockTypeMap.exists(kind);
    }

    list() {
        return this.blockTypeMap.list();
    }

    listAll() {
        return this.blockTypeMap.listAll();
    }

    getVersionsFor(name: string) {
        return this.blockTypeMap.getVersionsFor(name);
    }

    register(component: IBlockTypeProvider) {
        let kind = component.kind.toLowerCase();
        this.blockTypeMap.add(component);

        if (!this.defaultKind || this.defaultKind.startsWith(kind + ':')) {
            //Make sure we use the latest if we have multiple versions
            this.defaultKind = `${kind}:${this.blockTypeMap.getLatestVersion(kind)}`;
        }
    }
}

export const BlockTypeProvider = asSingleton('BlockTypeProvider', new BlockTypeProviderImpl());
