
import {Socket, io} from "socket.io-client";
import { socketPath } from "./ClusterConfig";
import {asSingleton} from "../utils";

class SocketService {
    private readonly _socket: Socket;
    private readonly _enabled: boolean;

    constructor() {
        this._enabled = true;
        if (typeof window !== 'undefined' &&
            window['Kapeta'] &&
            window['Kapeta']['config'] &&
            window['Kapeta']['config'].socket_enabled !== undefined) {
            //We're inside a browser
            this._enabled = window['Kapeta']['config'].socket_enabled;
        }

        if (this._enabled) {
            this._socket = io(socketPath());
        }
    }

    joinRoom(roomId: string) {
        this._socket &&
        this._socket.emit("join", roomId)
    }

    leaveRoom(roomId: string) {
        this._socket &&
        this._socket.emit("leave", roomId)
    }

    on(eventType:string, handler:any) {
        this._socket &&
        this._socket.on(eventType, handler);
    }

    off(eventType:string, handler:any) {
        this._socket &&
        this._socket.off(eventType, handler);
    }
}

export default asSingleton('SocketService', new SocketService());