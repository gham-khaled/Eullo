import {Component, ComponentFactoryResolver, Input, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {WebSocketService} from "../../services/web-socket.service";
import {Status} from "./message/status.enum";
import {MessageComponent} from "./message/message.component";
import {UserMessage} from "../../models/user-message.interface";
import {AuthService} from "../../services/authentication/auth.service";

@Component({
  selector: 'app-conversation',
  templateUrl: './conversation.component.html',
  styleUrls: ['./conversation.component.css']
})
export class ConversationComponent implements OnInit {

  message: string = "";
  // @ts-ignore
  messages: [{ message: string, status: string }] = [
    {message: "Sent message1", status: "sent"},
    {message: "Sent message2", status: "sent"},
    {message: "Received message1", status: "received"},
    {message: "Sent message3", status: "sent"},
    {message: "Received message2", status: "received"},
    {message: "Received message3", status: "received"},
  ]
  @Input()
  conversationUser: UserMessage | undefined
  @ViewChild('messagesContainer', {read: ViewContainerRef}) entry: ViewContainerRef | undefined;

  constructor(private resolver: ComponentFactoryResolver, private webSocketService: WebSocketService, private authService: AuthService) {
  }

  ngOnInit(): void {

  }

  newMessageComponent() {
    const factory = this.resolver.resolveComponentFactory(MessageComponent);
    // @ts-ignore
    return this.entry.createComponent(factory);
  }

  sendMessage() {

    this.webSocketService.emit('message', {
      'body': this.message,
      'receiver': this.conversationUser?.username,
      'sender': this.authService.credentials?.username
    })
    const componentRef = this.newMessageComponent();
    componentRef.instance.message = this.message;
    componentRef.instance.status = "sent";

    this.message = "";
  }

  receiveMessage(message: string) {
    const componentRef = this.newMessageComponent();
    componentRef.instance.message = message;
    componentRef.instance.status = "received";
    // this.message = "";
  }
}
