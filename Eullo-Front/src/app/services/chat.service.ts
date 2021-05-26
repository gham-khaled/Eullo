import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {UserMessage} from "../models/user-message.interface";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private dataStore = {
    users: []
  }

  private _users = new BehaviorSubject<UserMessage[]>([
    {username: "douda", lastReceivedMessage: "Ouech", connected: true},
    {username: "sinda", lastReceivedMessage: "Salut!!", connected: false},
    {username: "sa", lastReceivedMessage: "Aa saa", connected: true}
  ]);
  readonly users = this._users.asObservable();

  constructor(private http:HttpClient) { }

  loadUsers(){
    this.http.get(`${environment.BASE_URL}/users`).subscribe(
      data => {
        // this.dataStore.users = data;
        this._users.next(Object.assign({},this.dataStore).users);
      }, error => console.error("Couldn't load users")
    );
  }

}
