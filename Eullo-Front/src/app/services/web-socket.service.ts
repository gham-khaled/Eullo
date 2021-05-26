import {Injectable} from '@angular/core';
import * as io from "socket.io-client" ;
import {Observable} from "rxjs";
import {environment} from "../../environments/environment";
import {AuthService} from "./authentication/auth.service";

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  socket: any;

  constructor(private authService: AuthService) {
    console.log("Before Connection")
    let connection_infos = this.authService.credentials
    console.log(connection_infos)
    // @ts-ignore
    this.socket = io(environment.BASE_URL, {query: `username=${connection_infos?.username}`}, {'multiplex': false});

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
