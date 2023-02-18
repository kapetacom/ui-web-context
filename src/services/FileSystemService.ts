import * as Path from "path";

import {FileInfo} from "@blockware/ui-web-types";
import {clusterPath} from "./ClusterConfig";
import {asSingleton, simpleFetch} from "../utils";

export interface FileSystemStore {
    getHomeFolder: () => Promise<string>
    listFilesInFolder:(path:string) => Promise<FileInfo[]>
    createFolder:(path:string, folderName:string) => Promise<boolean>
}

class FileSystemServiceImpl implements FileSystemStore {

    async createFolder(path: string, folderName: string) {
        const fullPath = Path.join(path, folderName);
        await simpleFetch(clusterPath(`/files/mkdir`, { path: fullPath }), {
            method: 'PUT'
        });
        return true;
    }

    async getHomeFolder():Promise<string> {
            const result = await simpleFetch(clusterPath(`/files/root`));
            return result.text();
    }

    async getProjectFolder():Promise<string> {
        const result = await simpleFetch(clusterPath(`/files/project/root`));
        return result.text();
    }

    async setProjectFolder(folder:string):Promise<string> {
        const result = await simpleFetch(clusterPath(`/files/project/root`), {
            headers: {
                'Content-Type': 'text/plain'
            },
            body: folder,
            method: 'POST'
        });
        return result.text();
    }

    async listFilesInFolder(path: string):Promise<FileInfo[]> {
        const result = await simpleFetch(clusterPath(`/files/list`, {path}));
        return result.json();
    }

    async readFile(path: string):Promise<string> {
        const result = await simpleFetch(clusterPath(`/files/readfile`, {path}));
        return result.text();
    }

    async writeFile(path: string, content:string):Promise<void> {
        await simpleFetch(clusterPath(`/files/writefile`, {path}), {
            headers: {
                'Content-Type': 'application/yaml'
            },
            body: content,
            method: 'POST'
        });
    }
}

export const FileSystemService = asSingleton('FileSystemService', new FileSystemServiceImpl());