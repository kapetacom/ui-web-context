import {SocketService} from "./SocketService";
import { clusterPath } from "./ClusterConfig";
import _ from "lodash";
import {asSingleton, simpleFetch} from "../utils";

export enum InstanceEventType {
    EVENT_INSTANCE_CHANGED = 'status-changed',
    EVENT_INSTANCE_CREATED = 'instance-created',
    EVENT_INSTANCE_EXITED = 'instance-exited',
    EVENT_INSTANCE_LOG = 'instance-log'
}

export interface FailedBlockMessage {
    error:string,
    status:InstanceEventType,
    instanceId:string
}

export enum InstanceStatus {
    STARTING = 'starting',
    READY = 'ready',
    UNHEALTHY = 'unhealthy',
    EXITED = 'exited',
    STOPPED = 'stopped'
}

export interface SystemInfo {
    systemId: string
    running: boolean
    providerMethodId: string
    callback: () => void
}

export type PlanStatusListener = (res: SystemInfo) => void;
export type BlockStatusListener = (message: FailedBlockMessage) => void;

const contextHandlers: any[] = [];
const joinedRooms:{[key:string]:number} = {};

class InstanceServiceImpl {
    // The ID can be both a block ID or A PLAN ID
    public subscribe(id: string, eventType: InstanceEventType, handler: PlanStatusListener | BlockStatusListener) {

        const contextId = `${id}/instances`;
        SocketService.joinRoom(contextId);

        if (!joinedRooms[contextId]) {
            joinedRooms[contextId] = 0;
        }

        joinedRooms[contextId]++;

        const contextHandler = (evt: any) => {
            if (evt.context !== contextId) {
                return;
            }

            return handler(evt.payload);
        };

        contextHandlers.push({ handler, contextHandler });

        SocketService.on(eventType, contextHandler);
        return () => {
            this.unsubscribe(id, eventType, contextHandler);
        };
    }

    public unsubscribe(systemId: string, eventType: InstanceEventType, handler: PlanStatusListener) {

        const contextId = `${systemId}/instances`;
        const contextHandlerObj = _.remove(contextHandlers, { handler })[0];

        if (joinedRooms[contextId] > 0) {
            joinedRooms[contextId]--;

            if (joinedRooms[contextId] < 1) {
                SocketService.leaveRoom(`${systemId}/instances`);
            }
        }

        if (contextHandlerObj) {
            SocketService.off(eventType, contextHandlerObj.contextHandler);
        } else {
            SocketService.off(eventType, handler);
        }

    }

    async getInstanceCurrentStatus() {
        return simpleFetch(clusterPath(`/instances`), { method: "GET" });
    }

    async getInstanceStatusForPlan(systemId) {
        return simpleFetch(clusterPath(`/instances/${encodeURIComponent(systemId)}/instances`), { method: "GET" });
    }

    async startInstances(systemId: string) {
        return simpleFetch(clusterPath(`/instances/${encodeURIComponent(systemId)}/start`), { method: "POST" });
    }

    async stopInstances(systemId: string) {
        return simpleFetch(clusterPath(`/instances/${encodeURIComponent(systemId)}/stop`), { method: "POST" });
    }

    async startInstance(systemId: string, instanceId: string) {
        return simpleFetch(clusterPath(`/instances/${encodeURIComponent(systemId)}/${encodeURIComponent(instanceId)}/start`), { method: "POST" });
    }

    async stopInstance(systemId: string, instanceId: string) {
        return simpleFetch(clusterPath(`/instances/${encodeURIComponent(systemId)}/${encodeURIComponent(instanceId)}/stop`), { method: "POST" });
    }

    async getInstanceLogs(systemId: string, instanceId: string) {
        return simpleFetch(clusterPath(`/instances/${encodeURIComponent(systemId)}/${encodeURIComponent(instanceId)}/logs`), { method: "GET" });
    }
}

export const InstanceService =  asSingleton('InstanceService', new InstanceServiceImpl());