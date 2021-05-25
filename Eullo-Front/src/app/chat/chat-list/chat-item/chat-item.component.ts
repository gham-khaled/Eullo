import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-chat-item',
  templateUrl: './chat-item.component.html',
  styleUrls: ['./chat-item.component.css']
})
export class ChatItemComponent implements OnInit {

  @Input('username')
  username: string="";

  @Input('lastReceivedMessage')
  lastReceivedMessage: string=``;

  @Input('connected')
  connected: boolean = false;
  constructor() { }

  ngOnInit(): void {
  }

}
