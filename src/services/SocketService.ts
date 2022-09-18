
import {Socket, io} from "socket.io-client";
import { socketPath } from "./ClusterConfig";

class SocketService{
    _socket: Socket;

    constructor() {
        this._socket = io(socketPath());
    }

    joinRoom(roomId: string) {
        this._socket.emit("join", roomId)
    }

    leaveRoom(roomId: string) {
        this._socket.emit("leave", roomId)
    }

    on(eventType:string, handler:any) {
        this._socket.on(eventType, handler);
    }

    off(eventType:string, handler:any) {
        this._socket.off(eventType, handler);
    }
    
    socket() {
        return this._socket;
    }
}

export default new SocketService();