import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {UserItem} from "../models/user-item.interface";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {AuthService} from "./authentication/auth.service";
import {map, retry} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private dataStore = {
    users: []
  }

  private _users = new BehaviorSubject<UserItem[]>([
    {username: "douda", lastReceivedMessage: "Ouech", connected: true},
    {username: "sinda", lastReceivedMessage: "Salut!!", connected: false},
    {username: "sa", lastReceivedMessage: "Aa saa", connected: true}
  ]);
  readonly users = this._users.asObservable();

  constructor(private http:HttpClient, private authService: AuthService) { }

  loadUsersItems(){
    const currentUsername: string | undefined = this.authService.credentials?.username;
    this.http.get(`${environment.BASE_URL}/messages/${currentUsername}`)
      .pipe(
        map(items => {
          // @ts-ignore
          items = items.map(item => ({
            username: item.receiver === currentUsername ? item.sender : item.receiver,
            lastReceivedMessage: item.receiver === currentUsername ? item.encrypted_receiver : item.encrypted_sender,
            connected: item.connected
          }));
          return items;
        }))
      .subscribe(
      data => {
        console.log(data)
        // @ts-ignore
        this.dataStore.users = data;
        this._users.next(Object.assign({},this.dataStore).users);
      }, error => console.error("Couldn't load users")
    );
  }

}
