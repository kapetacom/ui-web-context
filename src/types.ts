import { Asset, FileInfo, Identity, MemberIdentity, SchemaKind } from '@kapeta/ui-web-types';
import { BlockDefinition } from '@kapeta/schemas';

export interface AssetChangedEvent {
    context: string;
    payload: {
        type: string;
        definition: SchemaKind;
        asset: {
            handle: string;
            name: string;
            version: string;
        };
    };
}

export type AssetListener = (evt: AssetChangedEvent) => void;

export interface AssetStore {
    list: () => Promise<Asset[]>;
    get: (ref: string, ensure: boolean) => Promise<Asset>;
    import: (ref: string) => Promise<Asset[]>;
    create: (path: string, content: SchemaKind) => Promise<Asset[]>;
    remove: (ref: string) => Promise<void>;
}

export interface BlockStore {
    list(): Promise<Asset<BlockDefinition>[]>;
    get(ref: string): Promise<Asset<BlockDefinition>>;
}

export interface FileSystemStore {
    getHomeFolder: () => Promise<string>;
    listFilesInFolder: (path: string) => Promise<FileInfo[]>;
    createFolder: (path: string, folderName: string) => Promise<boolean>;
}

export interface IdentityStore {
    getCurrent(): Promise<Identity>;
    getMemberships(identityId: string): Promise<MemberIdentity[]>;
}

export enum TaskStatus {
    PENDING = 'PENDING',
    RUNNING = 'RUNNING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
}

export interface TaskMetadata {
    name: string;
    /**
     * A unique prefix for the task. If defined only 1 task with this ID prefix will be executed at a time
     */
    singleInstance?: string;
    progress?: number;

    [key: string]: any;
}

export interface Task {
    id: string;
    status: TaskStatus;
    errorMessage?: string;
    metadata: TaskMetadata;
}
export interface TaskStore {
    list: () => Promise<Task[]>;
    get: (id: string) => Promise<Task>;
    subscribe: (listener: (event: Task) => void, disconnectHandler?: () => void) => () => void;
}

export enum InstanceEventType {
    EVENT_INSTANCE_CHANGED = 'status-changed',
    EVENT_INSTANCE_CREATED = 'instance-created',
    EVENT_INSTANCE_EXITED = 'instance-exited',
    EVENT_INSTANCE_LOG = 'instance-log',
}

export interface FailedBlockMessage {
    error: string;
    status: InstanceEventType;
    instanceId: string;
}

export enum InstanceStatus {
    STARTING = 'starting',
    READY = 'ready',
    UNHEALTHY = 'unhealthy',
    EXITED = 'exited',
    STOPPED = 'stopped',
}

export interface SystemInfo {
    systemId: string;
    running: boolean;
    providerMethodId: string;
    callback: () => void;
}

export type PlanStatusListener = (res: SystemInfo) => void;
export type BlockStatusListener = (message: FailedBlockMessage) => void;
