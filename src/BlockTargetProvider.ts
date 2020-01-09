import {TargetConfig} from "@blockware/ui-web-types";

class BlockTargetProviderImpl {

    private targetMap = new Map<string, TargetConfig>();

    get(blockKind:string, key: string):TargetConfig {
        let targetConfig = this.targetMap.get(key);
        if (!targetConfig) {
            throw new Error(`Target named ${key} not found.`);
        }
        return targetConfig;
    }

    list(blockKind:string) {
        return Array.from(this.targetMap.values());
    }

    register(target: TargetConfig) {
        this.targetMap.set(target.kind, target);
    }

}

export const BlockTargetProvider = new BlockTargetProviderImpl();