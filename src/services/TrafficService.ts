
import SocketService from "./SocketService";

import { HTTPResponse, HTTPRequest } from "@blockware/ui-web-types";

export enum TrafficEventType {
    TRAFFIC_START = 'traffic_start',
    TRAFFIC_END = 'traffic_end'
}

export interface Traffic {
    connectionId: string
    consumerMethodId: string
    created: number
    ended: number
    error: string
    id: string
    providerMethodId:string
    request:HTTPRequest
    response?:HTTPResponse
}

export type ConnectionListener = (traffic:Traffic) => void

class TrafficServiceImpl {

    subscribe(connectionId:string, eventType:TrafficEventType, handler:ConnectionListener) {

        SocketService.joinRoom(connectionId);
        SocketService.on(eventType, handler);

        return () => {
            this.unsubscribe(connectionId, eventType, handler);
        };
    }

    unsubscribe(connectionId:string, eventType:TrafficEventType, handler:ConnectionListener) {

        SocketService.leaveRoom(connectionId);
        SocketService.off(eventType, handler);
    }

}

export const TrafficService = new TrafficServiceImpl()