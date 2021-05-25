import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {LoginComponent} from "./login/login.component";
import {RegisterComponent} from "./register/register.component";
import {ChatListComponent} from "./chat/chat-list/chat-list.component";
import {ConversationComponent} from "./chat/conversation/conversation.component";
import {ChatComponent} from "./chat/chat.component";
import {AuthGuard} from "./services/authentication/auth.guard";

const routes: Routes = [{
    path:'login',
    component:LoginComponent
  }, {
    path:'register',
    component: RegisterComponent
  },{
    path:'',
    component: ChatComponent,
    canActivate: [AuthGuard],
    pathMatch:'full'
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
