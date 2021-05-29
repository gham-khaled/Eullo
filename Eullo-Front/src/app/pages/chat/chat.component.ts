import {Component, OnInit, ViewChild} from '@angular/core';
import {WebSocketService} from "../../core/services/web-socket.service";
import {UserItem} from "../../core/models/user-item.interface";
import {ConversationComponent} from "./conversation/conversation.component";
import {ChatService} from "../../core/services/chat.service";
import * as forge from "node-forge";
import {AuthService} from "../../core/services/auth.service";

const pki = forge.pki
const rsa = pki.rsa;

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  @ViewChild(ConversationComponent) activeConversation: ConversationComponent | undefined;

  users: UserItem[] | undefined;
  selectedUser: UserItem | undefined;


  constructor(private webSocketService: WebSocketService, private chatService: ChatService, private authService : AuthService) {
  }

  ngOnInit(): void {
    this.users = [
      {username: "douda", lastReceivedMessage: "Ouech", connected: true},
      {username: "sinda", lastReceivedMessage: "Salut!!", connected: false},
      {username: "sa", lastReceivedMessage: "Aa saa", connected: true}
    ]
    this.chatService.partner.subscribe(data => this.selectedUser = data)

    const private_key_pem = localStorage.getItem('priv_key')
    // @ts-ignore
    const private_key = pki.privateKeyFromPem(private_key_pem)

    // @ts-ignore
    this.webSocketService.listen('message').subscribe((message: any) => {
      console.log(message);
      console.log(typeof (message));
      // message = JSON.parse(message)
      // @ts-ignore
      let body = message.sender === this.authService.credentials?.username ? message.sender_encrypted : message.receiver_encrypted
      body = private_key.decrypt(body)
      console.log('Decrypted Message ', body)
      if (this.selectedUser?.username == message.sender)
        this.activeConversation?.receiveMessage(body);
      this.updateChatList(message.sender, body)
    })
  }

  // updateConversation(user: UserItem) {
  //   this.selectedUser = user
  // }

  updateChatList(username: string | undefined, body: string) {
    // @ts-ignore
    const index = this.users.findIndex(user => user.username === username);
    console.log(index)
    if (index == -1) { // @ts-ignore
      this.users?.splice(0, 0, {username: username, lastReceivedMessage: body, connected: true})
    } else {
      this.users?.splice(index, 1)
      // @ts-ignore
      this.users?.splice(0, 0, {username: username, lastReceivedMessage: body, connected: true})
    }
  }

}

interface Message {
  body: string;
  sender: string;
  receiver: string;
}

