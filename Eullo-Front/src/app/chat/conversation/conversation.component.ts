import {Component, OnInit} from '@angular/core';
import {WebSocketService} from "../../services/web-socket.service";

@Component({
  selector: 'app-conversation',
  templateUrl: './conversation.component.html',
  styleUrls: ['./conversation.component.css']
})
export class ConversationComponent implements OnInit {

  constructor(private webSocketService: WebSocketService) {
  }

  ngOnInit(): void {
    this.webSocketService.listen('message').subscribe((data) => {
      console.log(data)
    })
  }

  send() {
    // Replace custom message by the message from the form
    this.webSocketService.emit('message', "custom message")
  }
}
