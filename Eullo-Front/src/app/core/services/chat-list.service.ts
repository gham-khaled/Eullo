import {Injectable, Injector} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {AuthService} from "./auth.service";
import {map} from "rxjs/operators";
import {ChatItem} from "../models/user.model";
import {CryptoService} from "./crypto.service";


@Injectable()
export class ChatListService {
  private _currentUsername: string | undefined;

  constructor(private http: HttpClient, private authService: AuthService, private cryptoService: CryptoService) {
    this._currentUsername = this.authService.credentials?.username;
  }

  private _chatItems = new BehaviorSubject<ChatItem[]>([]);
  readonly chatItems = this._chatItems.asObservable();

  loadChatItems() {
    this.http.get(`${environment.BASE_URL}/messages/${this._currentUsername}`)
      .pipe(
        map(items => {
          // @ts-ignore
          items = items.map(item => ({
            username: item.receiver === this._currentUsername ? item.sender : item.receiver,
            lastReceivedMessage: item.receiver === this._currentUsername ? this.cryptoService.decrypt(item.encrypted_receiver) : this.cryptoService.decrypt(item.encrypted_sender),
            connected: item.connected
          }));
          return items;
        }))
      .subscribe(
        data => {
          // @ts-ignore
          this._chatItems.next(data);
        }, error => console.error(`Couldn't load users: ${error.message}`)
      );
  }
}
