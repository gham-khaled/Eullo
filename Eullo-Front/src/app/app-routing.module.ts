import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {LoginComponent} from "./login/login.component";
import {RegisterComponent} from "./register/register.component";
import {ChatListComponent} from "./chat/chat-list/chat-list.component";
import {ConversationComponent} from "./chat/conversation/conversation.component";
import {ChatComponent} from "./chat/chat.component";

const routes: Routes = [{
  path:'',
  component: ChatComponent,
  pathMatch:'full'
},{
  path:'login',
  component:LoginComponent
}, {
  path:'register',
  component: RegisterComponent
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
