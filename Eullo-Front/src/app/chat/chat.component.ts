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

  constructor() {
  }

  ngOnInit(): void {
    this.users = [
      {username: "Sinda", lastReceivedMessage: "Salut!!", connected: false},
      {username: "Hazem", lastReceivedMessage: "Ouech", connected: true},
      {username: "Sa", lastReceivedMessage: "Aa saa", connected: true},
    ]

  }

  updateConversation(user: UserMessage) {
    this.selectedUser = user
  }

}
