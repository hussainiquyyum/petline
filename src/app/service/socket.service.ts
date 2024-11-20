import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';

const SERVER_URL = `${environment.socketUrl}`;

@Injectable({
  providedIn: 'root'
})
export class SocketService {
    // private socket: Socket;

    constructor() {
        // this.socket = io(SERVER_URL);
    }

    // getSocket(): Socket {
    //     // return this.socket;
    // }
}
