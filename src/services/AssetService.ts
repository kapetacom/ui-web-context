import {EventEmitter} from "events";

import {
    Asset,
    SchemaKind
} from "@blockware/ui-web-types";

import {clusterPath} from "./ClusterConfig";
import YAML from 'yaml';
import {asSingleton} from "../utils";

export interface AssetStore {
    list: () => Promise<Asset[]>
    get: (ref:string) => Promise<Asset>;
    import: (ref:string) => Promise<Asset[]>
    create: (path:string, content:SchemaKind) => Promise<Asset[]>
    remove: (ref:string) => Promise<void>
}

class AssetServiceImpl extends EventEmitter implements AssetStore {
    async list():Promise<Asset[]> {
        const result = await fetch(clusterPath(`/assets/`));
        return result.json();
    }

    async get(ref:string):Promise<Asset> {
        const result = await fetch(clusterPath(`/assets/read`, {ref}));
        return result.json();
    }

    async import(ref:string):Promise<Asset[]> {
        const result = await fetch(clusterPath(`/assets/import`, {ref}),{
            method: 'PUT'
        });

        this.emit('change');
        return result.json();
    }

    async create(path:string, content:SchemaKind):Promise<Asset[]> {
        const result = await fetch(clusterPath(`/assets/create`, {path}),{
            headers: {
                'Content-Type': 'application/yaml'
            },
            body: YAML.stringify(content),
            method: 'POST'
        });

        this.emit('change');

        return result.json();
    }

    async update(ref: string, content: SchemaKind) {
        await fetch(clusterPath(`/assets/update`, {ref}),{
            headers: {
                'Content-Type': 'application/yaml'
            },
            body: YAML.stringify(content),
            method: 'PUT'
        });

        this.emit('change');
    }

    async remove(ref:string):Promise<void> {
        await fetch(clusterPath(`/assets/`, {ref}),{
            method: 'DELETE'
        });

        this.emit('change');
    }


}

export const AssetService = asSingleton('AssetService', new AssetServiceImpl());