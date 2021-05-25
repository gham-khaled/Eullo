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
    // @ts-ignore
    this.socket = io(environment.BASE_URL);
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
