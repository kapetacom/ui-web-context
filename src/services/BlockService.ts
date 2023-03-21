import {AssetService} from './AssetService';
import {BlockTypeProvider} from '../BlockTypeProvider';

import {Asset, BlockKind} from "@kapeta/ui-web-types";
import {asSingleton} from "../utils";


export interface BlockStore {
    get(ref:string):Promise<Asset<BlockKind>>
}

class BlockServiceImpl implements BlockStore {
    async list():Promise<Asset<BlockKind>[]> {
        const assets = await AssetService.list();
        return assets.filter((asset) => {
            return asset.exists && BlockTypeProvider.exists(asset.kind)
        });
    }

    async get(ref:string):Promise<Asset<BlockKind>> {
        return AssetService.get(ref);
    }
}

export const BlockService = asSingleton('BlockService', new BlockServiceImpl());