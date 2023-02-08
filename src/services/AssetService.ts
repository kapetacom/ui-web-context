import {EventEmitter} from "events";
import SocketService from "./SocketService";

import {
    Asset,
    SchemaKind
} from "@blockware/ui-web-types";

import {clusterPath} from "./ClusterConfig";
import YAML from 'yaml';
import {asSingleton} from "../utils";

export interface AssetChangedEvent {
    context:string
    payload: {
        type:string
        definition: {
            kind:string,
            metadata: {
                name:string
                title?:string
                description?:string
            }
            spec?: {[key:string]:any}
        }
        asset: {
            handle:string,
            name:string,
            version:string
        }
    }
}

export type AssetListener = (evt:AssetChangedEvent) => void

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

    /**
     * Subscribes to whenever providers with a web UI is added / removed (not blocks, plans etc)
     * This is to allow the UI to react to such events.
     *
     * @param handler
     */
    subscribe( handler:AssetListener) {

        SocketService.joinRoom('assets');
        SocketService.on('changed', handler);

        return () => {
            this.unsubscribe(handler);
        };
    }

    unsubscribe(handler:AssetListener) {

        SocketService.leaveRoom('assets');
        SocketService.off('changed', handler);
    }

}

export const AssetService = asSingleton('AssetService', new AssetServiceImpl());