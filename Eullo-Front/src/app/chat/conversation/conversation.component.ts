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

  typedMessage: string = "";
  messages:[{ message: string, status: string }] = [
    {message:"Sent message1", status: "sent"},
    {message:"Sent message2", status: "sent"},
    {message:"Received message1", status: "received"},
    {message:"Sent message3", status: "sent"},
    {message:"Received message2", status: "received"},
    {message:"Received message3", status: "received"},
  ]

  @ViewChild('messagesContainer', { read: ViewContainerRef }) entry: ViewContainerRef;
  constructor(private resolver: ComponentFactoryResolver) {}

  ngOnInit(): void {
    // this.webSocketService.listen('message').subscribe((data) => {
    //   console.log(data)
    // })
  }

  send() {
    if (this.typedMessage) {
      const componentRef = this.createMessageComponent();
      componentRef.instance.message = this.typedMessage;
      // Replace custom message by the message from the form
      // this.webSocketService.emit('message', "custom message")
      this.typedMessage = ""
    }
  }

  createMessageComponent() {
    const factory = this.resolver.resolveComponentFactory(MessageComponent);
    return this.entry.createComponent(factory);
  }
}
