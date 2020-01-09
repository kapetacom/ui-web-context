import {AssetService} from './AssetService';
import {BlockTypeProvider} from '../BlockTypeProvider';

import {Asset, BlockKind} from "@blockware/ui-web-types";


export interface BlockStore {
    get(ref:string):Promise<Asset<BlockKind>>
}

class BlockServiceImpl implements BlockStore {
    async list():Promise<Asset<BlockKind>[]> {
        const assets = await AssetService.list();
        const kinds = BlockTypeProvider.kinds();
        return assets.filter((asset) => {
            return asset.exists &&
                kinds.indexOf(asset.kind) > -1;
        });
    }

    async get(ref:string):Promise<Asset<BlockKind>> {
        return AssetService.get(ref);
    }
}

export const BlockService = new BlockServiceImpl();