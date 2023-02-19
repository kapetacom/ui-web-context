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
        return this.targetMap.list().filter((target) => {
            return containsIgnoreCase(target.blockKinds, versionLessKind);
        });
    }

    listAll(blockKind:string) {
        if (!blockKind) {
            return [];
        }
        const [versionLessKind] = blockKind.split(':');
        return this.targetMap.listAll().filter((target) => {
            return containsIgnoreCase(target.blockKinds, versionLessKind);
        });
    }

    getVersionsFor(name:string) {
        return this.targetMap.getVersionsFor(name);
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