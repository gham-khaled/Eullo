import {
  Component,
  ComponentFactoryResolver,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {WebSocketService} from "../../../core/services/web-socket.service";
import {MessageComponent} from "./message/message.component";
import {AuthService} from "../../../core/services/auth.service";
import {Observable} from "rxjs";
import {Message} from "../../../core/models/message.model";
import {ChatItem, User} from "../../../core/models/user.model";
import * as forge from "node-forge";
import {ConversationService} from "../../../core/services/conversation.service";
import {CryptoService} from "../../../core/services/crypto.service";
import {ChatListService} from "../../../core/services/chat-list.service";

const pki = forge.pki
const rsa = pki.rsa;

@Component({
  selector: 'app-conversation',
  templateUrl: './conversation.component.html',
  styleUrls: ['./conversation.component.css']
})
export class ConversationComponent implements OnInit {

  message: string = "";

  users: Observable<ChatItem[]> | undefined
  allUsers: Observable<ChatItem[]> | undefined

  @Output()
  newMessage = new EventEmitter<string>();

  conversation: Observable<Message[]> | undefined;
  partner: ChatItem | undefined = {connected: false, lastReceivedMessage: "", username: ""};

  @ViewChild('messagesContainer', {read: ViewContainerRef})
  entry: ViewContainerRef | undefined;

  constructor(private resolver: ComponentFactoryResolver,
              private webSocketService: WebSocketService,
              private authService: AuthService,
              private cryptoService: CryptoService,
              private chatListService: ChatListService,
              private conversationService: ConversationService) {
  }

  ngOnInit(): void {
    this.conversation = this.conversationService.conversation;
    this.conversationService.partner.subscribe(
      partner => {
        this.partner = partner;
        if (!!partner.username)
          this.conversationService.loadConversation(partner.username);
      }
    )
    this.allUsers = this.conversationService.allUsers;
    this.conversationService.loadAllUsers();
  }

  setPartner(partner: ChatItem) {
    this.conversationService.setPartner(partner);
  }

  newMessageComponent() {
    const factory = this.resolver.resolveComponentFactory(MessageComponent);
    // @ts-ignore
    return this.entry.createComponent(factory);
  }

  sendMessage() {
    if (this.message) {
      const user = this.authService.credentials;
      const partner_certificate = localStorage.getItem('partner')
      let receiver_encrypted: string = "";
      let sender_encrypted: string = "";
      if (partner_certificate) {
        receiver_encrypted = this.cryptoService.encrypt(this.message, partner_certificate);
      }
      if (user) {
        sender_encrypted = this.cryptoService.encrypt(this.message, user?.certificate);
      }
      if (!!receiver_encrypted && !!sender_encrypted) {
        this.webSocketService.emit('message', JSON.stringify({
          'receiver_encrypted': receiver_encrypted,
          'sender_encrypted': sender_encrypted,
          'receiver': this.partner?.username,
          'sender': this.authService.credentials?.username
        }))
        const componentRef = this.newMessageComponent();
        componentRef.instance.message = this.message;
        componentRef.instance.status = "sent";
        this.chatListService.updateChatList(this.partner?.username, this.message )
      }
    }
  }

  receiveMessage(message: string) {
    console.log('Received A new Message')
    const componentRef = this.newMessageComponent();
    componentRef.instance.message = message;
    componentRef.instance.status = "received";
    // this.message = "";
  }
}
