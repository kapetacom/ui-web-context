import {AssetService} from './AssetService';
import {BlockTypeProvider} from '../BlockTypeProvider';

import {Asset} from "@kapeta/ui-web-types";
import {asSingleton} from "../utils";
import { BlockDefinition } from '@kapeta/schemas';


export interface BlockStore {
    get(ref:string):Promise<Asset<BlockDefinition>>
}

class BlockServiceImpl implements BlockStore {
    async list():Promise<Asset<BlockDefinition>[]> {
        const assets = await AssetService.list();
        return assets.filter((asset) => {
            return asset.exists && BlockTypeProvider.exists(asset.kind)
        });
    }

    async get(ref:string):Promise<Asset<BlockDefinition>> {
        return AssetService.get(ref);
    }
}

export const BlockService = asSingleton('BlockService', new BlockServiceImpl());