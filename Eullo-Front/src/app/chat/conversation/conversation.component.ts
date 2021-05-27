import {
  Component,
  ComponentFactoryResolver,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {WebSocketService} from "../../services/web-socket.service";
import {Status} from "./message/status.enum";
import {MessageComponent} from "./message/message.component";
import {UserItem} from "../../models/user-item.interface";
import {AuthService} from "../../services/authentication/auth.service";
import {ChatService} from "../../services/chat.service";
import {Observable} from "rxjs";
import {Message} from "../../models/message.interface";
import {User} from "../../models/user.interface";

@Component({
  selector: 'app-conversation',
  templateUrl: './conversation.component.html',
  styleUrls: ['./conversation.component.css']
})
export class ConversationComponent implements OnInit {

  message: string = "";

  users: Observable<UserItem[]> | undefined

  @Output()
  newMessage = new EventEmitter<string>();

  conversation: Observable<Message[]> | undefined;

  partner: UserItem | undefined

  @ViewChild('messagesContainer', {read: ViewContainerRef})
  entry: ViewContainerRef | undefined;

  constructor(private resolver: ComponentFactoryResolver,
              private webSocketService: WebSocketService,
              private authService: AuthService,
              private chatService: ChatService) {
  }

  ngOnInit(): void {
    this.users = this.chatService.users;
    this.chatService.loadUsersItems();
    this.conversation = this.chatService.conversation;
    this.chatService.partner.subscribe(
      data => {
        this.chatService.loadConversation(data.username);
        this.partner = data;
      }
    )
  }

  setPartner(partner: UserItem) {
    this.chatService.setPartner(partner);
  }

  newMessageComponent() {
    const factory = this.resolver.resolveComponentFactory(MessageComponent);
    // @ts-ignore
    return this.entry.createComponent(factory);
  }

  sendMessage() {
    if (this.message){
      //get private key from local storage
      //encrypt message

      this.webSocketService.emit('message', {
        'body': this.message, // set this to the encrypted message
        'receiver': this.partner,
        'sender': this.authService.credentials?.username
      })
      const componentRef = this.newMessageComponent();
      componentRef.instance.message = this.message;
      componentRef.instance.status = "sent";
      this.newMessage.next(this.message);
      this.message = "";
    }
  }

  receiveMessage(message: string) {
    const componentRef = this.newMessageComponent();
    componentRef.instance.message = message;
    componentRef.instance.status = "received";
    // this.message = "";
  }
}
