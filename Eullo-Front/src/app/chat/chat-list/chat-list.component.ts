import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {WebSocketService} from "../../services/web-socket.service";
import {UserMessage} from "../../models/user-message.interface";



@Component({
  selector: 'app-chat-list',
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.css']
})
export class ChatListComponent implements OnInit {

  @Input()
  users: UserMessage[] | undefined

  @Output() selectConversation = new EventEmitter<UserMessage>();

  constructor() {
  }

  ngOnInit(): void {
    console.log(this.users)
  }

  showUser(user: UserMessage) {
    this.selectConversation.next(user)
  }
}
