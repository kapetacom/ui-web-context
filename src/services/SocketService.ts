
import socketIOClient from "socket.io-client";
import { socketPath } from "./ClusterConfig";

class SocketService{
    _socket: SocketIOClient.Socket;

    constructor() {
        this._socket = socketIOClient(socketPath());
    }

    joinRoom(roomId: string) {
        this._socket.emit("join", roomId)
    }

    leaveRoom(roomId: string) {
        this._socket.emit("leave", roomId)
    }

    on(eventType:string, handler:Function) {
        this._socket.on(eventType, handler);
    }

    off(eventType:string, handler:Function) {
        this._socket.removeEventListener(eventType, handler);
    }
    
    socket() {
        return this._socket;
    }
}

export default new SocketService();