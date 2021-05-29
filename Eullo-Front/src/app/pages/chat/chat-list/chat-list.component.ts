import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {WebSocketService} from "../../../services/web-socket.service";
import {UserItem} from "../../../models/user-item.interface";
import {ChatService} from "../../../services/chat.service";
import {Observable} from "rxjs";


@Component({
  selector: 'app-chat-list',
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.css']
})
export class ChatListComponent implements OnInit {

  users: Observable<UserItem[]> | undefined

  constructor(private chatService: ChatService) {
  }

  ngOnInit(): void {
    this.users = this.chatService.users;
    this.chatService.loadUsersItems();
  }

  showUser(user: UserItem) {
    if (!user) {
      console.log('here')
      this.chatService.setPartner({connected: false, lastReceivedMessage: "", username: ""});
    }
    else{
      this.chatService.setPartner(user);
    }

  }
}
