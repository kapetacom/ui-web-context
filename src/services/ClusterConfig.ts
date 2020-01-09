import {electronRemote, isElectron} from "@blockware/ui-web-utils";

const querystring = require('querystring');

let baseUrl;

if (isElectron()) {
    //We're inside Electron

    const localClusterConfig = electronRemote('@blockware/local-cluster-config');
    baseUrl = localClusterConfig.getClusterServiceAddress();
} else {
    baseUrl = process.env.REACT_APP_CLUSTER_SERVICE;
}

export const CLUSTER_SERVICE_BASEURL = baseUrl ? baseUrl : "http://localhost:35100";

export function clusterPath(path:string, query?:{[key:string]:string}) {
    if (!path.startsWith('/')) {
        path = '/' + path;
    }

    let base = CLUSTER_SERVICE_BASEURL;
    if (base.endsWith('/') ) {
        base = base.substr(0, base.length - 1);
    }

    let url = base + path;

    if (query) {
        url += '?' + querystring.stringify(query);
    }

    return url;
}

export function socketPath(){
    return CLUSTER_SERVICE_BASEURL;
}