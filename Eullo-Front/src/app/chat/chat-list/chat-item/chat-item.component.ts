import {Component, Input, OnInit} from '@angular/core';
import {UserMessage} from "../../../models/user-message.interface";

@Component({
  selector: 'app-chat-item',
  templateUrl: './chat-item.component.html',
  styleUrls: ['./chat-item.component.css']
})
export class ChatItemComponent implements OnInit {

  @Input('user')
  user: UserMessage | undefined;


  constructor() {
  }

  ngOnInit(): void {
  }

}
