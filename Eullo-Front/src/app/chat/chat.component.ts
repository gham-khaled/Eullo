import {Component, OnInit} from '@angular/core';
import {WebSocketService} from "../services/web-socket.service";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  constructor() {
  }

  ngOnInit(): void {

  }

}
