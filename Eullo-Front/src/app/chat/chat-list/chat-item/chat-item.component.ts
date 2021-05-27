import {Component, Input, OnInit} from '@angular/core';
import {UserItem} from "../../../models/user-item.interface";

@Component({
  selector: 'app-chat-item',
  templateUrl: './chat-item.component.html',
  styleUrls: ['./chat-item.component.css']
})
export class ChatItemComponent implements OnInit {

  @Input('user')
  user: UserItem | undefined;


  constructor() {
  }

  ngOnInit(): void {
  }

}
