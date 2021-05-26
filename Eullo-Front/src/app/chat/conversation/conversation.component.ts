import {Component, ComponentFactoryResolver, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {WebSocketService} from "../../services/web-socket.service";
import {Status} from "./message/status.enum";
import {MessageComponent} from "./message/message.component";

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

  @ViewChild('messagesContainer', {read: ViewContainerRef}) entry: ViewContainerRef | undefined;

  constructor(private resolver: ComponentFactoryResolver, private webSocketService: WebSocketService) {
  }

  ngOnInit(): void {
    // this.webSocketService.listen('message').subscribe((data) => {
    //   console.log(data)
    // })
  }

  newMessageComponent() {
    const factory = this.resolver.resolveComponentFactory(MessageComponent);
    // @ts-ignore
    return this.entry.createComponent(factory);
  }

  sendMessage() {
    // this.webSocketService.emit('message', this.message)
    const componentRef = this.newMessageComponent();
    componentRef.instance.message = this.message;
    componentRef.instance.status = "sent";
    this.message = "";
  }

  receiveMessage() {
    const componentRef = this.newMessageComponent();
    componentRef.instance.message = this.message;
    componentRef.instance.status = "received";
    // this.webSocketService.emit('message', this.message)
    this.message = "";
  }
}
