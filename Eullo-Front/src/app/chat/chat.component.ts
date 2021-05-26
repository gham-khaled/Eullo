import {Component, OnInit} from '@angular/core';
import {WebSocketService} from "../services/web-socket.service";
import {UserMessage} from "../models/user-message.interface";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  users: UserMessage[] | undefined
  selectedUser: UserMessage | undefined

  constructor(private webSocketService: WebSocketService) {
  }

  ngOnInit(): void {
    this.users = [
      {username: "sinda", lastReceivedMessage: "Salut!!", connected: false},
      {username: "Hazem", lastReceivedMessage: "Ouech", connected: true},
      {username: "sa", lastReceivedMessage: "Aa saa", connected: true},
    ]

    this.webSocketService.listen('message').subscribe((data) => {
      console.log(data)
    })


  }

  updateConversation(user: UserMessage) {
    this.selectedUser = user
  }

}
