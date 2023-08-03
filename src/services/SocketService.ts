import { Socket, io } from 'socket.io-client';
import { socketPath } from './ClusterConfig';
import { asSingleton } from '../utils';

class SocketServiceImpl {
    private readonly _socket: Socket;
    private readonly _enabled: boolean;
    private readonly _rooms: Set<string> = new Set<string>();

    constructor() {
        this._enabled = true;
        if (
            typeof window !== 'undefined' &&
            window['Kapeta'] &&
            !window['KapetaDesktop'] && //We're inside a browser - but in desktop mode
            window['Kapeta']['config'] &&
            window['Kapeta']['config'].socket_enabled !== undefined
        ) {
            //We're inside a browser
            this._enabled = window['Kapeta']['config'].socket_enabled;
        }

        if (this._enabled) {
            this._socket = io(socketPath(), {
                autoConnect: true,
                reconnection: true,
                reconnectionAttempts: Infinity,
                reconnectionDelay: 1000,
                transports: [ "websocket" ]
            });

            console.log('Connecting to socket: %s', socketPath());
            this._socket.on('reconnect', () => {
                console.log('Reconnected to socket server...');
                this._rooms.forEach((roomId) => {
                    this.emitJoinRoom(roomId);
                })
            });
        }
    }

    private emitJoinRoom(roomId: string) {
        this._socket && this._socket.emit('join', roomId);
    }

    joinRoom(roomId: string) {
        this.emitJoinRoom(roomId);
        this._rooms.add(roomId);
    }

    leaveRoom(roomId: string) {
        this._socket && this._socket.emit('leave', roomId);
        this._rooms.delete(roomId);
    }

    on(eventType: string, handler: any) {
        this._socket && this._socket.on(eventType, handler);
    }

    off(eventType: string, handler: any) {
        this._socket && this._socket.off(eventType, handler);
    }
}

export const SocketService = asSingleton('SocketService', new SocketServiceImpl());
