import {Component, Input, OnInit} from '@angular/core';
import {WebSocketService} from "../../services/web-socket.service";

@Component({
  selector: 'app-chat-list',
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.css']
})
export class ChatListComponent implements OnInit {

  @Input()
    // @ts-ignore
  users: [{ username: string; lastReceivedMessage: string; connected: boolean }]

  constructor() {
  }

  ngOnInit(): void {

  }

}
