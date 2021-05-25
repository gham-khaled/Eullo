import {Component, OnInit} from '@angular/core';
import {WebSocketService} from "../../services/web-socket.service";

@Component({
  selector: 'app-chat-list',
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.css']
})
export class ChatListComponent implements OnInit {

  // @ts-ignore
  users:[{username: string; lastReceivedMessage:string; connected:boolean}] = [
    {username: "Sinda", lastReceivedMessage:"Salut!!", connected: false},
    {username: "Hazem", lastReceivedMessage:"Ouech", connected: true},
    {username: "Sa", lastReceivedMessage:"Aa saa", connected: true},
  ]

  constructor(private WebSocketService: WebSocketService) {
  }

  ngOnInit(): void {


  }

}
