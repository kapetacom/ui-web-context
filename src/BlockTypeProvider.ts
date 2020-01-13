import {BlockConfig} from "@blockware/ui-web-types";

class BlockTypeProviderImpl {

    private blockTypeMap = new Map<string, BlockConfig>();

    private defaultKind?:string;

    get(key: string) {
        const config = this.blockTypeMap.get(key.toLowerCase())
        if (!config) {
            throw new Error(`Block type with kind ${key} not found.`);
        }
        return config;
    }

    getDefaultKind():string {
        if (!this.defaultKind) {
            throw new Error('Default block kind not defined');
        }
        return this.defaultKind;
    }

    kinds() {
        return Array.from(this.blockTypeMap.keys());
    }

    list() {
        return Array.from(this.blockTypeMap.values());
    }

    register(component: BlockConfig) {
        let kind = component.kind.toLowerCase();
        this.blockTypeMap.set(kind, component);

        if (!this.defaultKind) {
            this.defaultKind = kind;
        }
    }

}

export const BlockTypeProvider = new BlockTypeProviderImpl();