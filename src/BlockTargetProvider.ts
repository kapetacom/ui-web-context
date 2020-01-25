import {TargetConfig} from "@blockware/ui-web-types";

function containsIgnoreCase(list:string[], key:string) {
    return list.map((val) => val.toLowerCase()).indexOf(key.toLowerCase()) > -1;
}

class BlockTargetProviderImpl {

    private targetMap = new Map<string, TargetConfig>();

    get(key: string, blockKind:string):TargetConfig {
        let targetConfig = this.targetMap.get(key.toLowerCase());
        if (!targetConfig) {
            throw new Error(`Target named ${key} not found.`);
        }

        if (!containsIgnoreCase(targetConfig.blockKinds, blockKind)) {
            throw new Error(`Target ${key} not applicable for block kind ${blockKind}.`);
        }

        return targetConfig;
    }

    list(blockKind:string) {
        return Array.from(this.targetMap.values()).filter((target) => {
            return containsIgnoreCase(target.blockKinds, blockKind);
        });
    }

    kinds() {
        return Array.from(this.targetMap.keys());
    }

    exists(kind:string) {
        return this.kinds().includes(kind.toLowerCase());
    }

    register(target: TargetConfig) {
        this.targetMap.set(target.kind.toLowerCase(), target);
    }

}

export const BlockTargetProvider = new BlockTargetProviderImpl();