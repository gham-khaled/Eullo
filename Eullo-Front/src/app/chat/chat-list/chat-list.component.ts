import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {WebSocketService} from "../../services/web-socket.service";
import {UserMessage} from "../../models/user-message.interface";
import {ChatService} from "../../services/chat.service";
import {Observable} from "rxjs";


@Component({
  selector: 'app-chat-list',
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.css']
})
export class ChatListComponent implements OnInit {

  users: Observable<UserMessage[]> | undefined

  @Output() selectConversation = new EventEmitter<UserMessage>();

  constructor(private chatService: ChatService) {
  }

  ngOnInit(): void {
    this.users = this.chatService.users;
    this.chatService.loadUsers();
  }

  showUser(user: UserMessage | null) {
    // @ts-ignore
    this.selectConversation.next(user)
  }
}
