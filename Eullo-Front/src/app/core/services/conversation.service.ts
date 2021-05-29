import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {AuthService} from "./auth.service";
import {BehaviorSubject} from "rxjs";
import {ChatItem} from "../models/user.model";
import {Message} from "../models/message.model";
import {environment} from "../../../environments/environment";
import {map} from "rxjs/operators";
import {CryptoService} from "./crypto.service";

@Injectable({
  providedIn: 'root'
})
export class ConversationService {
  private _currentUsername: string | undefined;
  constructor(private http: HttpClient, private authService: AuthService, private cryptoService: CryptoService) {
    this._currentUsername = this.authService.credentials?.username;
  }

  private _partner = new BehaviorSubject<ChatItem>({connected: false, lastReceivedMessage: "", username: ""});
  readonly partner = this._partner.asObservable();
  setPartner(partner: ChatItem) {
      this._partner.next(partner);
  }

  private _conversation = new BehaviorSubject<Message[]>([
    {message: "Message 1", status: "sent"},
    {message: "Message 2", status: "sent"},
    {message: "Message 3", status: "received"}
  ]);
  readonly conversation = this._conversation.asObservable();
  loadConversation(partner: string) {
    let params = new HttpParams().set('partner', partner);
    this.http.get<{conversation: [any], certificate: string}>(`${environment.BASE_URL}/message/${this._currentUsername}`, {params: params})
      .pipe(
        map(data => {
          // @ts-ignore
          data = JSON.parse(data);
          const messages = data.conversation.map(message => ({
            message: message.sender === this._currentUsername ? this.cryptoService.decrypt(message.encrypted_sender) : this.cryptoService.decrypt(message.encrypted_receiver),
            status: message.sender === this._currentUsername ? "sent" : "received"
          }));
          return {'conversation': messages, 'certificate': data.certificate}
        })
      )
      .subscribe(data => {
        localStorage.setItem('partner', data.certificate)
        this._conversation.next(data.conversation);
      }, error => console.error(`Couldn't log conversation with partner: ${partner} ${error.message}`))
  }

  private _allUsers = new BehaviorSubject<ChatItem[]>([]);
  readonly allUsers = this._allUsers.asObservable();
  loadAllUsers() {
    this.http.get<ChatItem[]>(`${environment.BASE_URL}/users`)
      // @ts-ignore
      .pipe(map(data => data.filter(item => item.username !== this._currentUsername)))
      .subscribe(
      data => {
        this._allUsers.next(data);
      },
        error => console.error(`Couldn't load users: ${error.message}`)
    );

  }
}
