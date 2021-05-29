import {Injectable} from '@angular/core';
import {BehaviorSubject, of} from "rxjs";
import {UserItem} from "../models/user-item.interface";
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {AuthService} from "./auth.service";
import {map} from "rxjs/operators";
import {Message} from "../models/message.interface";
import * as forge from "node-forge";
import {logger} from "codelyzer/util/logger";

const pki = forge.pki
const rsa = pki.rsa;

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  constructor(private http: HttpClient, private authService: AuthService) {
  }

  private dataStore = {
    users: [],
    allUsers: [],
    conversation: []
  }

  private _currentUsername: string | undefined = this.authService.credentials?.username;

  private _users = new BehaviorSubject<UserItem[]>([
    {username: "douda", lastReceivedMessage: "Ouech", connected: true},
    {username: "sinda", lastReceivedMessage: "Salut!!", connected: false},
    {username: "sa", lastReceivedMessage: "Aa saa", connected: true}
  ]);
  private _allUsers = new BehaviorSubject<UserItem[]>([]);
  readonly users = this._users.asObservable();
  readonly allUser = this._allUsers.asObservable();

  loadAllUsers() {
    this.http.get(`${environment.BASE_URL}/users`).subscribe(
      data => {
        console.log(data)
        // @ts-ignore
        this.dataStore.allUsers = data;
        this._allUsers.next(Object.assign({}, this.dataStore).allUsers);
      }, error => console.error("Couldn't load users")
    );

  }

  loadUsersItems() {
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
          this.dataStore.users = data;
          this._users.next(Object.assign({}, this.dataStore).users);
        }, error => console.error("Couldn't load users")
      );
  }

  private _partner = new BehaviorSubject<UserItem>({connected: false, lastReceivedMessage: "", username: ""});
  readonly partner = this._partner.asObservable();

  setPartner(partner: UserItem) {
    this._partner.next(partner);
  }

  private _conversation = new BehaviorSubject<Message[]>([{message: "", status: ""}]);
  readonly conversation = this._conversation.asObservable();

  loadConversation(partner: string) {

    // @ts-ignore
    const private_key_pem = localStorage.getItem('priv_key')
    // @ts-ignore
    const private_key = pki.privateKeyFromPem(private_key_pem)
    let params = new HttpParams().set('partner', partner);
    this.http.get(`${environment.BASE_URL}/message/${this._currentUsername}`, {params: params})
      .pipe(
        map(data => {
          // @ts-ignore
          data = JSON.parse(data)
          console.log("In Loading conversation ", data)
          // @ts-ignore
          data.conversation.forEach(item => console.log(item.sender === this._currentUsername));
          // @ts-ignore

          const messages = data.conversation.map(message => ({
            message: message.sender === this._currentUsername ? private_key.decrypt(message.encrypted_sender) : private_key.decrypt(message.encrypted_receiver), // set the decrypted message here // figure out how to ge the public key of the other person
            // message: message.sender === this._currentUsername ? message.encrypted_sender : message.encrypted_receiver, // set the decrypted message here // figure out how to ge the public key of the other person
            status: message.sender === this._currentUsername ? "sent" : "received"
          }));
          // @ts-ignore
          return {'conversation': messages, 'certificate': data.certificate}
        })
      )
      .subscribe(data => {
        console.log(data);
        // @ts-ignore
        this.dataStore.conversation = data.conversation
        localStorage.setItem('partner', data.certificate)   // @ts-ignore
        this._conversation.next(Object.assign({}, this.dataStore).conversation);
      }, error => console.error(`Couldn't log conversation with partner: ${partner} ${error}`))
  }
  //function decrypt (encrypted message, key)
}
