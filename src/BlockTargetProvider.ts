import {TargetConfig} from "@blockware/ui-web-types";
import {VersionMap} from "./VersionMap";
import {asSingleton} from "./utils";

function containsIgnoreCase(list:string[], key:string) {
    return list.map((val) => val.toLowerCase()).indexOf(key.toLowerCase()) > -1;
}

class BlockTargetProviderImpl {

    private targetMap = new VersionMap<TargetConfig>();

    get(key: string, blockKind:string):TargetConfig {
        let targetConfig = this.targetMap.get(key.toLowerCase());
        if (!targetConfig) {
            throw new Error(`Target named ${key} not found.`);
        }

        const blockKindNoVersion = blockKind.split(':')[0]

        if (!containsIgnoreCase(targetConfig.blockKinds, blockKindNoVersion)) {
            throw new Error(`Target ${key} not applicable for block kind ${blockKindNoVersion}.`);
        }

        return targetConfig;
    }

    list(blockKind:string) {
        const [versionLessKind] = blockKind.split(':');
        console.log('list targets for blockKind', versionLessKind, this.targetMap.list());
        return this.targetMap.list().filter((target) => {
            return containsIgnoreCase(target.blockKinds, versionLessKind);
        });
    }

    kinds() {
        return this.targetMap.kinds();
    }

    exists(kind:string) {
        return this.targetMap.exists(kind);
    }

    register(target: TargetConfig) {
        this.targetMap.add(target);
    }

}

export const BlockTargetProvider = asSingleton('BlockTargetProvider', new BlockTargetProviderImpl());