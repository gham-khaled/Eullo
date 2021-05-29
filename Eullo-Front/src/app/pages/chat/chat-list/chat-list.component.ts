import {Component, OnInit} from '@angular/core';
import {ChatListService} from "../../../core/services/chat-list.service";
import {Observable} from "rxjs";
import {ChatItem} from "../../../core/models/user.model";
import {ConversationService} from "../../../core/services/conversation.service";


@Component({
  selector: 'app-chat-list',
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.css']
})
export class ChatListComponent implements OnInit {

  chatItems: Observable<ChatItem[]> | undefined

  constructor(private chatListService: ChatListService, private conversationService: ConversationService) {
  }

  ngOnInit(): void {
    this.chatItems = this.chatListService.chatItems;
    this.chatListService.loadChatItems();
  }

  showUser(partner: ChatItem) {
    if (!partner) {
      this.conversationService.setPartner({connected: false, lastReceivedMessage: "", username: ""});
    }
    else{
      this.conversationService.setPartner(partner);
    }

  }
}
