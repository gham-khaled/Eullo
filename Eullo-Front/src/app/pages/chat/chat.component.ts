import {Component, OnInit, ViewChild} from '@angular/core';
import {WebSocketService} from "../../core/services/web-socket.service";
import {ConversationComponent} from "./conversation/conversation.component";
import {ChatListService} from "../../core/services/chat-list.service";
import * as forge from "node-forge";
import {AuthService} from "../../core/services/auth.service";
import {ChatItem} from "../../core/models/user.model";
import {CryptoService} from "../../core/services/crypto.service";
import {ConversationService} from "../../core/services/conversation.service";

const pki = forge.pki
const rsa = pki.rsa;

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  @ViewChild(ConversationComponent) activeConversation: ConversationComponent | undefined;

  users: ChatItem[] | undefined;
  selectedUser: ChatItem | undefined;


  constructor(private webSocketService: WebSocketService,
              private cryptoService: CryptoService,
              private conversationService: ConversationService,
              private chatService: ChatListService,
              private authService : AuthService) {
  }

  ngOnInit(): void {
    this.users = []
    this.conversationService.partner.subscribe(data => this.selectedUser = data)
    this.webSocketService.listen('message').subscribe((message: any) => {
      let body = message.sender === this.authService.credentials?.username ? message.sender_encrypted : message.receiver_encrypted
      body = this.cryptoService.decrypt(body)
      console.log(this.selectedUser?.username)
      if (this.selectedUser?.username == message.sender)
        this.activeConversation?.receiveMessage(body);
      this.chatService.updateChatList(message.sender, body)
    })
  }



}

