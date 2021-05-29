import {Component, Input, OnInit} from '@angular/core';
import {ChatItem} from "../../../../core/models/user.model";

@Component({
  selector: 'app-chat-item',
  templateUrl: './chat-item.component.html',
  styleUrls: ['./chat-item.component.css']
})
export class ChatItemComponent implements OnInit {

  @Input('user')
  user: ChatItem | undefined;


  constructor() {
  }

  ngOnInit(): void {
  }

}
