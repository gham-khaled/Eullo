import {Component, OnInit, ViewChild} from '@angular/core';
import {WebSocketService} from "../services/web-socket.service";
import {UserItem} from "../models/user-item.interface";
import {ConversationComponent} from "./conversation/conversation.component";
import {ChatService} from "../services/chat.service";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  @ViewChild(ConversationComponent) activeConversation: ConversationComponent | undefined;

  users: UserItem[] | undefined;
  selectedUser: UserItem | undefined ;


  constructor(private webSocketService: WebSocketService, private chatService: ChatService) {
  }

  ngOnInit(): void {
    this.users = [
      {username: "douda", lastReceivedMessage: "Ouech", connected: true},
      {username: "sinda", lastReceivedMessage: "Salut!!", connected: false},
      {username: "sa", lastReceivedMessage: "Aa saa", connected: true}
    ]
    this.chatService.partner.subscribe( data => this.selectedUser = data)

    // @ts-ignore
    this.webSocketService.listen('message').subscribe((message: Message) => {
      console.log(message);
      const {sender, receiver, body} = message
      console.log(this.selectedUser);
      if (this.selectedUser?.username == sender)
        this.activeConversation?.receiveMessage(body);
      this.updateChatList(sender, body)
    })
  }

  // updateConversation(user: UserItem) {
  //   this.selectedUser = user
  // }

  updateChatList(username: string | undefined, body: string) {
    // @ts-ignore
    const index = this.users.findIndex(user => user.username === username);
    console.log(index)
    if (index == -1) { // @ts-ignore
      this.users?.splice(0, 0, {username: username, lastReceivedMessage: body, connected: true})
    } else {
      this.users?.splice(index, 1)
      // @ts-ignore
      this.users?.splice(0, 0, {username: username, lastReceivedMessage: body, connected: true})
    }
  }

}

interface Message {
  body: string;
  sender: string;
  receiver: string;
}

