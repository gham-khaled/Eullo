import {Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {AuthService} from "./auth.service";
import {map} from "rxjs/operators";
import {ChatItem} from "../models/user.model";


@Injectable({
  providedIn: 'root'
})
export class ChatListService {
  private _currentUsername: string | undefined;
  constructor(private http: HttpClient, private authService: AuthService) {
    this._currentUsername = this.authService.credentials?.username;
  }

  private _chatItems = new BehaviorSubject<ChatItem[]>([
    {username: "douda", lastReceivedMessage: "Ouech", connected: true},
    {username: "sinda", lastReceivedMessage: "Salut!!", connected: false},
    {username: "sa", lastReceivedMessage: "Aa saa", connected: true},
    {username: "douda", lastReceivedMessage: "Ouech", connected: true},
    {username: "sinda", lastReceivedMessage: "Salut!!", connected: false},
    {username: "sa", lastReceivedMessage: "Aa saa", connected: true},
    {username: "douda", lastReceivedMessage: "Ouech", connected: true},
    {username: "sinda", lastReceivedMessage: "Salut!!", connected: false},
    {username: "sa", lastReceivedMessage: "Aa saa", connected: true}
  ]);
  readonly chatItems = this._chatItems.asObservable();
  loadChatItems() {
    this.http.get(`${environment.BASE_URL}/messages/${this._currentUsername}`)
      .pipe(
        map(items => {
          // @ts-ignore
          items = items.map(item => ({
            username: item.receiver === this._currentUsername ? item.sender : item.receiver,
            lastReceivedMessage: item.receiver === this._currentUsername ? item.encrypted_receiver : item.encrypted_sender,
            connected: item.connected
          }));
          return items;
        }))
      .subscribe(
        data => {
          console.log(data)
          // @ts-ignore
          this._chatItems.next(data);
        }, error => console.error("Couldn't load users")
      );
  }
}
