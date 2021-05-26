import {Component, OnInit} from '@angular/core';
import {WebSocketService} from "../services/web-socket.service";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  // @ts-ignore
  users:[{username: string; lastReceivedMessage:string; connected:boolean}] = [
    {username: "Sinda", lastReceivedMessage:"Salut!!", connected: false},
    {username: "Hazem", lastReceivedMessage:"Ouech", connected: true},
    {username: "Sa", lastReceivedMessage:"Aa saa", connected: true},
  ]
  constructor() {
  }

  ngOnInit(): void {

  }

}
