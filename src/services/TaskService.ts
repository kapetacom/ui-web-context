import {SocketService} from './SocketService';
import {clusterPath} from './ClusterConfig';
import {asSingleton, simpleFetch} from '../utils';

export const EVENT_TASK_UPDATED = 'task-updated';
export const EVENT_TASK_ADDED = 'task-added';
export const EVENT_TASK_REMOVED = 'task-removed';
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
}

class TaskServiceImpl implements TaskStore {
    get(id: string): Promise<Task> {
        return simpleFetch(clusterPath(`/tasks/${encodeURIComponent(id)}`));
    }

    list(): Promise<Task[]> {
        return simpleFetch(clusterPath(`/tasks/`));
    }

    subscribe(listener: (event: Task) => void, disconnectHandler?: () => void) {
        SocketService.on(
            EVENT_TASK_ADDED,
            listener
        );

        SocketService.on(
            EVENT_TASK_UPDATED,
            listener
        );

        if (disconnectHandler) {
            SocketService.on(
                'disconnect',
                disconnectHandler
            );
        }

        return () => {
            SocketService.off(EVENT_TASK_ADDED, listener);
            SocketService.off(EVENT_TASK_UPDATED, listener);
            if (disconnectHandler) {
                SocketService.off('disconnect',disconnectHandler);
            }
        }
    }
}

export const TaskService = asSingleton('TaskService', new TaskServiceImpl());
