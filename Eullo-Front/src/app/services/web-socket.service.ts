import {Injectable} from '@angular/core';
import * as io from "socket.io-client" ;
import {Observable} from "rxjs";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  socket: any;

  constructor() {
    this.socket = io(environment.BASE_URL, {'multiplex': false});
    console.log("Before Connection")
    let connection_infos = "It's me Mario"
    this.socket.on('connect', () => {
      this.socket.emit('message', {data: 'I\'m connected!'});
    });
  }

  listen(eventName: string) {
    return new Observable((subscriber => {
      this.socket.on(eventName, (data: any) => {
        subscriber.next(data);
      });
    }));
  }

  emit(eventName: string, data: any) {
    this.socket.emit(eventName, data);
  }
}
